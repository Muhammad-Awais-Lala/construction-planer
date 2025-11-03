import React from 'react';

const Report = ({ result }) => {
    if (!result) return null;

    const { cost, finishing, designs, plan } = result;
    const totalMaterialsCost = parseFloat(localStorage.getItem('constructionTotalMaterialsCost') || '0');
    const labourCost = cost?.labour_cost || 0;
    const grayStructureCost = totalMaterialsCost + labourCost;
    const totalCost = grayStructureCost + (cost?.finishing_cost || 0);

    // Helper function to get appropriate icon for each category
    const getCategoryIcon = (category) => {
        const iconMap = {
            'Flooring': 'grid-3x3-gap',
            'Paint': 'brush',
            'Kitchen': 'house-door',
            'Windows': 'window',
            'Doors': 'door-closed',
            'Electrical Fittings': 'lightning-charge',
            'Bath Fittings': 'water'
        };
        return iconMap[category] || 'square';
    };

    console.log('finishing.material_guide:', finishing?.material_guide);

    return (
        <div className="container py-5">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0 fs-4"><i className="bi bi-file-earmark-text me-2"></i>Detailed Construction Report</h3>
                </div>
                <div className="card-body">
                    {/* Cost Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="card shadow-lg h-100" style={{ backgroundColor: "#fca311" }}>
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted mb-3 fs-6"><i className="bi bi-building me-1"></i>Grey Structure Cost</h6>
                                    <h3 className="card-text text-primary mb-0 fs-4">
                                        {/* Rs. {   totalMaterialsCost + cost?.labour_cost  || '0'} */}
                                        {/* {totalMaterialsCost && cost?.labour_cost ?
                                            `Rs. ${(totalMaterialsCost + cost.labour_cost).toLocaleString()}`
                                            :
                                            'Rs. 0'
                                        } */}
                                        Rs. {grayStructureCost.toLocaleString() || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card shadow-lg bg-success h-100">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted mb-3 fs-6"><i className="bi bi-brush me-1"></i>Finishing Cost</h6>
                                    <h3 className="card-text text-white mb-0 fs-4">
                                        Rs. {cost?.finishing_cost?.toLocaleString() || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card shadow bg-primary h-100">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-white mb-3 fs-6"><i className="bi bi-calculator me-1"></i>Total Cost</h6>
                                    <h3 className="card-text text-white mb-0 fs-4">
                                        {/* Rs. {cost?.total_cost?.toLocaleString() || '0'} */}
                                        {`Rs. ${totalCost.toLocaleString() || '0'}`}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Plan Details */}
                        <div className="col-12 mb-4">
                            <div className="card shadow p-2">
                                <div className="card-header bg-light">
                                    <h4 className="mb-0 fs-5"><i className="bi bi-layout-text-sidebar me-2"></i>Building Plan Details</h4>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm align-middle">
                                            <tbody>
                                                {Object.entries(plan).map(([key, value]) => (
                                                    <tr key={key}>
                                                        <th style={{ width: '30%' }} className="bg-light text-primary small text-uppercase">{key}</th>
                                                        <td>{Array.isArray(value) ? value.join(', ') : value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Details Section */}
                        <div className="col-12 mb-4">
                            <div className="table-responsive card shadow p-2">
                                <div className="card-header bg-light">
                                    <h4 className="fs-5">Material Cost Breakdown</h4>
                                </div>
                                <table className="table table-sm table-hover">
                                    <thead className="">
                                        <tr className="small text-uppercase text-muted">
                                            <th className="fw-semibold">Material</th>
                                            <th className="text-end fw-semibold">Quantity</th>
                                            <th className="text-end fw-semibold">Unit Price (Rs.)</th>
                                            <th className="text-end fw-semibold">Total Price (Rs.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            try {
                                                const materialsData = JSON.parse(localStorage.getItem('constructionMaterials'));
                                                const hasFloors = Array.isArray(materialsData) && materialsData.some(it => typeof it.floor !== 'undefined');
                                                if (hasFloors) {
                                                    // group by floor and render heading rows
                                                    const floors = Array.from(new Set(materialsData.map(it => it.floor))).sort((a, b) => (a ?? 0) - (b ?? 0));
                                                    return (
                                                        <>
                                                            {floors.map((floorVal) => (
                                                                <React.Fragment key={`floor-${floorVal}`}>
                                                                    <tr className="table-primary">
                                                                        <td colSpan="4" className="fw-bold">
                                                                            <i className="bi bi-building me-2"></i>{(floorVal === 0 || floorVal === '0') ? 'Ground Floor' : `Floor ${floorVal}`} Materials
                                                                        </td>
                                                                    </tr>
                                                                    {materialsData.filter(it => it.floor === floorVal).map((item, idx) => (
                                                                        <tr key={`f${floorVal}-${idx}`}>
                                                                            <td>{item.material}</td>
                                                                            <td className="text-end">{item.quantity.toLocaleString()}</td>
                                                                            <td className="text-end">{item.unitPrice.toLocaleString()}</td>
                                                                            <td className="text-end">{Math.round(item.totalPrice).toLocaleString()}</td>
                                                                        </tr>
                                                                    ))}
                                                                </React.Fragment>
                                                            ))}
                                                            <tr className="table-success fw-bold">
                                                                <td colSpan="3" className="text-end">Total Materials Cost:</td>
                                                                <td className="text-end">Rs. {Math.round(totalMaterialsCost).toLocaleString()}</td>
                                                            </tr>
                                                        </>
                                                    );
                                                }

                                                // single-floor default
                                                return (
                                                    <>
                                                        {materialsData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.material}</td>
                                                                <td className="text-end">{item.quantity.toLocaleString()}</td>
                                                                <td className="text-end">{item.unitPrice.toLocaleString()}</td>
                                                                <td className="text-end">{Math.round(item.totalPrice).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="table-success fw-bold">
                                                            <td colSpan="3" className="text-end">Total Materials Cost:</td>
                                                            <td className="text-end">Rs. {Math.round(totalMaterialsCost).toLocaleString()}</td>
                                                        </tr>
                                                    </>
                                                );
                                            } catch (err) {
                                                console.error('Error loading materials data:', err);
                                                return (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted">
                                                            Please select materials Quality in previous step.
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Grey Structure Cost Breakdown */}
                        <div className="col-12 mb-4">
                            <div className="card shadow p-2">
                                <div className="card-header bg-light">
                                    <h4 className="mb-0 fs-5"><i className="bi bi-stack me-2"></i>Grey Structure Cost Breakdown</h4>
                                </div>
                                <div className="card-body">
                                    <div className="receipt">
                                        <div className="row border-bottom py-2">
                                            <div className="col-8">Labour Cost</div>
                                            <div className="col-4 text-end">Rs. {labourCost.toLocaleString()}</div>
                                        </div>
                                        <div className="row border-bottom py-2">
                                            <div className="col-8">Materials Cost</div>
                                            <div className="col-4 text-end">Rs. {totalMaterialsCost.toLocaleString()}</div>
                                        </div>
                                        <div className="row py-2 bg-light">
                                            <div className="col-8 fw-bold">Total Grey Structure Cost</div>
                                            <div className="col-4 text-end fw-bold">Rs. {grayStructureCost.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Cost Breakdown */}
                        <div className="col-12 mb-4">
                            <div className="card shadow p-2">
                                <div className="card-header bg-light">
                                    <h4 className="mb-0 fs-5"><i className="bi bi-calculator me-2"></i>Total Project Cost Breakdown</h4>
                                </div>
                                <div className="card-body">
                                    <div className="receipt">
                                        <div className="row border-bottom py-2">
                                            <div className="col-8">Grey Structure Cost</div>
                                            <div className="col-4 text-end">Rs. {grayStructureCost.toLocaleString()}</div>
                                        </div>
                                        <div className="row border-bottom py-2">
                                            <div className="col-8">Finishing Cost</div>
                                            <div className="col-4 text-end">Rs. {(cost?.finishing_cost || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="row py-2 bg-primary text-white">
                                            <div className="col-8 fw-bold">Total Project Cost</div>
                                            <div className="col-4 text-end fw-bold">Rs. {totalCost.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Finishing Materials Guide */}
                        {finishing?.material_guide && (
                            <div className="col-12 mb-4">
                                <div className="card shadow p-2">
                                    <div className="card-header bg-light">
                                        <h4 className="mb-0">
                                            <i className="bi bi-tools me-2"></i>
                                            Finishing Materials Guide
                                        </h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-4">
                                            {finishing.material_guide.map((item, index) => (
                                                <div key={index} className="col-md-6 col-lg-4">
                                                    <div className="card h-100 border-0 shadow-sm">
                                                        <div className="card-body">
                                                            <div className="d-flex align-items-center mb-3">
                                                                <i className={`bi bi-${getCategoryIcon(item.category)} fs-4 text-primary me-2`}></i>
                                                                <h5 className="card-title mb-0 text-primary fs-6">{item.category}</h5>
                                                            </div>
                                                            <h6 className="text-muted mb-2 fs-6">{item.material_type}</h6>
                                                            <p className="card-text small">
                                                                <i className="bi bi-info-circle me-2 text-info"></i>
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendations Section */}
                        {/* <div className="col-12">
              <div className="alert alert-info">
                <h5 className="alert-heading">Recommendations</h5>
                <p>Based on your requirements, we recommend:</p>
                <ul>
                  <li>Consider energy-efficient windows and doors</li>
                  <li>Plan for future expansion possibilities</li>
                  <li>Include proper ventilation systems</li>
                  <li>Ensure adequate water storage capacity</li>
                </ul>
              </div>
            </div> */}

                        {/* <div className="col-12 mb-4">
                            <h4>Design Recommendations</h4>

                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        {designs.map((design, index) => (
                                            <div key={index} className="col-md-4 mb-3">
                                                <div className="card shadow h-100">
                                                    <div className="card-body">
                                                        <div className="badge bg-primary">{index + 1}</div>
                                                        <h5 className="card-title">{design.name}</h5>
                                                        <p className="card-text">{design.summary}</p>
                                                        <h6 className="mt-3">Best For:</h6>
                                                        <p className="card-text">{design.best_for}</p>
                                                        <h6 className="mt-3">Note:</h6>
                                                        <p className="card-text">{design.note}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;