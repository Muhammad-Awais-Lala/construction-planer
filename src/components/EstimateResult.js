

import React, { useEffect, useState } from 'react';
import materialsData from '../data/materialPrices.json';

const EstimateResult = ({ result, onConfirm, stepper }) => {
  const { materials } = result || {};

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

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
        <div className="card-header bg-light text-center">
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
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white p-3">
          {stepper}
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col mb-4">
              {isMultiFloor ? (
                <>
                  {perFloor.map((floorObj, idx) => renderFloorTable(floorObj, idx))}
                </>
              ) : (
                renderSingleTable()
              )}

              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-primary btn-rounded" onClick={handleConfirm}><i className="bi bi-check-lg me-1"></i> Confirm Materials</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateResult;
