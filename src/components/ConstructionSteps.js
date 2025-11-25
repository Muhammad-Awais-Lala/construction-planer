import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Paper, Box, Button } from '@mui/material';
import EstimatePlanner from './EstimatePlanner';
import EstimateResult from './EstimateResult';
import Report from './Report';
import ArchitectureDesign from './ArchitectureDesign';

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
  },
  {
    label: 'Architecture Design',
    description: 'Design your building architecture'
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
        // Responsive padding
        px: { xs: 0, sm: 1, md: 2 },
        // Prevent horizontal overflow
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel
            StepIconProps={{
              sx: {
                '&.Mui-completed': {
                  color: '#000',
                },
                '&.Mui-active': {
                  color: '#000',
                },
                '&.Mui-disabled': {
                  color: '#e0e0e0',
                },
                // Responsive icon size
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              },
            }}
            sx={{
              '& .MuiStepLabel-label': {
                fontWeight: activeStep === index ? 'bold' : 'normal',
                '&.Mui-completed': {
                  color: '#000',
                  fontWeight: 'bold',
                },
                // Responsive font size
                fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' },
              },
            }}
          >
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: 'inherit' }}>{step.label}</div>
              {/* Hide description on small screens */}
              <small className="text-muted d-none d-md-block">{step.description}</small>
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
      case 3:
        return <ArchitectureDesign stepper={stepper} />;
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