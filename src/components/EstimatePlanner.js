import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const EstimatePlanner = () => {
  const [formData, setFormData] = useState({
    areaValue: '',
    unit: 'Marla',
    marlaStandard: '272.25 (Lahore/old)',
    overallLength: '',
    overallWidth: '',
    city: 'Faisalabad',
    quality: 'Standard',
    numberOfFloors: '',
    numberOfBedrooms: '',
    numberOfBathrooms: '',
    numberOfKitchens: '',
    numberOfLivingRooms: '',
    drawingDining: 'Required',
    garage: 'Required',
    style: 'Pakistani',
    kitchenSize: '',
    extraFeatures: '',
    bricks: '',
    cement: '',
    steel: '',
    sand: '',
    crush: ''
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.areaValue || formData.areaValue <= 0) {
      newErrors.areaValue = 'Area value is required and must be greater than 0';
    }
    if (!formData.overallLength || formData.overallLength <= 0) {
      newErrors.overallLength = 'Overall length is required and must be greater than 0';
    }
    if (!formData.overallWidth || formData.overallWidth <= 0) {
      newErrors.overallWidth = 'Overall width is required and must be greater than 0';
    }
    if (!formData.numberOfFloors || formData.numberOfFloors <= 0) {
      newErrors.numberOfFloors = 'Number of floors is required and must be greater than 0';
    }
    if (!formData.numberOfBedrooms || formData.numberOfBedrooms <= 0) {
      newErrors.numberOfBedrooms = 'Number of bedrooms is required and must be greater than 0';
    }
    if (!formData.numberOfBathrooms || formData.numberOfBathrooms <= 0) {
      newErrors.numberOfBathrooms = 'Number of bathrooms is required and must be greater than 0';
    }
    if (!formData.numberOfKitchens || formData.numberOfKitchens <= 0) {
      newErrors.numberOfKitchens = 'Number of kitchens is required and must be greater than 0';
    }
    if (!formData.numberOfLivingRooms || formData.numberOfLivingRooms <= 0) {
      newErrors.numberOfLivingRooms = 'Number of living rooms is required and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const payload = {
        area_value: parseFloat(formData.areaValue),
        unit: formData.unit,
        marla_standard: formData.marlaStandard,
        quality: formData.quality,
        city: formData.city,
        overall_length: parseFloat(formData.overallLength),
        overall_width: parseFloat(formData.overallWidth),
        bedrooms: parseFloat(formData.numberOfBedrooms),
        bathrooms: parseFloat(formData.numberOfBathrooms),
        kitchen_size: formData.kitchenSize !== '' ? parseFloat(formData.kitchenSize) : null,
        living_rooms: parseFloat(formData.numberOfLivingRooms),
        drawing_dining: formData.drawingDining,
        garage: formData.garage,
        floors: parseFloat(formData.numberOfFloors),
        extra_features: formData.extraFeatures,
        style: formData.style,
        bricks: formData.bricks !== '' ? parseFloat(formData.bricks) : null,
        cement: formData.cement !== '' ? parseFloat(formData.cement) : null,
        steel: formData.steel !== '' ? parseFloat(formData.steel) : null,
        sand: formData.sand !== '' ? parseFloat(formData.sand) : null,
        crush: formData.crush !== '' ? parseFloat(formData.crush) : null
      };

      const response = await axiosClient.post('/estimate', payload);
      setResponse({
        success: true,
        data: response.data
      });
    } catch (error) {
      setResponse({
        success: false,
        error: error.response?.data?.message || 'An error occurred while getting the estimate'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    < div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg">
              <div className="card-header bg-dark text-white text-center">
                <h2 className="mb-0">Construction Estimate Planner</h2>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Area Value */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="areaValue" className="form-label">Area Value *</label>

                      <input
                        type="number"
                        className={`form-control ${errors.areaValue ? 'is-invalid' : ''}`}
                        id="areaValue"
                        name="areaValue"
                        value={formData.areaValue}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Allow empty value (so user can clear)
                          // if (value === '') {
                          //   setFormData({ ...formData, areaValue: '' });
                          //   return;
                          // }

                          // Convert to number
                          const num = Number(value);

                          // Limit within range
                          if (num < 3) value = 3;
                          if (num > 10) value = 10;

                          setFormData({ ...formData, areaValue: value });
                        }}
                        placeholder="Enter area value"
                        min={3}
                        max={10}
                        
                      />

                      {errors.areaValue && <div className="invalid-feedback">{errors.areaValue}</div>}
                    </div>

                    {/* Unit */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="unit" className="form-label">Unit</label>
                      <select
                        className="form-select"
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                      >
                        <option value="Marla">Marla</option>
                        {/* <option value="Square Feet">Square Feet</option>
                        <option value="Square Yards">Square Yards</option> */}
                      </select>
                    </div>

                    {/* Marla Standard */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="marlaStandard" className="form-label">Marla Standard</label>
                      <select
                        className="form-select"
                        id="marlaStandard"
                        name="marlaStandard"
                        value={formData.marlaStandard}
                        onChange={handleInputChange}
                      >
                        <option value="225 (Govt)">225 (Govt)</option>
                        <option value="272.25 (Lahore/old)">272.25 (Lahore/old)</option>
                      </select>
                    </div>

                    {/* Overall Length */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="overallLength" className="form-label">Overall Length *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.overallLength ? 'is-invalid' : ''}`}
                        id="overallLength"
                        name="overallLength"
                        value={formData.overallLength}
                        onChange={handleInputChange}
                        placeholder="Enter overall length"
                      />
                      {errors.overallLength && <div className="invalid-feedback">{errors.overallLength}</div>}
                    </div>

                    {/* Overall Width */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="overallWidth" className="form-label">Overall Width *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.overallWidth ? 'is-invalid' : ''}`}
                        id="overallWidth"
                        name="overallWidth"
                        value={formData.overallWidth}
                        onChange={handleInputChange}
                        placeholder="Enter overall width"
                      />
                      {errors.overallWidth && <div className="invalid-feedback">{errors.overallWidth}</div>}
                    </div>

                    {/* City */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">City</label>
                      <select
                        className="form-select"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {/* Quality */}
                    {/* <div className="col-md-6 mb-3">
                    <label htmlFor="quality" className="form-label">Quality</label>
                    <select
                      className="form-select"
                      id="quality"
                      name="quality"
                      value={formData.quality}
                      onChange={handleInputChange}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div> */}

                    {/* Number of Floors */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfFloors" className="form-label">Number of Floors *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.numberOfFloors ? 'is-invalid' : ''}`}
                        id="numberOfFloors"
                        name="numberOfFloors"
                        // value={formData.numberOfFloors}
                        onChange={handleInputChange}
                        placeholder="Enter number of floors"
                        value={1}
                        disabled={true}
                      />
                      {errors.numberOfFloors && <div className="invalid-feedback">{errors.numberOfFloors}</div>}
                    </div>

                    {/* Number of Bedrooms */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfBedrooms" className="form-label">Number of Bedrooms *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.numberOfBedrooms ? 'is-invalid' : ''}`}
                        id="numberOfBedrooms"
                        name="numberOfBedrooms"
                        value={formData.numberOfBedrooms}
                        onChange={handleInputChange}
                        placeholder="Enter number of bedrooms"
                      />
                      {errors.numberOfBedrooms && <div className="invalid-feedback">{errors.numberOfBedrooms}</div>}
                    </div>

                    {/* Number of Bathrooms */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfBathrooms" className="form-label">Number of Bathrooms *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.numberOfBathrooms ? 'is-invalid' : ''}`}
                        id="numberOfBathrooms"
                        name="numberOfBathrooms"
                        value={formData.numberOfBathrooms}
                        onChange={handleInputChange}
                        placeholder="Enter number of bathrooms"
                      />
                      {errors.numberOfBathrooms && <div className="invalid-feedback">{errors.numberOfBathrooms}</div>}
                    </div>

                    {/* Number of Kitchens */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfKitchens" className="form-label">Number of Kitchens *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.numberOfKitchens ? 'is-invalid' : ''}`}
                        id="numberOfKitchens"
                        name="numberOfKitchens"
                        // value={formData.numberOfKitchens}
                        onChange={handleInputChange}
                        placeholder="Enter number of kitchens"
                        value={1}
                        disabled={true}
                      />
                      {errors.numberOfKitchens && <div className="invalid-feedback">{errors.numberOfKitchens}</div>}
                    </div>

                    {/* Number of Living Rooms */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfLivingRooms" className="form-label">Number of Living Rooms *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.numberOfLivingRooms ? 'is-invalid' : ''}`}
                        id="numberOfLivingRooms"
                        name="numberOfLivingRooms"
                        // value={formData.numberOfLivingRooms}
                        onChange={handleInputChange}
                        placeholder="Enter number of living rooms"
                        value={1}
                        disabled={true}
                      />
                      {errors.numberOfLivingRooms && <div className="invalid-feedback">{errors.numberOfLivingRooms}</div>}
                    </div>

                    {/* Kitchen Size */}
                    {/* <div className="col-md-6 mb-3">
                      <label htmlFor="kitchenSize" className="form-label">Kitchen Size</label>
                      <input
                        type="number"
                        className="form-control"
                        id="kitchenSize"
                        name="kitchenSize"
                        value={formData.kitchenSize}
                        onChange={handleInputChange}
                        placeholder="Enter kitchen size (sq ft)"
                      />
                    </div> */}

                    {/* Bricks */}
                    {/* <div className="col-md-6 mb-3">
                  <label htmlFor="bricks" className="form-label">Bricks</label>
                  <input
                    type="number"
                    className="form-control"
                    id="bricks"
                    name="bricks"
                    value={formData.bricks}
                    onChange={handleInputChange}
                    placeholder="Enter bricks quantity"
                  />
                </div> */}

                    {/* Cement */}
                    {/* <div className="col-md-6 mb-3">
                  <label htmlFor="cement" className="form-label">Cement</label>
                  <input
                    type="number"
                    className="form-control"
                    id="cement"
                    name="cement"
                    value={formData.cement}
                    onChange={handleInputChange}
                    placeholder="Enter cement quantity (bags)"
                  />
                </div> */}

                    {/* Steel */}
                    {/* <div className="col-md-6 mb-3">
                  <label htmlFor="steel" className="form-label">Steel</label>
                  <input
                    type="number"
                    className="form-control"
                    id="steel"
                    name="steel"
                    value={formData.steel}
                    onChange={handleInputChange}
                    placeholder="Enter steel quantity (kg/ton)"
                  />
                </div> */}

                    {/* Sand */}
                    {/* <div className="col-md-6 mb-3">
                  <label htmlFor="sand" className="form-label">Sand</label>
                  <input
                    type="number"
                    className="form-control"
                    id="sand"
                    name="sand"
                    value={formData.sand}
                    onChange={handleInputChange}
                    placeholder="Enter sand quantity (cft)"
                  />
                </div> */}

                    {/* Crush */}
                    {/* <div className="col-md-6 mb-3">
                  <label htmlFor="crush" className="form-label">Crush</label>
                  <input
                    type="number"
                    className="form-control"
                    id="crush"
                    name="crush"
                    value={formData.crush}
                    onChange={handleInputChange}
                    placeholder="Enter crush quantity (cft)"
                  />
                </div> */}

                    {/* Extra Features */}
                    {/* <div className="col-12 mb-3">
                  <label htmlFor="extraFeatures" className="form-label">Extra Features</label>
                  <textarea
                    className="form-control"
                    id="extraFeatures"
                    name="extraFeatures"
                    rows="3"
                    value={formData.extraFeatures}
                    onChange={handleInputChange}
                    placeholder="Describe any extra features (e.g., basement, rooftop, lawn)"
                  />
                </div> */}

                    {/* Drawing/Dining */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="drawingDining" className="form-label">Drawing/Dining</label>
                      <select
                        className="form-select"
                        id="drawingDining"
                        name="drawingDining"
                        value={formData.drawingDining}
                        onChange={handleInputChange}
                      >
                        <option value="Required">Required</option>
                        {/* <option value="Not Required">Not Required</option> */}
                      </select>
                    </div>

                    {/* Garage */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="garage" className="form-label">Garage</label>
                      <select
                        className="form-select"
                        id="garage"
                        name="garage"
                        value={formData.garage}
                        onChange={handleInputChange}
                      >
                        <option value="Required">Required</option>
                        {/* <option value="Not Required">Not Required</option> */}
                      </select>
                    </div>

                    {/* Style */}
                    {/* <div className="col-md-6 mb-3">
                    <label htmlFor="style" className="form-label">Style</label>
                    <select
                      className="form-select"
                      id="style"
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                    >
                      <option value="Pakistani">Pakistani</option>
                      <option value="Modern">Modern</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div> */}
                  </div>

                  {/* Submit Button */}
                  <div className="row">
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-dark w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Getting Estimate...
                          </>
                        ) : (
                          'Get Estimate'
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Response Display */}
                {response && (
                  <div className="mt-4">
                    {response.success ? (
                      <div className="alert alert-success" role="alert">
                        <h5 className="alert-heading">Estimate Generated Successfully!</h5>
                        <pre className="mb-0">{JSON.stringify(response.data, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="alert alert-danger" role="alert">
                        <h5 className="alert-heading">Error</h5>
                        <p className="mb-0">{response.error}</p>
                      </div>
                    )}
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

export default EstimatePlanner;
