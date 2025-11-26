import React, { useState, useEffect } from 'react';
import Zoom from 'react-medium-image-zoom';
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
                    plot_depth_ft: constructionData.overallLength || 0,
                    plot_width_ft: constructionData.overallWidth || 0,
                    bedrooms: constructionData.numberOfBedrooms || 2,
                    bathrooms: constructionData.numberOfBathrooms || 2,
                    number_of_floors: constructionData.numberOfFloors || 1,
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
        // return {
        //     plot_depth_ft: 60,
        //     plot_width_ft: 20,
        //     bedrooms: 2,
        //     bathrooms: 2,
        //     number_of_floors: 1,
        //     kitchen_type: 'open',
        //     lounge_required: true,
        //     drawing_dining_required: false,
        //     garage_required: true,
        //     architectural_style: 'Modern',
        //     extra_features: ''
        // };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Load saved images from localStorage on component mount
    useEffect(() => {
        const initialData = getInitialFormData();
        setFormData(initialData);

        // Load saved architecture design images
        try {
            const savedImages = localStorage.getItem('architectureDesignImages');
            if (savedImages) {
                const imagesData = JSON.parse(savedImages);
                setResult(imagesData);
            }
        } catch (err) {
            console.error('Error loading saved images:', err);
        }
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
            // Retrieve floors configuration from localStorage
            let floorsConfiguration = [];
            try {
                const savedFloors = localStorage.getItem('constructionFloors');
                if (savedFloors) {
                    floorsConfiguration = JSON.parse(savedFloors);
                }
            } catch (err) {
                console.error('Error loading floors configuration:', err);
            }

            // Convert form data to match API requirements
            const payload = {
                plot_depth_ft: parseFloat(formData.plot_depth_ft),
                plot_width_ft: parseFloat(formData.plot_width_ft),
                // bedrooms: parseInt(formData.bedrooms),
                // bathrooms: parseInt(formData.bathrooms),
                // lounge_required: formData.lounge_required,
                // drawing_dining_required: formData.drawing_dining_required,
                // garage_required: formData.garage_required,
                number_of_floors: parseInt(formData.number_of_floors),
                kitchen_type: formData.kitchen_type,
                architectural_style: formData.architectural_style,
                extra_features: formData.extra_features,
                floors_configuration: floorsConfiguration
            };

            console.log('Payload:', payload);
            const response = await axiosClient.post('/generate-images', payload);
            const responseData = response.data;
            console.log('Response:', responseData);

            // Save the complete response to localStorage
            localStorage.setItem('architectureDesignImages', JSON.stringify(responseData));
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

        // Clear saved images from localStorage
        localStorage.removeItem('architectureDesignImages');
        window.toastify('Architecture design reset successfully', 'info');
    };

    const handleDownloadImage = async (imageUrl, filename) => {
        try {
            // Fetch the image from Cloudinary
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Create a local object URL from the blob
            const blobUrl = window.URL.createObjectURL(blob);

            // Create and trigger download with the local URL
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            window.toastify('Image downloaded successfully', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            window.toastify('Failed to download image', 'error');
        }
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
                                                {/* <div className="col-lg-4 col-md-6 mb-3">
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
                                                </div> */}

                                                {/* <div className="col-lg-4 col-md-6 mb-3">
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
                                                </div> */}



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
                                                {/* <div className="col-lg-4 col-md-6 mb-3">
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
                                                </div> */}

                                                {/* <div className="col-lg-4 col-md-6 mb-3">
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
                                                </div> */}

                                                {/* <div className="col-lg-4 col-md-6 mb-3">
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
                                                </div> */}

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label htmlFor="number_of_floors" className="form-label small">
                                                        Number of Floors <span className="text-danger fw-bolder">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        id="number_of_floors"
                                                        name="number_of_floors"
                                                        value={formData.number_of_floors}
                                                        onChange={handleInputChange}
                                                        placeholder="Number of floors"
                                                        min="1"
                                                        max="3"
                                                        required
                                                    />
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
                                                        disabled={loading || result}
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
                                    <>
                                        {/* Section Divider */}
                                        <div className="card  shadow-lg text-center my-4">
                                            {/* <hr className="my-3" /> */}
                                            <h4 className="my-3">
                                                <i className="bi bi-images me-2"></i>
                                                Generated Architecture Designs
                                            </h4>
                                            {/* <hr className="my-3" /> */}
                                        </div>

                                        {/* Front Elevation Render */}
                                        {result.elevation_url && (
                                            <div className="col-lg-12 mb-4">
                                                <div className="card h-100 shadow-lg">
                                                    <div className="card-header bg-primary text-center">
                                                        <h5 className="mb-0 fs-5"><i className="bi bi-building me-2"></i>Front Elevation</h5>
                                                    </div>
                                                    <div className="card-body p-3">
                                                        <Zoom>
                                                            <img
                                                                src={result.elevation_url}
                                                                alt="Front Elevation Render"
                                                                className="img-fluid rounded w-100"
                                                                style={{ objectFit: 'contain', maxHeight: '500px' }}
                                                            />
                                                        </Zoom>
                                                    </div>
                                                    <div className="card-footer bg-light">
                                                        <button
                                                            onClick={() => handleDownloadImage(result.elevation_url, 'front-elevation.jpg')}
                                                            className="btn btn-sm btn-primary w-100"
                                                        >
                                                            <i className="bi bi-download me-2"></i>
                                                            Download Front Elevation
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="row">
                                            {/* Dynamic Floor Blueprints */}
                                            {[1, 2, 3].map((floorNum) => {
                                                const blueprintKey = `floor_${floorNum}_blueprint_url`;
                                                const blueprintUrl = result[blueprintKey];

                                                if (!blueprintUrl) return null;

                                                return (
                                                    <div key={floorNum} className="col-lg-12 mb-4">
                                                        <div className="card h-100 shadow-lg">
                                                            <div className="card-header bg-primary text-center">
                                                                <h5 className="mb-0 fs-5"><i className="bi bi-building me-2"></i>Floor {floorNum} Blueprint</h5>
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <Zoom>
                                                                    <img
                                                                        src={blueprintUrl}
                                                                        alt={`Floor ${floorNum} Blueprint`}
                                                                        className="img-fluid rounded w-100"
                                                                        style={{ objectFit: 'contain', maxHeight: '500px' }}
                                                                    />
                                                                </Zoom>
                                                            </div>
                                                            <div className="card-footer bg-light">
                                                                <button
                                                                    onClick={() => handleDownloadImage(blueprintUrl, `floor-${floorNum}-blueprint.jpg`)}
                                                                    className="btn btn-sm btn-primary w-100"
                                                                >
                                                                    <i className="bi bi-download me-2"></i>
                                                                    Download Floor {floorNum} Blueprint
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}


                                        </div>

                                        {/* Design Summary */}
                                        {/* <div className="card mt-3 shadow-lg">
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
                                                                <li className="mb-2">
                                                                    <strong>Number of Floors:</strong> {formData.number_of_floors}
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
                                            </div> */}
                                    </>
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
