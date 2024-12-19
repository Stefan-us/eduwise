import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import PlannerForm from '../../StudyPlanner/PlannerForm';
import PlannerResults from '../../StudyPlanner/PlannerResults';
import PlannerVisualizer from '../../StudyPlanner/PlannerVisualizer';
import StudyPlanList from '../../StudyPlanner/StudyPlanList';
import ViewPlan from '../../StudyPlanner/ViewPlan';

const StudyPlanContent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view'
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const steps = ['Create Plan', 'Review Plan', 'Visualize Progress'];

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
      setShowList(false);
      setViewMode('create');
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
      const response = await axios.patch(
        `http://localhost:50001/api/study-plans/${studyPlan._id}/session`,
        { sessionId, completed },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setStudyPlan(response.data);
    } catch (err) {
      console.error('Error updating session status:', err);
      setError(err.response?.data?.message || 'Failed to update session status');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateNew = () => {
    setShowList(false);
    setActiveStep(0);
    setStudyPlan(null);
    setError(null);
    setViewMode('create');
  };

  const handleBackToList = () => {
    setShowList(true);
    setActiveStep(0);
    setStudyPlan(null);
    setError(null);
    setViewMode('list');
    setSelectedPlanId(null);
  };

  const handleViewPlan = (planId) => {
    setSelectedPlanId(planId);
    setViewMode('view');
    setShowList(false);
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

  if (viewMode === 'view' && selectedPlanId) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToList}
          sx={{ mb: 3 }}
        >
          Back to Study Plans
        </Button>
        <ViewPlan planId={selectedPlanId} />
      </Box>
    );
  }

  if (showList) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Study Plans</Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={handleCreateNew}
          >
            Create New Plan
          </Button>
        </Box>
        <StudyPlanList onViewPlan={handleViewPlan} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="outlined"
        onClick={handleBackToList}
        sx={{ mb: 3 }}
      >
        Back to Study Plans
      </Button>

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
    </Box>
  );
};

export default StudyPlanContent;
