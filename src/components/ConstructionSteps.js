import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Paper, Box, Button } from '@mui/material';
import EstimatePlanner from './EstimatePlanner';
import EstimateResult from './EstimateResult';
import Report from './Report';

const steps = [
  {
    label: 'Input Details',
    description: 'Fill in your construction requirements'
  },
  {
    label: 'Cost Estimation',
    description: 'Review materials and cost breakdown'
  },
  {
    label: 'Detailed Report',
    description: 'View comprehensive construction report'
  }
];

const ConstructionSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [estimateData, setEstimateData] = useState(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('constructionEstimate');
    if (savedData) {
      setEstimateData(JSON.parse(savedData));
    }
  }, []);

  const handleEstimateComplete = (data) => {
    // Save to localStorage
    localStorage.setItem('constructionEstimate', JSON.stringify(data));
    setEstimateData(data);
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setEstimateData(null);
    // localStorage.removeItem('constructionEstimate');
    localStorage.clear();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <EstimatePlanner onEstimateComplete={handleEstimateComplete} />;
      case 1:
        return <EstimateResult result={estimateData?.result} onConfirm={handleNext} />;
      case 2:
        return <Report result={estimateData?.result} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }} >
        <Stepper activeStep={activeStep} alternativeLabel >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel >
                <div className="text-center">
                  <div className="fw-bold">{step.label}</div>
                  <small className="text-muted">{step.description}</small>
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <div className="mt-4">
        {renderStepContent()}
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        {/* <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button> */}
        <button className="btn btn-outline-primary" onClick={handleBack} disabled={activeStep === 0}><i className="bi bi-arrow-left me-1"></i> Back</button>
        <Box>
          {/* <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mr: 1 }}
          >
            Reset
          </Button> */}
          <button className="btn btn-outline-danger me-1" onClick={handleReset}>Reset  <i className="bi bi-arrow-counterclockwise ms-1"></i></button>
          {activeStep < steps.length - 1 && (
            // <Button
            //   variant="contained"
            //   onClick={handleNext}
            //   disabled={!estimateData}
            // >
            //   Next
            // </Button>
            <button className="btn btn-primary" onClick={handleNext} disabled={!estimateData}>Next <i className="bi bi-arrow-right ms-1"></i></button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConstructionSteps;