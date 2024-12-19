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
  Grid
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

  // Calculate dates for each session based on deadline
  const calculateSessionDate = (index) => {
    const deadlineDate = new Date(deadline);
    const totalDays = aiGeneratedPlan.sessions.length;
    const daysPerSession = Math.max(1, Math.floor(totalDays / aiGeneratedPlan.sessions.length));
    const date = new Date(deadlineDate);
    date.setDate(date.getDate() - (totalDays - index) * daysPerSession);
    return date;
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

            <Grid container spacing={2}>
              <Grid item>
                <Chip
                  icon={<InfoIcon />}
                  label={`Duration: 45 min/session`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<InfoIcon />}
                  label={`Sessions: ${aiGeneratedPlan.sessions.length}`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<InfoIcon />}
                  label={`Total Hours: ${Math.round(aiGeneratedPlan.sessions.length * 45 / 60)}`}
                  variant="outlined"
                />
              </Grid>
            </Grid>
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
                      <Box sx={{ 
                        textDecoration: session.completed ? 'line-through' : 'none',
                        color: session.completed ? 'text.secondary' : 'text.primary'
                      }}>
                        <Typography variant="subtitle2">
                          Study Session {index + 1}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item>
                            <Typography variant="caption">
                              {format(calculateSessionDate(index), 'EEE, MMM d')}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="caption">
                              {session.time}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Chip
                              label={`${session.duration} minutes`}
                              size="small"
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </Box>
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
            Plan Details
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              size="small"
              label={`Created: ${format(new Date(plan.createdAt), 'PPP')}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Status: ${plan.status}`}
              variant="outlined"
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PlannerResults; 