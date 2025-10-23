import React from 'react';

const Report = ({ result }) => {
  if (!result) return null;

  const { cost, materials, plan } = result;

  return (
    <div className="container py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-info text-white">
          <h3 className="mb-0">Detailed Construction Report</h3>
        </div>
        <div className="card-body">
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

            {/* Additional Visualizations could be added here */}
            <div className="col-12">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;