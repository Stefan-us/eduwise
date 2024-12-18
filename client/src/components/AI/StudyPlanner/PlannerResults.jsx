import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Stack,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PlannerResults = ({ plan, onSessionComplete }) => {
  const {
    subject,
    goal,
    deadline,
    aiGeneratedPlan,
    metrics
  } = plan;

  const formatTime = (time) => {
    return format(new Date(`2000-01-01 ${time}`), 'h:mm a');
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Study Plan for {subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Goal: {goal}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deadline: {format(new Date(deadline), 'PPP')}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Progress Metrics
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Session Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.sessionCompletionRate * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(metrics.sessionCompletionRate * 100)}%
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Chip
                icon={<InfoIcon />}
                label={`Avg. Duration: ${Math.round(metrics.averageSessionDuration)}min`}
                variant="outlined"
              />
              <Chip
                icon={<InfoIcon />}
                label={`Difficulty: ${metrics.topicDifficulty.toFixed(1)}/5`}
                variant="outlined"
              />
              <Chip
                icon={<InfoIcon />}
                label={`Learning Velocity: ${metrics.learningVelocity.toFixed(1)}`}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Study Sessions
          </Typography>
          <List>
            {aiGeneratedPlan.sessions.map((session, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => onSessionComplete(session._id, !session.completed)}
                    >
                      {session.completed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <UncheckedIcon />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textDecoration: session.completed ? 'line-through' : 'none',
                          color: session.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {session.topic}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption">
                          {session.day}
                        </Typography>
                        <Typography variant="caption">
                          {session.time}
                        </Typography>
                        <Chip
                          label={session.duration}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    }
                  />
                </ListItem>
                {index < aiGeneratedPlan.sessions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            AI Model Parameters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Model's learning rate parameter">
              <Chip
                size="small"
                label={`LR: ${aiGeneratedPlan.modelParameters.learningRate.toFixed(3)}`}
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="Confidence score for the generated plan">
              <Chip
                size="small"
                label={`Confidence: ${(aiGeneratedPlan.modelParameters.confidenceScore * 100).toFixed(1)}%`}
                variant="outlined"
              />
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PlannerResults; 