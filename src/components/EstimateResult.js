import React, { useState } from 'react';
import materialsData from '../data/materialPrices.json';

const EstimateResult = ({ result, onConfirm }) => {
    
    const { materials, cost } = result;

    console.log('Materials:', materials);
    // Initialize selected prices dynamically for each material type
    const initialPrices = Object.keys(materials)
    .filter((key) => materialsData[key]) // only include materials available in data
    .reduce((acc, key) => {
        acc[key] = materialsData[key][0]?.price || 0;
        return acc;
    }, {});

    const [selectedPrices, setSelectedPrices] = useState(initialPrices);
    
    if (!result) return null;


  // Format number with commas for better readability
  const formatNumber = (num) =>
    num?.toLocaleString('en-PK', { maximumFractionDigits: 0 });

  // Handle change for any dropdown
  const handleSelectChange = (material, value) => {
    const selectedItem = materialsData[material].find(
      (item) => item.name === value
    );
    setSelectedPrices((prev) => ({
      ...prev,
      [material]: selectedItem?.price || 0,
    }));
  };

  // Confirm materials: compute per-material totals and save to localStorage
  const handleConfirm = () => {
    try {
      const materialsSummary = Object.entries(materials).reduce((acc, [material, quantity]) => {
        if (material === 'Materials Cost (PKR)' || !materialsData[material]) return acc;
        const unitPrice = selectedPrices[material] || 0;
        const totalPrice = unitPrice * quantity;
        acc.push({ material, quantity, unitPrice, totalPrice });
        return acc;
      }, []);

      const totalMaterialsCost = materialsSummary.reduce((s, m) => s + (m.totalPrice || 0), 0);

      // Store in localStorage
      localStorage.setItem('constructionMaterials', JSON.stringify(materialsSummary));
      localStorage.setItem('constructionTotalMaterialsCost', String(Math.round(totalMaterialsCost)));

      // call parent callback to advance stepper
      if (typeof onConfirm === 'function') onConfirm();
    } catch (err) {
      console.error('Failed to confirm materials', err);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0"><i className="bi bi-box-seam me-2"></i>Required Materials</h3>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                    <tr>
                      <th><i className="bi bi-card-list me-1"></i>Material</th>
                      <th className="text-end"><i className="bi bi-basket me-1"></i>Quantity</th>
                      <th><i className="bi bi-award me-1"></i>Quality</th>
                      <th className="text-end">Total Price (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(materials).map(([material, quantity]) => {
                      // Skip invalid or non-material keys
                      if (material === 'Materials Cost (PKR)' || !materialsData[material]) return null;

                      const options = materialsData[material];
                      const selectedPrice = selectedPrices[material] || 0;
                      const total = selectedPrice * quantity;

                      return (
                        <tr key={material}>
                          <td className="fw-semibold">{material}</td>
                          <td className="text-end">{formatNumber(quantity)}</td>
                          <td className='text-nowrap' style={{width:""}}>
                            <select
                              className="form-select form-select-sm"
                              value={
                                options.find(
                                  (item) => item.price === selectedPrice
                                )?.name || ''
                              }
                              onChange={(e) =>
                                handleSelectChange(material, e.target.value)
                              }
                            >
                              {options.map((opt, i) => (
                                <option key={i} value={opt.name}>
                                  {opt.name} — Rs. {opt.price}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end fw-bold">
                            Rs. {formatNumber(Math.round(total))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Optional total display */}
                
                    <div className="text-end mt-3">
                    <h5 className="fw-bold"><i className="bi bi-calculator me-2"></i>
                      {/* Total Estimated Cost: Rs. {formatNumber(materials['Materials Cost (PKR)'])} */}
                    Total Estimated Material Cost: Rs. {formatNumber(Math.round(Object.entries(materials).reduce((sum, [material, quantity]) => {
                        if (material === 'Materials Cost (PKR)' || !materialsData[material]) return sum;
                        return sum + (selectedPrices[material] || 0) * quantity;
                    }, 0)))}

                    </h5>
                  </div>                  <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-success" onClick={handleConfirm}><i className="bi bi-check-lg me-1"></i> Confirm Materials
                    </button>
                  </div>
            
              </div>
            </div>
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

