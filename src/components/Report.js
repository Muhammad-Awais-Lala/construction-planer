import React from 'react';

const Report = ({ result }) => {
  if (!result) return null;

  const { cost, materials, plan } = result;

//   console.log('Report result:', result);

  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Detailed Construction Report</h3>
        </div>
        <div className="card-body">
          {/* Cost Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card shadow-lg h-100" style={{backgroundColor:"#fca311"}}>
                <div className="card-body text-center">
                  <h6 className="card-title text-muted mb-3">Grey Structure Cost</h6>
                  <h3 className="card-text text-primary mb-0">
                    Rs. {cost?.grey_cost?.toLocaleString() || '0'}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-lg bg-success h-100">
                <div className="card-body text-center">
                  <h6 className="card-title text-muted mb-3">Finishing Cost</h6>
                  <h3 className="card-text text-white mb-0">
                    Rs. {cost?.finishing_cost?.toLocaleString() || '0'}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow bg-primary h-100">
                <div className="card-body text-center">
                  <h6 className="card-title text-white mb-3">Total Cost</h6>
                  <h3 className="card-text text-white mb-0">
                    Rs. {cost?.total_cost?.toLocaleString() || '0'}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Plan Details */}
            <div className="col-12 mb-4">
              <h4>Building Plan Details</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    {Object.entries(plan).map(([key, value]) => (
                      <tr key={key}>
                        <th style={{ width: '30%' }}>{key}</th>
                        <td>{Array.isArray(value) ? value.join(', ') : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense Details Section */}
            <div className="col-12 mb-4">
              <h4>Material Cost Breakdown</h4>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-primary">
                    <tr>
                      <th>Material</th>
                      <th className="text-end">Quantity</th>
                      <th className="text-end">Unit Price (Rs.)</th>
                      <th className="text-end">Total Price (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      try {
                        const materialsData = JSON.parse(localStorage.getItem('constructionMaterials') || '[]');
                        const totalMaterialsCost = parseFloat(localStorage.getItem('constructionTotalMaterialsCost') || '0');
                        
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
                              No materials data available
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;