import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import EstimateResult from './EstimateResult';

const EstimatePlanner = ({ onEstimateComplete }) => {
  const initialFormData = {
    areaValue: '',
    unit: 'Marla',
    marlaStandard: '272.25 (Lahore/old)',
    overallLength: '',
    overallWidth: '',
    city: 'Faisalabad',
    quality: 'Standard',
    numberOfFloors: '1',
    numberOfBedrooms: '',
    numberOfBathrooms: '',
    numberOfKitchens: '1',
    numberOfLivingRooms: '1',
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
  }
  const [formData, setFormData] = useState(initialFormData);

  // Map of marla standards -> area (marla) -> width/length
  const MARLA_STANDARDS = {
    "225 (Govt)": {
      3: { width: 18, length: 37 },
      4: { width: 25, length: 36 },
      5: { width: 25, length: 45 },
      6: { width: 30, length: 45 },
      7: { width: 35, length: 45 },
      8: { width: 30, length: 60 },
      9: { width: 35, length: 58 },
      10: { width: 35, length: 65 }
    },
    "272.25 (Lahore/old)": {
      3: { width: 20, length: 40.8 },
      4: { width: 25, length: 43.6 },
      5: { width: 25, length: 54.5 },
      6: { width: 30, length: 54.5 },
      7: { width: 30, length: 63.5 },
      8: { width: 35, length: 62.2 },
      9: { width: 35, length: 70 },
      10: { width: 35, length: 77.8 }
    }
  };

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // If marlaStandard changed, compute overall dimensions for current area
    if (name === 'marlaStandard') {
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        const area = Number(next.areaValue);
        if (!isNaN(area) && area >= 3 && area <= 10) {
          const dims = MARLA_STANDARDS[value]?.[area];
          if (dims) {
            next.overallLength = dims.length;
            next.overallWidth = dims.width;
          } else {
            next.overallLength = '';
            next.overallWidth = '';
          }
        }
        return next;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  
    const handleAreaChange = (e) => {
      let value = e.target.value;
      // Convert to number
      const area = Number(value);

      // Limit within range
      if (area < 3) value = 3;
      if (area > 10) value = 10;
      if (area === 0 || isNaN(area)) {
        value = "";
      }
      // console.log('Derived Area:', area);
      // console.log('Input Value:', value);

      let derivedRooms;
      if (area === 3) {
        derivedRooms = 1;
      } else if (area >= 4 && area <= 7) {
        derivedRooms = 2;
      } else if (area >= 8 && area <= 10) {
        derivedRooms = 3;
      } else {
        derivedRooms = 1; // fallback for area 3
      }

      // Compute overall dimensions for current marla standard (if possible)
      const selectedStandard = formData.marlaStandard || '272.25 (Lahore/old)';
      let overallLength = '';
      let overallWidth = '';
      if (!isNaN(area) && area >= 3 && area <= 10) {
        const dims = MARLA_STANDARDS[selectedStandard]?.[area];
        if (dims) {
          overallLength = dims.length;
          overallWidth = dims.width;
        }
      }

      setFormData(prev => ({ ...prev, numberOfBedrooms: derivedRooms, numberOfBathrooms: derivedRooms, areaValue: value, overallLength, overallWidth }));
    }

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
      // const payload = {
      //   area_value: formData.areaValue ? parseFloat(formData.areaValue) : undefined,
      //   unit: formData.unit,
      //   marla_standard: formData.marlaStandard,
      //   quality: formData.quality,
      //   city: formData.city,
      //   overall_length: formData.overallLength,
      //   overall_width: formData.overallWidth,
      //   bedrooms: formData.numberOfBedrooms ,
      //   bathrooms: formData.numberOfBathrooms ,
      //   living_rooms: formData.numberOfLivingRooms ,
      //   drawing_dining: formData.drawingDining,
      //   garage: formData.garage,
      //   floors: formData.numberOfFloors,
      //   extra_features: formData.extraFeatures,
      //   style: formData.style
      // };
      const payload = {
        area_value: formData.areaValue ? parseFloat(formData.areaValue) : undefined,
        unit: formData.unit,
        marla_standard: formData.marlaStandard,
        quality: formData.quality,
        city: formData.city,
        overall_length: formData.overallLength ? parseFloat(formData.overallLength) : undefined,
        overall_width: formData.overallWidth ? parseFloat(formData.overallWidth) : undefined,
        bedrooms: formData.numberOfBedrooms ? parseFloat(formData.numberOfBedrooms) : undefined,
        bathrooms: formData.numberOfBathrooms ? parseFloat(formData.numberOfBathrooms) : undefined,
        living_rooms: formData.numberOfLivingRooms ? parseFloat(formData.numberOfLivingRooms) : undefined,
        drawing_dining: formData.drawingDining,
        garage: formData.garage,
        floors: formData.numberOfFloors ? parseFloat(formData.numberOfFloors) : undefined,
        extra_features: formData.extraFeatures,
        style: formData.style
        // If you want to send kitchenSize, bricks, cement, steel, sand, crush, add similar checks
      };

      const response = await axiosClient.post('/estimate', payload);
      const responseData = response.data;
      setResponse({
        success: true,
        data: responseData
      });
      console.log('Response:', responseData);
      window.toastify('Estimate generated successfully', 'success');
      
      // Call the onEstimateComplete callback with the response data
      if (onEstimateComplete) {
        onEstimateComplete(responseData);
      }
    } catch (error) {
      setResponse({
        success: false,
        error: error.response?.data?.message || 'An error occurred while getting the estimate'
      });
      window.toastify('Failed to generate estimate', 'error');
    } finally {
      setLoading(false);
      setFormData(initialFormData);
    }
  };

  // If we have a successful response with data, show the result component
  if (response && response.success && response.data) {
    return <EstimateResult result={response.data.result} />;
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
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
                        onChange={handleAreaChange}
                        placeholder="Enter area value"
                        min={3}
                        max={10}
                      // defaultValue={3}

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
                        className="btn btn-primary w-100"
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
                {/* {response && (
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
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatePlanner;
