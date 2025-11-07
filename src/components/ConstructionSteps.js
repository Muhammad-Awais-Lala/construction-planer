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
  const [materialsConfirmed, setMaterialsConfirmed] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('constructionEstimate');
    if (savedData) {
      setEstimateData(JSON.parse(savedData));
    }
    // Load materials confirmation state
    const confirmed = localStorage.getItem('constructionMaterialsConfirmed') === 'true';
    setMaterialsConfirmed(confirmed);
  }, []);

  const handleEstimateComplete = (data) => {
    // Save to localStorage
    localStorage.setItem('constructionEstimate', JSON.stringify(data));
    setEstimateData(data);
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 1 && !materialsConfirmed) {
      return; // Don't allow proceeding if materials aren't confirmed
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setEstimateData(null);
    setMaterialsConfirmed(false);
    // localStorage.removeItem('constructionEstimate');
    localStorage.clear();
    window.location.reload();
  };

  const stepper = (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        '& .MuiStepConnector-line': {
          borderColor: '#ccc',
          borderWidth: 2,
        },
        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
          borderColor: '#000',
        },
        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
          borderColor: '#000',
          borderWidth: 2,
        },
      }}
    >
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel
            StepIconProps={{
              sx: {
                '&.Mui-completed': {
                  color: '#000', // Green for completed steps
                },
                '&.Mui-active': {
                  color: '#000', // Orange for active step
                },
                '&.Mui-disabled': {
                  color: '#e0e0e0', // Light gray for inactive
                },
                // fontSize: '2rem', // Larger icons
              },
            }}
            sx={{
              '& .MuiStepLabel-label': {
                // color: activeStep === index ? '#ff9800' : '#666',
                fontWeight: activeStep === index ? 'bold' : 'normal',
                '&.Mui-completed': {
                  color: '#000',
                  fontWeight: 'bold',
                },
              },
            }}
          >
            <div className="text-center">
              <div className="fw-bold fs-6">{step.label}</div>
              <small className="text-muted">{step.description}</small>
            </div>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <EstimatePlanner onEstimateComplete={handleEstimateComplete} stepper={stepper} />;
      case 1:
        return <EstimateResult
          result={estimateData?.result}
          onConfirm={() => {
            setMaterialsConfirmed(true);
            localStorage.setItem('constructionMaterialsConfirmed', 'true');
            handleNext();
          }}
          stepper={stepper}
        />;
      case 2:
        return <Report result={estimateData?.result} stepper={stepper} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <div className="mt-4">
        {renderStepContent()}
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <button className="btn btn-outline-primary btn-rounded" onClick={handleBack} disabled={activeStep === 0}><i className="bi bi-arrow-left me-1"></i> Back</button>
        <Box>
          {/* <button className="btn btn-outline-dark btn-rounded me-1" onClick={handleReset}>Reset  <i className="bi bi-arrow-counterclockwise ms-1"></i></button> */}
          {activeStep < steps.length - 1 && (
            <button
              className="btn btn-primary btn-rounded"
              onClick={handleNext}
              disabled={!estimateData || (activeStep === 1 && !materialsConfirmed)}
            >
              Next <i className="bi bi-arrow-right ms-1"></i>
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConstructionSteps;