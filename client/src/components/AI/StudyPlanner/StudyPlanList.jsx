import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudyPlanList = ({ onViewPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:50001/api/study-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPlans(response.data);
    } catch (error) {
      setError('Failed to load study plans');
      console.error('Error fetching study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {plans.map((plan) => (
        <Grid item xs={12} md={6} lg={4} key={plan._id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {plan.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {plan.goal}
              </Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Deadline: ${format(new Date(plan.deadline), 'MMM d, yyyy')}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={plan.metrics.sessionCompletionRate * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(plan.metrics.sessionCompletionRate * 100)}% Complete
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  onClick={() => onViewPlan(plan._id)}
                  color="primary"
                  aria-label="view plan"
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StudyPlanList; 