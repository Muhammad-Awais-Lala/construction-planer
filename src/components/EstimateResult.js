import React from 'react';

const EstimateResult = ({ result }) => {
  if (!result) return null;

  const { materials, cost, plan, designs } = result;

  // Format number with commas for better readability
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Materials Table */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Required Materials</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Material</th>
                      <th className="text-end">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(materials).map(([material, value]) => (
                      <tr key={material}>
                        <td>{material}</td>
                        <td className="text-end">{typeof value === 'number' ? formatNumber(value) : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Table */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Cost Breakdown</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Covered Area</td>
                      <td className="text-end">{formatNumber(cost.covered_sqft)} sq.ft</td>
                    </tr>
                    <tr>
                      <td>Grey Structure Cost</td>
                      <td className="text-end">PKR {formatNumber(cost.grey_cost)}</td>
                    </tr>
                    <tr>
                      <td>Finishing Cost</td>
                      <td className="text-end">PKR {formatNumber(cost.finishing_cost)}</td>
                    </tr>
                    <tr>
                      <td>City Factor</td>
                      <td className="text-end">{cost.city_factor}</td>
                    </tr>
                    <tr className="table-primary fw-bold">
                      <td>Total Cost</td>
                      <td className="text-end">PKR {formatNumber(cost.total_cost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Design Suggestions */}
        {/* <div className="col-12 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Suggested Designs</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {designs.map((design, index) => (
                  <div key={index} className="col-md-4 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
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
  );
};

export default EstimateResult;