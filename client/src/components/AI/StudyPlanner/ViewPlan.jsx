import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import axios from 'axios';
import PlannerResults from './PlannerResults';
import PlannerVisualizer from './PlannerVisualizer';

const ViewPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [reschedulingSuggestions, setReschedulingSuggestions] = useState([]);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:50001/api/study-plans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPlan(response.data);
    } catch (error) {
      setError('Failed to load study plan');
      console.error('Error fetching study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = async (sessionId, completed) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch(
        `http://localhost:50001/api/study-plans/${id}/session`,
        { sessionId, completed },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setPlan(response.data);
      
      // If session is marked as incomplete, suggest rescheduling
      if (!completed) {
        const suggestions = await generateReschedulingSuggestions(sessionId);
        setReschedulingSuggestions(suggestions);
        setRescheduleDialog(true);
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const generateReschedulingSuggestions = async (sessionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://localhost:50001/api/study-plans/${id}/reschedule-suggestions`,
        { sessionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Error generating reschedule suggestions:', error);
      return [];
    }
  };

  const handleReschedule = async (sessionId, newTime) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://localhost:50001/api/study-plans/${id}/reschedule-session`,
        { sessionId, newTime },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setPlan(response.data);
      setRescheduleDialog(false);
    } catch (error) {
      console.error('Error rescheduling session:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>Study plan not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/study-planner')}
          sx={{ mb: 2 }}
        >
          Back to Study Plans
        </Button>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {plan.subject}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {plan.goal}
          </Typography>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <PlannerVisualizer plan={plan} />
        </Box>

        <Box>
          <PlannerResults
            plan={plan}
            onSessionComplete={handleSessionComplete}
          />
        </Box>
      </Box>

      <Dialog
        open={rescheduleDialog}
        onClose={() => setRescheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reschedule Missed Session</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Here are some suggested times to reschedule your session:
          </Typography>
          {reschedulingSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleReschedule(suggestion.sessionId, suggestion.time)}
            >
              {suggestion.time} - {suggestion.reason}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewPlan; 