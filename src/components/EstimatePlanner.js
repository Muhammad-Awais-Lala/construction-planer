import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const EstimatePlanner = ({ onEstimateComplete, stepper }) => {
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

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('constructionForm');
      return saved ? JSON.parse(saved) : initialFormData;
    } catch (err) {
      return initialFormData;
    }
  });

  const initialFloors = [{
    floorNumber: 1,
    floorName: 'Ground Floor',
    bedrooms: '',
    bathrooms: '',
    kitchens: '1',
    livingRooms: '1',
    garage: 'Required',
    drawingDining: 'Required'
  }];

  const [floors, setFloors] = useState(() => {
    try {
      const savedFloors = localStorage.getItem('constructionFloors');
      return savedFloors ? JSON.parse(savedFloors) : initialFloors;
    } catch (err) {
      return initialFloors;
    }
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('constructionForm', JSON.stringify(formData));
    } catch (err) {
      // ignore
    }
  }, [formData]);

  // Load floors from localStorage on component mount
  useEffect(() => {
    try {
      const savedFloors = localStorage.getItem('constructionFloors');
      if (savedFloors) {
        setFloors(JSON.parse(savedFloors));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Save floors to localStorage whenever floors change
  useEffect(() => {
    try {
      localStorage.setItem('constructionFloors', JSON.stringify(floors));
    } catch (err) {
      // ignore
    }
  }, [floors]);

  // Function to get floor name based on floor number
  const getFloorName = (floorNumber) => {
    if (floorNumber === 1) return 'Ground Floor';
    if (floorNumber === 2) return '1st Floor';
    if (floorNumber === 3) return '2nd Floor';
    if (floorNumber === 4) return '3rd Floor';
    return `${floorNumber}th Floor`;
  };

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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
        try {
          localStorage.setItem('constructionForm', JSON.stringify(next));
        } catch (err) { }
        return next;
      });
    } else {
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        try {
          localStorage.setItem('constructionForm', JSON.stringify(next));
        } catch (err) { }
        return next;
      });
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAreaChange = (e) => {
    let value = e.target.value;
    const area = Number(value);

    if (area < 3) value = 3;
    if (area > 10) value = 10;
    if (area === 0 || isNaN(area)) {
      value = "";
    }

    let derivedRooms;
    if (area === 3) {
      derivedRooms = 1;
    } else if (area >= 4 && area <= 7) {
      derivedRooms = 2;
    } else if (area >= 8 && area <= 10) {
      derivedRooms = 3;
    } else {
      derivedRooms = 1;
    }

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

    setFormData(prev => {
      const next = { ...prev, numberOfBedrooms: derivedRooms, numberOfBathrooms: derivedRooms, areaValue: value, overallLength, overallWidth };
      try {
        localStorage.setItem('constructionForm', JSON.stringify(next));
      } catch (err) { }
      return next;
    });

    // Update only ground floor bedrooms and bathrooms when area changes
    setFloors(prevFloors =>
      prevFloors.map((floor, index) =>
        index === 0
          ? { ...floor, bedrooms: derivedRooms, bathrooms: derivedRooms }
          : floor
      ));
  }

  const handleFloorChange = (index, field, value) => {
    const updatedFloors = floors.map((floor, i) =>
      i === index ? { ...floor, [field]: value } : floor
    );
    setFloors(updatedFloors);

    // Save to localStorage
    try {
      localStorage.setItem('constructionFloors', JSON.stringify(updatedFloors));
    } catch (err) {
      // ignore
    };
  };

  const addFloor = () => {
    const currentFloorsCount = floors.length;
    if (currentFloorsCount >= 3) return; // Maximum 3 floors allowed

    const newFloor = {
      floorNumber: currentFloorsCount + 1,
      floorName: getFloorName(currentFloorsCount + 1),
      bedrooms: '',
      bathrooms: '',
      kitchens: '1',
      livingRooms: '1',
      drawingDining: 'Required'
    };

    const updatedFloors = [...floors, newFloor];
    setFloors(updatedFloors);

    // Save to localStorage
    try {
      localStorage.setItem('constructionFloors', JSON.stringify(updatedFloors));
    } catch (err) {
      // ignore
    }

    // Update total floors count in formData
    setFormData(prev => ({
      ...prev,
      numberOfFloors: currentFloorsCount + 1
    }));
  };

  const removeFloor = (index) => {
    if (floors.length <= 1) return; // At least one floor should remain

    // Update floor numbers and total floors count
    const updatedFloors = floors.filter((_, i) => i !== index)
      .map((floor, i) => ({
        ...floor,
        floorNumber: i + 1,
        floorName: getFloorName(i + 1)
      }));

    setFloors(updatedFloors);

    // Save to localStorage
    try {
      localStorage.setItem('constructionFloors', JSON.stringify(updatedFloors));
    } catch (err) {
      // ignore
    }

    // Update total floors count in formData
    setFormData(prev => ({
      ...prev,
      numberOfFloors: updatedFloors.length
    }));
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

    // Validate each floor
    floors.forEach((floor, index) => {
      if (!floor.bedrooms || floor.bedrooms <= 0) {
        newErrors[`floor_${index}_bedrooms`] = `Bedrooms for ${floor.floorName} are required`;
      }
      if (!floor.bathrooms || floor.bathrooms <= 0) {
        newErrors[`floor_${index}_bathrooms`] = `Bathrooms for ${floor.floorName} are required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use only Ground Floor (index 0) values for main keys
      const groundFloor = floors[0] || {};

      const payload = {
        area_value: formData.areaValue ? parseFloat(formData.areaValue) : undefined,
        unit: formData.unit,
        marla_standard: formData.marlaStandard,
        quality: formData.quality,
        city: formData.city,
        overall_length: formData.overallLength ? parseFloat(formData.overallLength) : undefined,
        overall_width: formData.overallWidth ? parseFloat(formData.overallWidth) : undefined,
        bedrooms: groundFloor.bedrooms ? parseInt(groundFloor.bedrooms) : undefined,
        bathrooms: groundFloor.bathrooms ? parseInt(groundFloor.bathrooms) : undefined,
        living_rooms: groundFloor.livingRooms ? parseInt(groundFloor.livingRooms) : undefined,
        drawing_dining: floors[0]?.drawingDining || 'Required',
        garage: floors[0]?.garage || 'Required',
        floors: formData.numberOfFloors ? parseFloat(formData.numberOfFloors) : undefined,
        extra_features: formData.extraFeatures,
        style: formData.style,
        floors_detail: floors
          .filter(floor => floor.floorNumber !== 1) // Remove ground floor (floorNumber 1)
          .map(floor => ({
            ...floor,
            floorName: getFloorName(floor.floorNumber)
          }))
      };

      console.log('Payload:', payload);
      const response = await axiosClient.post('/estimate', payload);
      const responseData = response.data;
      console.log('Response:', responseData);
      window.toastify('Estimate generated successfully', 'success');
      localStorage.removeItem("constructionMaterials")
      localStorage.removeItem("constructionTotalMaterialsCost")

      if (onEstimateComplete) {
        onEstimateComplete(responseData);
      }
    } catch (error) {
      window.toastify('Failed to generate estimate', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container-lg">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center p-3">
                {stepper}
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Area Value */}
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="areaValue" className="form-label small">Area Value <span className="text-danger fw-bolder">*</span></label>
                      <input
                        type="number"
                        className={`form-control form-control-sm ${errors.areaValue ? 'is-invalid' : ''}`}
                        id="areaValue"
                        name="areaValue"
                        value={formData.areaValue}
                        onChange={handleAreaChange}
                        placeholder="Enter area value"
                        min={3}
                        max={10}
                      />
                      {errors.areaValue && <div className="invalid-feedback">{errors.areaValue}</div>}
                    </div>

                    {/* Unit */}
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="unit" className="form-label small">Unit</label>
                      <select
                        className="form-select form-select-sm"
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                      >
                        <option value="Marla">Marla</option>
                      </select>
                    </div>

                    {/* Marla Standard */}
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="marlaStandard" className="form-label small">Marla Standard</label>
                      <select
                        className="form-select form-select-sm"
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
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="overallLength" className="form-label small">Overall Length <span className="text-danger fw-bolder">*</span></label>
                      <input
                        type="number"
                        className={`form-control form-control-sm ${errors.overallLength ? 'is-invalid' : ''}`}
                        id="overallLength"
                        name="overallLength"
                        value={formData.overallLength}
                        onChange={handleInputChange}
                        placeholder="Enter overall length"
                      />
                      {errors.overallLength && <div className="invalid-feedback">{errors.overallLength}</div>}
                    </div>

                    {/* Overall Width */}
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="overallWidth" className="form-label small">Overall Width <span className="text-danger fw-bolder">*</span></label>
                      <input
                        type="number"
                        className={`form-control form-control-sm ${errors.overallWidth ? 'is-invalid' : ''}`}
                        id="overallWidth"
                        name="overallWidth"
                        value={formData.overallWidth}
                        onChange={handleInputChange}
                        placeholder="Enter overall width"
                      />
                      {errors.overallWidth && <div className="invalid-feedback">{errors.overallWidth}</div>}
                    </div>

                    {/* City */}
                    <div className="col-lg-4 col-md-6 mb-3">
                      <label htmlFor="city" className="form-label small">City</label>
                      <select
                        className="form-select form-select-sm"
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

                    {/* Number of Floors - Now auto-calculated */}
                    <div className="col-lg-4 col-md-6 mb-3 d-none">
                      <label htmlFor="numberOfFloors" className="form-label small">Number of Floors <span className="text-danger fw-bolder">*</span></label>
                      <input
                        type="number"
                        className={`form-control form-control-sm ${errors.numberOfFloors ? 'is-invalid' : ''}`}
                        id="numberOfFloors"
                        name="numberOfFloors"
                        value={floors.length}
                        onChange={handleInputChange}
                        readOnly
                        min={1}
                        max={3}
                      />
                      {errors.numberOfFloors && <div className="invalid-feedback">{errors.numberOfFloors}</div>}
                    </div>

                    {/* Quality */}
                    <div className="col-lg-4 col-md-6  mb-3">
                      <label htmlFor="quality" className="form-label small">Quality</label>
                      <select
                        className="form-select form-select-sm"
                        id="quality"
                        name="quality"
                        value={formData.quality}
                        onChange={handleInputChange}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Economy">Economy</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>



                  {/* Dynamic Floors Section */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 fs-5">Floors Configuration</h5>
                      {floors.length < 3 && (
                        <button
                          type="button"
                          className="btn btn-primary btn-rounded btn-sm"
                          onClick={addFloor}
                        >
                          {/* <i className="bi bi-plus-circle me-1"></i> */}
                          Add Floor
                        </button>
                      )}
                    </div>

                    {floors.map((floor, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fs-6">{floor.floorName}</h6>
                          {floors.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => removeFloor(index)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          )}
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {/* Bedrooms for this floor */}
                            <div className="col-lg-4 col-md-6 mb-3">
                              <label className="form-label small">Bedrooms <span className="text-danger fw-bolder">*</span></label>
                              <input
                                type="number"
                                className={`form-control form-control-sm ${errors[`floor_${index}_bedrooms`] ? 'is-invalid' : ''}`}
                                value={floor.bedrooms}
                                onChange={(e) => handleFloorChange(index, 'bedrooms', e.target.value)}
                                placeholder="Bedrooms"
                                min="1"
                              />
                              {errors[`floor_${index}_bedrooms`] && (
                                <div className="invalid-feedback">{errors[`floor_${index}_bedrooms`]}</div>
                              )}
                            </div>

                            {/* Bathrooms for this floor */}
                            <div className="col-lg-4 col-md-6 mb-3">
                              <label className="form-label small">Bathrooms <span className="text-danger fw-bolder">*</span></label>
                              <input
                                type="number"
                                className={`form-control form-control-sm ${errors[`floor_${index}_bathrooms`] ? 'is-invalid' : ''}`}
                                value={floor.bathrooms}
                                onChange={(e) => handleFloorChange(index, 'bathrooms', e.target.value)}
                                placeholder="Bathrooms"
                                min="1"
                              />
                              {errors[`floor_${index}_bathrooms`] && (
                                <div className="invalid-feedback">{errors[`floor_${index}_bathrooms`]}</div>
                              )}
                            </div>

                            {/* Kitchens for this floor */}
                            <div className="col-lg-4 col-md-6 mb-3">
                              <label className="form-label small">Kitchens</label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={floor.kitchens}
                                onChange={(e) => handleFloorChange(index, 'kitchens', e.target.value)}
                                placeholder="Kitchens"
                                min="1"
                                // readOnly
                                disabled
                              />
                            </div>

                            {/* Living Rooms for this floor */}
                            <div className="col-lg-4 col-md-6 mb-3">
                              <label className="form-label small">Living Rooms</label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={floor.livingRooms}
                                onChange={(e) => handleFloorChange(index, 'livingRooms', e.target.value)}
                                placeholder="Living Rooms"
                                min="1"
                                disabled
                              />
                            </div>

                            {/* Drawing/Dining for this floor */}
                            <div className="col-lg-4 col-md-6 mb-3">
                              <label className="form-label small">Drawing/Dining</label>
                              <select
                                className="form-select form-select-sm"
                                value={floor.drawingDining}
                                onChange={(e) => handleFloorChange(index, 'drawingDining', e.target.value)}
                              >
                                <option value="Required">Required</option>
                                <option value="Not Required">Not Required</option>
                              </select>
                            </div>

                            {/* Garage - Only for Ground Floor */}
                            {index === 0 && (
                              <div className="col-lg-4 col-md-6 mb-3">
                                <label className="form-label small">Garage</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={floor.garage}
                                  onChange={(e) => handleFloorChange(index, 'garage', e.target.value)}
                                >
                                  <option value="Required">Required</option>
                                  <option value="Not Required">Not Required</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
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
                            Getting Estimate...
                          </>
                        ) : (
                          <span className="fw-bold">
                            {/* <i className="bi bi-calculator me-2"></i> */}
                            Get Estimate Budget
                          </span>
                        )}
                      </button>

                      <button className="btn btn-outline-dark btn-rounded me-1" onClick={handleReset}>Reset  Details<i className="bi bi-arrow-counterclockwise ms-1"></i></button>

                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatePlanner;