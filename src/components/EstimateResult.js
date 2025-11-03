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

    const renderFloorTable = (floorObj, floorIdx) => {
      const floorLabel = floorObj?.Floor ?? floorIdx + 1;
      const entries = Object.entries(floorObj).filter(([m]) => m !== 'Floor' && m !== 'Materials Cost (PKR)' && materialsData[m]);
      const floorTotal = entries.reduce((sum, [material, qty]) => {
        const key = `${floorIdx}:${material}`;
        const price = selectedPrices[key] || 0;
        return sum + price * qty;
      }, 0);

      return (
        <div className="card shadow mb-4" key={`floor-card-${floorIdx}`}>
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0"><i className="bi bi-building me-2"></i>Floor {floorLabel} Materials</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Material</th>
                    <th className="text-end">Quantity</th>
                    <th>Quality</th>
                    <th className="text-end">Total Price (Rs.)</th>
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
                <span className="fw-bold"><i className="bi bi-calculator me-2"></i>Floor {floorLabel} Total: Rs. {formatNumber(Math.round(floorTotal))}</span>
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
            <h3 className="card-title mb-0"><i className="bi bi-box-seam me-2"></i>Required Materials</h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Material</th>
                    <th className="text-end">Quantity</th>
                    <th>Quality</th>
                    <th className="text-end">Total Price (Rs.)</th>
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
                <h5 className="fw-bold"><i className="bi bi-calculator me-2"></i>Total Estimated Material Cost: Rs. {formatNumber(Math.round(total))}</h5>
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
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="card-title mb-0"><i className="bi bi-sum me-2"></i>Total Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="text-end">
                      <h5 className="fw-bold"><i className="bi bi-calculator me-2"></i>Total Estimated Material Cost: Rs. {formatNumber(Math.round(overallSelectedTotal))}</h5>
                    </div>
                  </div>
                </div>
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























// import React, { useState } from 'react';
// import materialsData from '../data/materialPrices.json'

// const EstimateResult = ({ result }) => {
//     const [selectedBrickPrice, setSelectedBrickPrice] = useState(materialsData.Bricks[0].price);
//     const [selectedCementPrice, setSelectedCementPrice] = useState(materialsData.Cement[0].price);
//     const [selectedCrushPrice, setSelectedCrushPrice] = useState(materialsData.Crush[0].price);
    
//     if (!result) return null;

//     const { materials, cost, plan, designs } = result;
    
//     // Format number with commas for better readability
//     const formatNumber = (num) => {
//         return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     };
    
//     return (
//         <div className="container py-5">
//             <div className="row">
//                 {/* Materials Table */}
//                 <div className="col mb-4">
//                     <div className="card shadow">
//                         <div className="card-header bg-primary text-white">
//                             <h3 className="card-title mb-0">Required Materials</h3>
//                         </div>
//                         <div className="card-body">
//                             <div className="table-responsive">
//                                 <table className="table table-hover">
//                                     <thead className="table-light">
//                                         <tr>
//                                             <th>Material</th>
//                                             <th className="">Quantity</th>
//                                             <th className="">Quality</th>
//                                             <th className="">Price</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {/* {Object.entries(materials).map(([material, value]) => (
//                                                               <tr key={material}>
//                                                                 <td>{material}</td>
//                                                                 <td className="text-end">{typeof value === 'number' ? formatNumber(value) : value}</td>
//                                                               </tr>
//                                                             ))} */}

//                                         <tr>
//                                             <td>Bricks (Units)</td>
//                                             <td>{materials.Bricks}</td>
//                                             <td>
//                                                 <select
//                                                     className="form-select"
//                                                     onChange={(e) => {
//                                                         const selectedBrick = materialsData.Bricks.find(
//                                                             brick => brick.name === e.target.value
//                                                         );
//                                                         setSelectedBrickPrice(selectedBrick.price);
//                                                     }}
//                                                 >
//                                                     {
//                                                         materialsData.Bricks.map((brick, index) => (
//                                                             <option key={index} value={brick.name}>{brick.name} - Rs. {brick.price}</option>
//                                                         ))
//                                                     }
//                                                 </select>
//                                             </td>
//                                             <td className='fw-bold'>Rs. {formatNumber(Math.round(selectedBrickPrice * materials.Bricks))}</td>
//                                         </tr>

//                                         <tr>
//                                             <td>Cement (sack)</td>
//                                             <td>{materials.Cement}</td>
//                                             <td>
//                                                 <select
//                                                     className="form-select"
//                                                     onChange={(e) => {
//                                                         const selectedCement = materialsData.Cement.find(
//                                                             cement => cement.name === e.target.value
//                                                         );
//                                                         setSelectedCementPrice(selectedCement.price);
//                                                     }}
//                                                 >
//                                                     {
//                                                         materialsData.Cement.map((cementtype, index) => (
//                                                             <option key={index} value={cementtype.name}>{cementtype.name} - Rs. {cementtype.price}</option>
//                                                         ))
//                                                     }
//                                                 </select>
//                                             </td>
//                                             <td className='fw-bold'>Rs. {formatNumber(Math.round(selectedCementPrice * materials.Cement))}</td>
//                                         </tr>
//                                         <tr>
//                                             <td>Crushed Stone (ton)</td>
//                                             <td>{materials.Crush}</td>
//                                             <td>
//                                                 <select
//                                                     className="form-select"
//                                                     onChange={(e) => {
//                                                         const selectedCrush = materialsData.Crush.find(
//                                                             crush => crush.name === e.target.value
//                                                         );
//                                                         setSelectedCrushPrice(selectedCrush.price);
//                                                     }}
//                                                 >
//                                                     {
//                                                         materialsData.Crush.map((crushType, index) => (
//                                                             <option key={index} value={crushType.name}>{crushType.name} - Rs. {crushType.price}</option>
//                                                         ))
//                                                     }
//                                                 </select>
//                                             </td>
//                                             <td className='fw-bold'>Rs. {formatNumber(Math.round(selectedCrushPrice * materials.Crush))}</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EstimateResult;

