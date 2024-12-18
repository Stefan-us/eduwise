import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PlannerVisualizer = ({ plan }) => {
  const theme = useTheme();
  const { aiGeneratedPlan, metrics } = plan;

  // Prepare data for the timeline
  const timelineData = aiGeneratedPlan.sessions.map(session => ({
    ...session,
    status: session.completed ? 'completed' : 'pending'
  }));

  // Prepare data for the bar chart
  const chartData = [
    {
      name: 'Completion Rate',
      value: metrics.sessionCompletionRate * 100
    },
    {
      name: 'Avg Duration',
      value: metrics.averageSessionDuration
    },
    {
      name: 'Difficulty',
      value: metrics.topicDifficulty * 20 // Scale to 100
    },
    {
      name: 'Learning Velocity',
      value: metrics.learningVelocity * 20 // Scale to 100
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Study Progress Timeline
        </Typography>
        <Timeline position="alternate">
          {timelineData.map((session, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot
                  color={session.status === 'completed' ? 'success' : 'grey'}
                  variant={session.status === 'completed' ? 'filled' : 'outlined'}
                />
                {index < timelineData.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="subtitle2">
                  {session.topic}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.day} - {session.time}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>

      <Box sx={{ height: 300 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
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
            <Bar
              dataKey="value"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          * Completion Rate and Learning Velocity are scaled to percentage for comparison
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlannerVisualizer; 