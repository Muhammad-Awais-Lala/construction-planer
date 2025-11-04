
  
  import React, { useState } from 'react';
  import materialsData from '../data/materialPrices.json';
  
   const EstimateResult = ({ result, onConfirm }) => {
      const { materials } = result || {};
  
      const perFloor = Array.isArray(materials?.PerFloorBreakdown) ? materials.PerFloorBreakdown : null;
      const isMultiFloor = !!perFloor;
  
      // Initialize selected prices
      const buildInitialPrices = () => {
        if (isMultiFloor) {
          return perFloor.reduce((acc, floorObj, floorIdx) => {
            Object.keys(floorObj).forEach((key) => {
              if (key === 'Floor' || key === 'Materials Cost (PKR)') return;
              if (!materialsData[key]) return;
              const mapKey = `${floorIdx}:${key}`;
              acc[mapKey] = materialsData[key][0]?.price || 0;
            });
            return acc;
          }, {});
        }
        // single-floor fallback
        return Object.keys(materials)
          .filter((key) => materialsData[key])
          .reduce((acc, key) => {
            acc[key] = materialsData[key][0]?.price || 0;
            return acc;
          }, {});
      };
  
      const [selectedPrices, setSelectedPrices] = useState(buildInitialPrices());
  
      // Format number
      const formatNumber = (num) => num?.toLocaleString('en-PK', { maximumFractionDigits: 0 });
  
      // Handle change for any dropdown
      const handleSelectChange = (key, value) => {
        const material = key.split(':').pop();
        const selectedItem = materialsData[material].find((item) => item.name === value);
        setSelectedPrices((prev) => ({
          ...prev,
          [key]: selectedItem?.price || 0,
        }));
      };
  
      // Confirm: build summary and save
      const handleConfirm = () => {
        try {
          let materialsSummary = [];
          if (isMultiFloor) {
            materialsSummary = perFloor.reduce((acc, floorObj, floorIdx) => {
              Object.entries(floorObj).forEach(([material, quantity]) => {
                if (material === 'Floor' || material === 'Materials Cost (PKR)' || !materialsData[material]) return;
                const key = `${floorIdx}:${material}`;
                const unitPrice = selectedPrices[key] || 0;
                const totalPrice = unitPrice * quantity;
                acc.push({ floor: floorObj.Floor, material, quantity, unitPrice, totalPrice });
              });
              return acc;
            }, []);
          } else {
            materialsSummary = Object.entries(materials).reduce((acc, [material, quantity]) => {
              if (material === 'Materials Cost (PKR)' || !materialsData[material]) return acc;
              const unitPrice = selectedPrices[material] || 0;
              const totalPrice = unitPrice * quantity;
              acc.push({ material, quantity, unitPrice, totalPrice });
              return acc;
            }, []);
          }
  
          const totalMaterialsCost = materialsSummary.reduce((s, m) => s + (m.totalPrice || 0), 0);
          localStorage.setItem('constructionMaterials', JSON.stringify(materialsSummary));
          localStorage.setItem('constructionTotalMaterialsCost', String(Math.round(totalMaterialsCost)));
          if (typeof onConfirm === 'function') onConfirm();
        } catch (err) {
          console.error('Failed to confirm materials', err);
        }
      };

      // Helper to generate a friendly floor label for UI
      const getFloorLabel = (floorVal, idx) => {
        // If API returns 0 for ground floor, map to 'Ground Floor'
        if (floorVal === 0 || floorVal === '0') return 'Ground Floor';
        const num = Number(floorVal);
        if (!isNaN(num)) {
          // If API uses 1-based indexing differently, treat 1 as first floor label
          if (num === 1) return '1st Floor';
          if (num === 2) return '2nd Floor';
          if (num === 3) return '3rd Floor';
          return `${num}th Floor`;
        }
        // Fallback: use index (render order) and map 1 => Ground Floor
        const n = idx + 1;
        if (n === 1) return 'Ground Floor';
        if (n === 2) return '1st Floor';
        if (n === 3) return '2nd Floor';
        return `${n}th Floor`;
      };
  
      const renderFloorTable = (floorObj, floorIdx) => {
  const floorLabel = getFloorLabel(floorObj?.Floor, floorIdx);
        const entries = Object.entries(floorObj).filter(([m]) => m !== 'Floor' && m !== 'Materials Cost (PKR)' && materialsData[m]);
        const floorTotal = entries.reduce((sum, [material, qty]) => {
          const key = `${floorIdx}:${material}`;
          const price = selectedPrices[key] || 0;
          return sum + price * qty;
        }, 0);
  
        return (
          <div className="card shadow mb-4" key={`floor-card-${floorIdx}`}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 fs-5"><i className="bi bi-building me-2"></i>{floorLabel} Materials</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="fw-semibold">Material</th>
                      <th className="text-end fw-semibold">Quantity</th>
                      <th className="fw-semibold">Quality</th>
                      <th className="text-end fw-semibold">Total Price (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([material, quantity]) => {
                      const options = materialsData[material] || [];
                      const key = `${floorIdx}:${material}`;
                      const selectedPrice = selectedPrices[key] || 0;
                      const total = selectedPrice * quantity;
                      return (
                        <tr key={material}>
                          <td className="fw-semibold">{material}</td>
                          <td className="text-end">{formatNumber(quantity)}</td>
                          <td className="text-nowrap">
                            <select
                              className="form-select form-select-sm"
                              value={options.find((item) => item.price === selectedPrice)?.name || ''}
                              onChange={(e) => handleSelectChange(key, e.target.value)}
                            >
                              {options.map((opt, i) => (
                                <option key={i} value={opt.name}>{opt.name} — Rs. {opt.price}</option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end fw-bold">Rs. {formatNumber(Math.round(total))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-end mt-2">
                  <span className="fw-bold"><i className="bi bi-calculator me-2"></i>{floorLabel} Total: Rs. {formatNumber(Math.round(floorTotal))}</span>
                </div>
              </div>
            </div>
          </div>
        );
      };
  
      const renderSingleTable = () => {
        const entries = Object.entries(materials).filter(([m]) => m !== 'Materials Cost (PKR)' && materialsData[m]);
        const total = entries.reduce((sum, [material, qty]) => sum + (selectedPrices[material] || 0) * qty, 0);
        return (
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0 fs-5"><i className="bi bi-box-seam me-2"></i>Required Materials</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="fw-semibold">Material</th>
                      <th className="text-end fw-semibold">Quantity</th>
                      <th className="fw-semibold">Quality</th>
                      <th className="text-end fw-semibold">Total Price (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([material, quantity]) => {
                      const options = materialsData[material] || [];
                      const selectedPrice = selectedPrices[material] || 0;
                      const rowTotal = selectedPrice * quantity;
                      return (
                        <tr key={material}>
                          <td className="fw-semibold">{material}</td>
                          <td className="text-end">{formatNumber(quantity)}</td>
                          <td className='text-nowrap'>
                            <select
                              className="form-select form-select-sm"
                              value={options.find((item) => item.price === selectedPrice)?.name || ''}
                              onChange={(e) => handleSelectChange(material, e.target.value)}
                            >
                              {options.map((opt, i) => (
                                <option key={i} value={opt.name}>{opt.name} — Rs. {opt.price}</option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end fw-bold">Rs. {formatNumber(Math.round(rowTotal))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-end mt-3">
                  <h5 className="fw-bold fs-6"><i className="bi bi-calculator me-2"></i>Total Estimated Material Cost: Rs. {formatNumber(Math.round(total))}</h5>
                </div>
              </div>
            </div>
          </div>
        );
      };
  
      // overall totals display for multi-floor
      const overallSelectedTotal = isMultiFloor ? perFloor.reduce((s, floorObj, floorIdx) => {
        return s + Object.entries(floorObj).reduce((sum, [material, qty]) => {
          if (material === 'Floor' || material === 'Materials Cost (PKR)' || !materialsData[material]) return sum;
          const key = `${floorIdx}:${material}`;
          return sum + (selectedPrices[key] || 0) * qty;
        }, 0);
      }, 0) : 0;
  
      if (!result) return null;
      return (
        <div className="container py-5">
          <div className="row">
            <div className="col mb-4">
              {isMultiFloor ? (
                <>
                  {perFloor.map((floorObj, idx) => renderFloorTable(floorObj, idx))}
                  {/* <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                      <h3 className="card-title mb-0"><i className="bi bi-sum me-2"></i>Total Summary</h3>
                    </div>
                    <div className="card-body">
                      <div className="text-end">
                        <h5 className="fw-bold"><i className="bi bi-calculator me-2"></i>Total Estimated Material Cost: Rs. {formatNumber(Math.round(overallSelectedTotal))}</h5>
                      </div>
                    </div>
                  </div> */}
                </>
              ) : (
                renderSingleTable()
              )}
  
              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-success" onClick={handleConfirm}><i className="bi bi-check-lg me-1"></i> Confirm Materials</button>
              </div>
            </div>
          </div>
        </div>
      );
  };
  
  export default EstimateResult;







// import React, { useState, useEffect, useMemo } from 'react';
// import materialsData from '../data/materialPrices.json';

// const EstimateResult = ({ result, onConfirm }) => {
//     const { materials, floors_detail } = result;

//     // Extract actual materials from TotalSummary
//     const actualMaterials = useMemo(() => {
//           return materials?.TotalSummary || {};
//     }, [materials]);

//     // Extract per floor breakdown
//     const perFloorBreakdown = useMemo(() => {
//         return materials?.PerFloorBreakdown || [];
//     }, [materials]);

//     // Initialize selected prices for each floor and material
//     const initialFloorPrices = useMemo(() => {
//         const prices = {};
//         perFloorBreakdown.forEach((_, floorIndex) => {
//             prices[floorIndex] = {};
//             Object.keys(actualMaterials).forEach(material => {
//                 if (materialsData[material]) {
//                     prices[floorIndex][material] = materialsData[material][0]?.price || 0;
//                 }
//             });
//         });
//         return prices;
//     }, [perFloorBreakdown, actualMaterials]);

//     const [selectedFloorPrices, setSelectedFloorPrices] = useState(initialFloorPrices);

//     // Update prices when result changes
//     useEffect(() => {
//         if (result && actualMaterials) {
//             const newPrices = {};
//             perFloorBreakdown.forEach((_, floorIndex) => {
//                 newPrices[floorIndex] = {};
//                 Object.keys(actualMaterials).forEach(material => {
//                     if (materialsData[material]) {
//                         newPrices[floorIndex][material] = materialsData[material][0]?.price || 0;
//                     }
//                 });
//             });
//             setSelectedFloorPrices(newPrices);
//         }
//     }, [result, actualMaterials, perFloorBreakdown]);

//     // Function to get floor name based on floor number
//     const getFloorName = (floorNumber) => {
//         if (floorNumber === 1) return 'Ground Floor';
//         if (floorNumber === 2) return '1st Floor';
//         if (floorNumber === 3) return '2nd Floor';
//         if (floorNumber === 4) return '3rd Floor';
//         return `${floorNumber}th Floor`;
//     };

//     if (!result) {
//         return (
//             <div className="container py-3">
//                 <div className="alert alert-warning text-center border-0 rounded shadow-sm">
//                     <h5 className="fw-semibold mb-2">No Estimate Data Available</h5>
//                     <p className="mb-0 text-muted small">Please generate an estimate first.</p>
//                 </div>
//             </div>
//         );
//     }

//     // Format number with commas
//     const formatNumber = (num) => {
//         if (!num && num !== 0) return '0';
//         return num.toLocaleString('en-PK', { maximumFractionDigits: 0 });
//     };

//     // Handle quality change for specific floor and material
//     const handleQualityChange = (floorIndex, material, value) => {
//         const selectedItem = materialsData[material].find(item => item.name === value);
//         setSelectedFloorPrices(prev => ({
//             ...prev,
//             [floorIndex]: {
//                 ...prev[floorIndex],
//                 [material]: selectedItem?.price || 0
//             }
//         }));
//     };

//     // Get quantity with unit
//     const getQuantityWithUnit = (material, quantity) => {
//         const units = {
//             'Bricks': 'units',
//             'Cement': 'bags',
//             'Steel': 'kg',
//             'Sand': 'cft',
//             'Crush': 'cft',
//             'Tiles': 'sq ft',
//             'Paint': 'liters',
//             'Electrical': 'units',
//             'Plumbing': 'units',
//             'Wood': 'cft',
//             'Electrical_wiring': 'units',
//             'Plumbing_PVC': 'units'
//         };

//         const unit = units[material] || 'units';
//         return `${formatNumber(quantity)} ${unit}`;
//     };

//     // Calculate total cost for a specific floor
//     const calculateFloorCost = (floorIndex) => {
//         const floorMaterials = perFloorBreakdown[floorIndex];
//         if (!floorMaterials) return 0;
        
//         return Object.entries(floorMaterials).reduce((sum, [material, quantity]) => {
//             if (!materialsData[material]) return sum;
//             const price = selectedFloorPrices[floorIndex]?.[material] || 0;
//             return sum + price * quantity;
//         }, 0);
//     };

//     // Calculate total project cost
//     const calculateTotalProjectCost = () => {
//         return perFloorBreakdown.reduce((total, _, floorIndex) => {
//             return total + calculateFloorCost(floorIndex);
//         }, 0);
//     };

//     // Confirm materials
//     const handleConfirm = () => {
//         try {
//             const materialsSummary = [];
//             let totalMaterialsCost = 0;

//             perFloorBreakdown.forEach((floorMaterials, floorIndex) => {
//                 Object.entries(floorMaterials).forEach(([material, quantity]) => {
//                     if (!materialsData[material]) return;
                    
//                     const unitPrice = selectedFloorPrices[floorIndex]?.[material] || 0;
//                     const totalPrice = unitPrice * quantity;
                    
//                     materialsSummary.push({
//                         floor: floorIndex + 1,
//                         material,
//                         quantity,
//                         unit: getQuantityWithUnit(material, quantity).split(' ')[1],
//                         unitPrice,
//                         totalPrice
//                     });
                    
//                     totalMaterialsCost += totalPrice;
//                 });
//             });

//             // Store in localStorage
//             localStorage.setItem('constructionMaterials', JSON.stringify(materialsSummary));
//             localStorage.setItem('constructionTotalMaterialsCost', String(Math.round(totalMaterialsCost)));

//             if (floors_detail) {
//                 localStorage.setItem('constructionFloors', JSON.stringify(floors_detail));
//             }

//             if (typeof onConfirm === 'function') onConfirm();
//         } catch (err) {
//             console.error('Failed to confirm materials', err);
//         }
//     };

//     return (
//         <div className="container py-3">
//             <div className="row justify-content-center">
//                 <div className="col-12">
//                     <div className="card border-0 shadow-sm rounded">
//                         <div className="card-header bg-primary text-white py-3 rounded-top">
//                             <div className="d-flex align-items-center">
//                                 <div className="bg-white bg-opacity-20 rounded-circle p-1 me-2">
//                                     <i className="bi bi-calculator-fill fs-6"></i>
//                                 </div>
//                                 <div>
//                                     <h5 className="mb-1 fw-semibold">Construction Materials Estimate</h5>
//                                     <p className="mb-0 opacity-90 small">Select quality for each floor separately</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="card-body p-3">
//                             {/* Floors Configuration - Compact */}
//                             {floors_detail && floors_detail.length > 0 && (
//                                 <div className="mb-4">
//                                     <h6 className="mb-2 fw-semibold text-dark">
//                                         <i className="bi bi-building me-1 text-primary"></i>
//                                         Floors Configuration
//                                     </h6>
//                                     <div className="row g-2">
//                                         {floors_detail.map((floor, index) => (
//                                             <div key={index} className="col-md-6 col-lg-3">
//                                                 <div className="card border h-100">
//                                                     <div className="card-header bg-light py-2">
//                                                         <h6 className="mb-0 fw-semibold text-dark small">
//                                                             {getFloorName(floor.floorNumber)}
//                                                         </h6>
//                                                     </div>
//                                                     <div className="card-body p-2">
//                                                         <div className="row g-1 small">
//                                                             <div className="col-6 text-muted">Bedrooms</div>
//                                                             <div className="col-6 fw-semibold text-end">{floor.bedrooms}</div>
//                                                             <div className="col-6 text-muted">Bathrooms</div>
//                                                             <div className="col-6 fw-semibold text-end">{floor.bathrooms}</div>
//                                                             <div className="col-6 text-muted">Kitchens</div>
//                                                             <div className="col-6 fw-semibold text-end">{floor.kitchens}</div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Per Floor Materials with Quality Selection - Compact */}
//                             {perFloorBreakdown.length > 0 && (
//                                 <div className="mb-3">
//                                     <h6 className="mb-2 fw-semibold text-dark">
//                                         <i className="bi bi-diagram-3 me-1 text-success"></i>
//                                         Materials Breakdown by Floor
//                                     </h6>
                                    
//                                     {perFloorBreakdown.map((floorMaterials, floorIndex) => (
//                                         <div key={floorIndex} className="card border-0 shadow-sm mb-3">
//                                             <div className="card-header bg-light py-2">
//                                                 <div className="d-flex justify-content-between align-items-center">
//                                                     <h6 className="mb-0 fw-semibold text-dark small">
//                                                         <i className="bi bi-building me-1"></i>
//                                                         {getFloorName(floorIndex + 1)} - Materials & Quality Selection
//                                                     </h6>
//                                                     <span className="badge bg-primary small">
//                                                         Rs. {formatNumber(Math.round(calculateFloorCost(floorIndex)))}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                             <div className="card-body p-0">
//                                                 <div className="table-responsive">
//                                                     <table className="table table-sm table-hover align-middle mb-0">
//                                                         <thead className="table-light">
//                                                             <tr>
//                                                                 <th className="ps-3 fw-semibold py-2 small" style={{width: '20%'}}>Material</th>
//                                                                 <th className="text-end fw-semibold py-2 small" style={{width: '15%'}}>Quantity</th>
//                                                                 <th className="fw-semibold py-2 small" style={{width: '45%'}}>Quality</th>
//                                                                 <th className="text-end pe-3 fw-semibold py-2 small" style={{width: '20%'}}>Cost</th>
//                                                             </tr>
//                                                         </thead>
//                                                         <tbody>
//                                                             {Object.entries(floorMaterials).map(([material, quantity]) => {
//                                                                 if (!materialsData[material]) return null;
                                                                
//                                                                 const materialOptions = materialsData[material];
//                                                                 const selectedPrice = selectedFloorPrices[floorIndex]?.[material] || 0;
//                                                                 const total = selectedPrice * quantity;
//                                                                 const quantityWithUnit = getQuantityWithUnit(material, quantity);

//                                                                 return (
//                                                                     <tr key={material} className="border-top">
//                                                                         <td className="ps-3 py-1">
//                                                                             <span className="fw-medium text-dark small">{material}</span>
//                                                                         </td>
//                                                                         <td className="text-end py-1">
//                                                                             <span className="text-dark small">
//                                                                                 {quantityWithUnit}
//                                                                             </span>
//                                                                         </td>
//                                                                         <td className="py-1">
//                                                                             <select
//                                                                                 className="form-select form-select-sm"
//                                                                                 value={materialOptions.find(item => item.price === selectedPrice)?.name || ''}
//                                                                                 onChange={(e) => handleQualityChange(floorIndex, material, e.target.value)}
//                                                                             >
//                                                                                 {materialOptions.map((opt, optIndex) => (
//                                                                                     <option key={optIndex} value={opt.name} className="small">
//                                                                                         {opt.name} — Rs. {formatNumber(opt.price)}
//                                                                                     </option>
//                                                                                 ))}
//                                                                             </select>
//                                                                         </td>
//                                                                         <td className="text-end pe-3 py-1">
//                                                                             <span className="fw-bold text-success small">
//                                                                                 Rs. {formatNumber(Math.round(total))}
//                                                                             </span>
//                                                                         </td>
//                                                                     </tr>
//                                                                 );
//                                                             })}
//                                                         </tbody>
//                                                     </table>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}

//                                     {/* Individual Floor Costs Summary */}
//                                     <div className="row g-2 mb-3">
//                                         <div className="col-12">
//                                             <h6 className="fw-semibold text-dark mb-2 small">Individual Floor Costs:</h6>
//                                             <div className="row g-2">
//                                                 {perFloorBreakdown.map((_, floorIndex) => (
//                                                     <div key={floorIndex} className="col-md-4 col-lg-3">
//                                                         <div className="card border bg-light">
//                                                             <div className="card-body py-2 text-center">
//                                                                 <h6 className="mb-1 fw-semibold text-dark small">
//                                                                     {getFloorName(floorIndex + 1)}
//                                                                 </h6>
//                                                                 <div className="fw-bold text-primary">
//                                                                     Rs. {formatNumber(Math.round(calculateFloorCost(floorIndex)))}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Total Project Cost */}
//                                     <div className="card border-0 bg-gradient-primary text-white">
//                                         <div className="card-body py-3">
//                                             <div className="row align-items-center">
//                                                 <div className="col">
//                                                     <h6 className="mb-1 fw-semibold">Total Project Material Cost</h6>
//                                                     <p className="mb-0 opacity-90 small">Sum of all floors with selected qualities</p>
//                                                 </div>
//                                                 <div className="col-auto">
//                                                     <h5 className="mb-0 fw-bold">
//                                                         Rs. {formatNumber(Math.round(calculateTotalProjectCost()))}
//                                                     </h5>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Confirm Button */}
//                             <div className="text-center pt-3">
//                                 <button 
//                                     className="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm"
//                                     onClick={handleConfirm}
//                                     disabled={!actualMaterials || Object.keys(actualMaterials).length === 0}
//                                 >
//                                     <i className="bi bi-check-circle-fill me-2"></i>
//                                     Confirm Materials & Continue
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EstimateResult;



