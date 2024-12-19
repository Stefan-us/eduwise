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
  IconButton
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudyPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      console.error('Error fetching study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:50001/api/study-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting study plan:', error);
    }
  };

  const handleView = (planId) => {
    navigate(`/study-planner/plan/${planId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Study Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/study-planner/create')}
          sx={{ mb: 3 }}
        >
          Create New Plan
        </Button>

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
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleView(plan._id)} title="View Plan">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(plan._id)} title="Delete Plan">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {plans.length === 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No study plans yet. Create your first plan!
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default StudyPlanList; 