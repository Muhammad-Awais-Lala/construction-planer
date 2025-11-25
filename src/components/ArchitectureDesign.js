import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const ArchitectureDesign = ({ stepper }) => {
    // Helper function to get initial form data from localStorage
    const getInitialFormData = () => {
        try {
            const savedData = localStorage.getItem('constructionForm');
            if (savedData) {
                const constructionData = JSON.parse(savedData);

                // Map constructionForm data to architecture design form
                return {
                    plot_depth_ft: constructionData.overallLength || 60,
                    plot_width_ft: constructionData.overallWidth || 20,
                    bedrooms: constructionData.numberOfBedrooms || 2,
                    bathrooms: constructionData.numberOfBathrooms || 2,
                    kitchen_type: 'open', // Default as not in constructionForm
                    lounge_required: constructionData.numberOfLivingRooms > 0 || true,
                    drawing_dining_required: constructionData.drawingDining === 'Required' || false,
                    garage_required: constructionData.garage === 'Required' || true,
                    architectural_style: constructionData.style === 'Pakistani' ? 'Traditional' : 'Modern',
                    extra_features: constructionData.extraFeatures || ''
                };
            }
        } catch (err) {
            console.error('Error loading data from localStorage:', err);
        }

        // Return default values if localStorage is empty or error occurs
        return {
            plot_depth_ft: 60,
            plot_width_ft: 20,
            bedrooms: 2,
            bathrooms: 2,
            kitchen_type: 'open',
            lounge_required: true,
            drawing_dining_required: false,
            garage_required: true,
            architectural_style: 'Modern',
            extra_features: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Update form data when component mounts or localStorage changes
    useEffect(() => {
        const initialData = getInitialFormData();
        setFormData(initialData);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Convert form data to match API requirements
            const payload = {
                plot_depth_ft: parseFloat(formData.plot_depth_ft),
                plot_width_ft: parseFloat(formData.plot_width_ft),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                kitchen_type: formData.kitchen_type,
                lounge_required: formData.lounge_required,
                drawing_dining_required: formData.drawing_dining_required,
                garage_required: formData.garage_required,
                architectural_style: formData.architectural_style,
                extra_features: formData.extra_features
            };

            console.log('Payload:', payload);
            const response = await axiosClient.post('/generate-images', payload);
            const responseData = response.data;
            console.log('Response:', responseData);

            setResult(responseData);
            window.toastify('Architecture design generated successfully', 'success');
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Failed to generate architecture design');
            window.toastify('Failed to generate architecture design', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        const initialData = getInitialFormData();
        setFormData(initialData);
        setResult(null);
        setError(null);
    };

    return (
        <div className="py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-12">
                        <div className="card shadow-lg">
                            <div className="card-header bg-primary text-white text-center p-3">
                                {stepper}
                            </div>
                            <div className="card-body p-4">
                                {/* Form Card */}
                                <div className="card mb-4 shadow-lg">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0 fs-5">Building Architecture Configuration</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">
                                                {/* Plot Dimensions */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="plot_depth_ft" className="form-label small">
                                                        Plot Depth (ft) <span className="text-danger fw-bolder">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="form-control form-control-sm"
                                                        id="plot_depth_ft"
                                                        name="plot_depth_ft"
                                                        value={formData.plot_depth_ft}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter plot depth"
                                                        min="10"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="plot_width_ft" className="form-label small">
                                                        Plot Width (ft) <span className="text-danger fw-bolder">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="form-control form-control-sm"
                                                        id="plot_width_ft"
                                                        name="plot_width_ft"
                                                        value={formData.plot_width_ft}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter plot width"
                                                        min="10"
                                                        required
                                                    />
                                                </div>

                                                {/* Room Configuration */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="bedrooms" className="form-label small">
                                                        Bedrooms <span className="text-danger fw-bolder">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        id="bedrooms"
                                                        name="bedrooms"
                                                        value={formData.bedrooms}
                                                        onChange={handleInputChange}
                                                        placeholder="Number of bedrooms"
                                                        min="1"
                                                        max="10"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="bathrooms" className="form-label small">
                                                        Bathrooms <span className="text-danger fw-bolder">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        id="bathrooms"
                                                        name="bathrooms"
                                                        value={formData.bathrooms}
                                                        onChange={handleInputChange}
                                                        placeholder="Number of bathrooms"
                                                        min="1"
                                                        max="10"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="kitchen_type" className="form-label small">
                                                        Kitchen Type
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        id="kitchen_type"
                                                        name="kitchen_type"
                                                        value={formData.kitchen_type}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="open">Open</option>
                                                        <option value="closed">Closed</option>
                                                        <option value="semi-open">Semi-Open</option>
                                                    </select>
                                                </div>

                                                {/* Architectural Style */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="architectural_style" className="form-label small">
                                                        Architectural Style
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        id="architectural_style"
                                                        name="architectural_style"
                                                        value={formData.architectural_style}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="Modern">Modern</option>
                                                        <option value="Contemporary">Contemporary</option>
                                                        <option value="Traditional">Traditional</option>
                                                        <option value="Colonial">Colonial</option>
                                                        <option value="Mediterranean">Mediterranean</option>
                                                        <option value="Victorian">Victorian</option>
                                                        <option value="Minimalist">Minimalist</option>
                                                    </select>
                                                </div>

                                                {/* Features */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label small d-block">Lounge Required</label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="lounge_required"
                                                            name="lounge_required"
                                                            checked={formData.lounge_required}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label small" htmlFor="lounge_required">
                                                            {formData.lounge_required ? 'Yes' : 'No'}
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label small d-block">Drawing/Dining Required</label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="drawing_dining_required"
                                                            name="drawing_dining_required"
                                                            checked={formData.drawing_dining_required}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label small" htmlFor="drawing_dining_required">
                                                            {formData.drawing_dining_required ? 'Yes' : 'No'}
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label small d-block">Garage Required</label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="garage_required"
                                                            name="garage_required"
                                                            checked={formData.garage_required}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label small" htmlFor="garage_required">
                                                            {formData.garage_required ? 'Yes' : 'No'}
                                                        </label>
                                                    </div>
                                                </div>


                                                {/* Extra Features */}
                                                <div className="col-12 mb-3">
                                                    <label htmlFor="extra_features" className="form-label small">
                                                        Extra Features
                                                    </label>
                                                    <textarea
                                                        className="form-control form-control-sm"
                                                        id="extra_features"
                                                        name="extra_features"
                                                        value={formData.extra_features}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., Balcony, Terrace, Pool, Garden, Home Office"
                                                        rows="3"
                                                    ></textarea>
                                                </div>


                                            </div>

                                            {/* Submit Buttons */}
                                            <div className="row">
                                                <div className="col-12 d-flex justify-content-end gap-2">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-rounded"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Generating Design...
                                                            </>
                                                        ) : (
                                                            <span className="fw-bold">Generate Architecture Design</span>
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-dark btn-rounded"
                                                        onClick={handleReset}
                                                        disabled={loading}
                                                    >
                                                        Reset <i className="bi bi-arrow-counterclockwise ms-1"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loading && (
                                    <div className="card">
                                        <div className="card-body text-center py-5">
                                            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}></div>
                                            <h5 className="mb-2">Generating Architecture Design</h5>
                                            <p className="text-muted">
                                                Our AI is creating your building architecture and front elevation render...
                                            </p>
                                            <div className="progress mt-4" style={{ height: "8px" }}>
                                                <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" style={{ width: "100%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !loading && (
                                    <div className="card border-danger">
                                        <div className="card-body">
                                            <div className="alert alert-danger mb-0" role="alert">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                <strong>Error:</strong> {error}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Results Display */}
                                {result && !loading && (
                                    <div className="card">
                                        <div className="card-header bg-dark text-white">
                                            <h5 className="mb-0 fs-5">
                                                <i className="bi bi-check-circle-fill me-2"></i>
                                                Architecture Design Generated Successfully
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                {/* Architecture Design Image */}
                                                {result.blueprint_url && (
                                                    <div className="col-lg-12 mb-4">
                                                        <div className="card h-100">
                                                            <div className="card-header bg-light">
                                                                <h6 className="mb-0 fs-6">Blueprint</h6>
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <img
                                                                    src={result.blueprint_url}
                                                                    alt="Blueprint"
                                                                    className="img-fluid rounded shadow-sm w-100"
                                                                    style={{ objectFit: 'contain', maxHeight: '500px' }}
                                                                />
                                                            </div>
                                                            <div className="card-footer bg-light">
                                                                <a
                                                                    href={result.blueprint_url}
                                                                    download="blueprint.jpg"
                                                                    className="btn btn-sm btn-primary w-100"
                                                                >
                                                                    <i className="bi bi-download me-2"></i>
                                                                    Download Blueprint
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Front Elevation Render */}
                                                {result.elevation_url && (
                                                    <div className="col-lg-12 mb-4">
                                                        <div className="card h-100">
                                                            <div className="card-header bg-light">
                                                                <h6 className="mb-0 fs-6">Front Elevation Render</h6>
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <img
                                                                    src={result.elevation_url}
                                                                    alt="Front Elevation Render"
                                                                    className="img-fluid rounded shadow-sm w-100"
                                                                    style={{ objectFit: 'contain', maxHeight: '500px' }}
                                                                />
                                                            </div>
                                                            <div className="card-footer bg-light">
                                                                <a
                                                                    href={result.elevation_url}
                                                                    download="front-elevation.jpg"
                                                                    className="btn btn-sm btn-primary w-100"
                                                                >
                                                                    <i className="bi bi-download me-2"></i>
                                                                    Download Front Elevation
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Design Summary */}
                                            <div className="card mt-3 shadow-lg">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0 fs-6">Design Summary</h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <ul className="list-unstyled small mb-0">
                                                                <li className="mb-2">
                                                                    <strong>Plot Size:</strong> {formData.plot_width_ft}' × {formData.plot_depth_ft}'
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Bedrooms:</strong> {formData.bedrooms}
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Bathrooms:</strong> {formData.bathrooms}
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Kitchen Type:</strong> {formData.kitchen_type}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <ul className="list-unstyled small mb-0">
                                                                <li className="mb-2">
                                                                    <strong>Architectural Style:</strong> {formData.architectural_style}
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Lounge:</strong> {formData.lounge_required ? 'Yes' : 'No'}
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Drawing/Dining:</strong> {formData.drawing_dining_required ? 'Yes' : 'No'}
                                                                </li>
                                                                <li className="mb-2">
                                                                    <strong>Garage:</strong> {formData.garage_required ? 'Yes' : 'No'}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    {formData.extra_features && (
                                                        <div className="mt-3">
                                                            <strong>Extra Features:</strong> {formData.extra_features}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!result && !loading && !error && (
                                    <div className="card shadow-lg border-secondary">
                                        <div className="card-body text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                                <i className="bi bi-building" style={{ fontSize: "2rem", color: "#6c757d" }}></i>
                                            </div>
                                            <h5 className="mb-2">Ready to Design Your Architecture</h5>
                                            <p className="text-muted">
                                                Fill in the form above and click "Generate Architecture Design" to create your building design and front elevation render.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureDesign;
