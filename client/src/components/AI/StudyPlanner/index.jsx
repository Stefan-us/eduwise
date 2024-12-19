import React, { useState } from 'react';
import { Box, Container, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import PlannerForm from './PlannerForm';
import PlannerResults from './PlannerResults';
import PlannerVisualizer from './PlannerVisualizer';
import axios from 'axios';

const steps = ['Enter Study Details', 'Review Plan', 'Visualize Progress'];

const StudyPlanner = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGeneratePlan = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:50001/api/study-plans/generate', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStudyPlan(response.data);
      setActiveStep(1);
    } catch (err) {
      console.error('Error generating study plan:', err);
      setError(err.response?.data?.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = async (sessionId, completed) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch(`http://localhost:50001/api/study-plans/${studyPlan._id}/session`, {
        sessionId,
        completed
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStudyPlan(response.data);
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err.response?.data?.message || 'Failed to update session status');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <PlannerForm
            onSubmit={handleGeneratePlan}
            loading={loading}
          />
        );
      case 1:
        return studyPlan && (
          <PlannerResults
            plan={studyPlan}
            onSessionComplete={handleSessionComplete}
          />
        );
      case 2:
        return studyPlan && (
          <PlannerVisualizer
            plan={studyPlan}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep < steps.length - 1 && studyPlan && (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default StudyPlanner; 