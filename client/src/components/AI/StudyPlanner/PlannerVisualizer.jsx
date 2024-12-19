import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const PlannerVisualizer = ({ plan }) => {
  const theme = useTheme();
  const { aiGeneratedPlan, metrics } = plan;

  // Calculate meaningful metrics
  const totalSessions = aiGeneratedPlan.sessions.length;
  const completedSessions = aiGeneratedPlan.sessions.filter(s => s.completed).length;
  const remainingSessions = totalSessions - completedSessions;
  const totalHours = Math.round(totalSessions * 45 / 60);
  const completedHours = Math.round(completedSessions * 45 / 60);

  // Prepare data for the bar chart
  const chartData = [
    {
      name: 'Sessions',
      Completed: completedSessions,
      Remaining: remainingSessions,
    },
    {
      name: 'Hours',
      Completed: completedHours,
      Remaining: totalHours - completedHours,
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Study Progress Overview
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Completed"
                stackId="a"
                fill={theme.palette.success.main}
                name="Completed"
              />
              <Bar
                dataKey="Remaining"
                stackId="a"
                fill={theme.palette.grey[300]}
                name="Remaining"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          * Each session is 45 minutes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * Total planned study time: {totalHours} hours ({totalSessions} sessions)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * Completed: {completedHours} hours ({completedSessions} sessions)
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlannerVisualizer; 