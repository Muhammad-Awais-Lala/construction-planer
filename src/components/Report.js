
import React from 'react';

const Report = ({ result, stepper }) => {
    if (!result) return null;

    const { cost, finishing, plan } = result;
    const totalMaterialsCost = parseFloat(localStorage.getItem('constructionTotalMaterialsCost') || '0');
    const labourCost = cost?.labour_cost || 0;
    const grayStructureCost = totalMaterialsCost + labourCost;
    const totalCost = grayStructureCost + (cost?.finishing_cost || 0);

    const getCategoryIcon = (category) => {
        const iconMap = {
            'Flooring': 'grid-3x3-gap',
            'Paint': 'brush',
            'Kitchen': 'house-door',
            'Windows': 'window',
            'Doors': 'door-closed',
            'Electrical Fittings': 'lightning-charge',
            'Bath Fittings': 'droplet'
        };
        return iconMap[category] || 'box';
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white p-3">
                    {stepper}
                </div>
                <div className="card-body p-4">
                    {/* Cost Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="card shadow-lg h-100 border-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted mb-3 fs-6"><i className="bi bi-building me-2"></i>Grey Structure Cost</h6>
                                    <h3 className="card-text text-dark mb-0 fs-4">
                                        Rs. {grayStructureCost.toLocaleString() || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card shadow-lg h-100 border-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted mb-3 fs-6"><i className="bi bi-paint-bucket me-2"></i>Finishing Cost</h6>
                                    <h3 className="card-text text-dark mb-0 fs-4">
                                        Rs. {cost?.finishing_cost?.toLocaleString() || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card shadow-lg h-100 bg-primary">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-dark mb-3 fs-6"><i className="bi bi-wallet2 me-2"></i>Total Estimated Cost</h6>
                                    <h3 className="card-text text-dark mb-0 fs-4">
                                        Rs. {totalCost.toLocaleString() || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                                    <th style={{ width: '30%' }} className="bg-light small text-uppercase">{key}</th>
                                                    <td>{Array.isArray(value) ? value.join(', ') : value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* Material Cost Breakdown */}
                        <div className="mb-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-light d-flex align-items-center">
                                    <i className="bi bi-box-seam me-2 fs-5 text-primary"></i>
                                    <h4 className="fs-5 mb-0">Material Cost Breakdown</h4>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead className="thead-light">
                                            <tr className="small text-uppercase text-muted">
                                                <th className="fw-semibold px-3">Material</th>
                                                <th className="text-end fw-semibold px-3">Quantity</th>
                                                <th className="text-end fw-semibold px-3">Unit Price (Rs.)</th>
                                                <th className="text-end fw-semibold px-3">Total Price (Rs.)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                try {
                                                    const materialsData = JSON.parse(localStorage.getItem('constructionMaterials'));
                                                    const hasFloors = Array.isArray(materialsData) && materialsData.some(it => typeof it.floor !== 'undefined');
                                                    if (hasFloors) {
                                                        const floors = Array.from(new Set(materialsData.map(it => it.floor))).sort((a, b) => (a ?? 0) - (b ?? 0));
                                                        return (
                                                            <>
                                                                {floors.map((floorVal) => (
                                                                    <React.Fragment key={`floor-${floorVal}`}>
                                                                        <tr className="table-light">
                                                                            <td colSpan="4" className="fw-bold px-3">
                                                                                <i className="bi bi-building me-2"></i>{(floorVal === 0 || floorVal === '0') ? 'Ground Floor' : `Floor ${floorVal}`} Materials
                                                                            </td>
                                                                        </tr>
                                                                        {materialsData.filter(it => it.floor === floorVal).map((item, idx) => (
                                                                            <tr key={`f${floorVal}-${idx}`}>
                                                                                <td className='px-3'>{item.material}</td>
                                                                                <td className="text-end px-3">{item.quantity.toLocaleString()}</td>
                                                                                <td className="text-end px-3">{item.unitPrice.toLocaleString()}</td>
                                                                                <td className="text-end px-3">{Math.round(item.totalPrice).toLocaleString()}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </React.Fragment>
                                                                ))}
                                                                <tr className="table-dark fw-bold">
                                                                    <td colSpan="3" className="text-end px-3">Total Materials Cost:</td>
                                                                    <td className="text-end px-3">Rs. {Math.round(totalMaterialsCost).toLocaleString()}</td>
                                                                </tr>
                                                            </>
                                                        );
                                                    }

                                                    return (
                                                        <>
                                                            {materialsData.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td className='px-3'>{item.material}</td>
                                                                    <td className="text-end px-3">{item.quantity.toLocaleString()}</td>
                                                                    <td className="text-end px-3">{item.unitPrice.toLocaleString()}</td>
                                                                    <td className="text-end px-3">{Math.round(item.totalPrice).toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                            <tr className="table-dark fw-bold">
                                                                <td colSpan="3" className="text-end px-3">Total Materials Cost:</td>
                                                                <td className="text-end px-3">Rs. {Math.round(totalMaterialsCost).toLocaleString()}</td>
                                                            </tr>
                                                        </>
                                                    );
                                                } catch (err) {
                                                    return (
                                                        <tr>
                                                            <td colSpan="4" className="text-center text-muted p-4">
                                                                Material details could not be loaded. Please ensure you have selected material quality in the previous step.
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        {/* Cost Breakdowns */}
                        <div className="row">
                            {/* Grey Structure Cost */}
                            <div className="col-lg-6 mb-4">
                                <div className="card shadow-sm h-100 border-0">
                                    <div className="card-header bg-light d-flex align-items-center">
                                        <i className="bi bi-bricks me-2 fs-5 text-primary"></i>
                                        <h4 className="mb-0 fs-5">Grey Structure Cost</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between border-bottom py-2">
                                            <span>Labour Cost</span>
                                            <span className="fw-bold">Rs. {labourCost.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-2">
                                            <span>Materials Cost</span>
                                            <span className="fw-bold">Rs. {totalMaterialsCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-light fw-bold d-flex justify-content-between">
                                        <span>Total Grey Structure</span>
                                        <span>Rs. {grayStructureCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Project Cost */}
                            <div className="col-lg-6 mb-4">
                                <div className="card shadow-sm h-100 border-0">
                                    <div className="card-header bg-light d-flex align-items-center">
                                        <i className="bi bi-stack me-2 fs-5 text-primary"></i>
                                        <h4 className="mb-0 fs-5">Total Project Cost</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between border-bottom py-2">
                                            <span>Grey Structure Cost</span>
                                            <span className="fw-bold">Rs. {grayStructureCost.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-2">
                                            <span>Finishing Cost</span>
                                            <span className="fw-bold">Rs. {(cost?.finishing_cost || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-dark text-white fw-bold d-flex justify-content-between">
                                        <span>Total Estimated Cost</span>
                                        <span>Rs. {totalCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Finishing Materials Guide */}
                        {finishing?.material_guide && (
                            <div className="mb-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-light d-flex align-items-center">
                                        <i className="bi bi-palette me-2 fs-5 text-primary"></i>
                                        <h4 className="mb-0 fs-5">Finishing Materials Guide</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {finishing.material_guide.map((item, index) => (
                                                <div key={index} className="col-md-6 col-lg-4">
                                                    <div className="card h-100 shadow-sm">
                                                        <div className="card-body d-flex align-items-center">
                                                            <i className={`bi bi-${getCategoryIcon(item.category)} fs-2 text-primary me-3`}></i>
                                                            <div>
                                                                <h6 className="card-title mb-1 text-dark">{item.category}</h6>
                                                                <p className="text-muted small mb-1">{item.material_type}</p>
                                                                <p className="card-text small">{item.notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            );
};

            export default Report;