import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const PlannerForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    subject: '',
    goal: '',
    deadline: null,
    preferredTimes: [],
    restrictions: [],
    learningStyle: '',
    difficultyPreference: ''
  });

  const timeSlots = [
    'Early Morning (6-9)',
    'Morning (9-12)',
    'Afternoon (12-5)',
    'Evening (5-8)',
    'Night (8-11)'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h6" gutterBottom>
            Create Your Study Plan
          </Typography>

          <TextField
            required
            fullWidth
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <TextField
            required
            fullWidth
            multiline
            rows={3}
            label="Learning Goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Deadline"
              value={formData.deadline}
              onChange={(newValue) => {
                setFormData(prev => ({
                  ...prev,
                  deadline: newValue
                }));
              }}
              renderInput={(params) => <TextField {...params} required />}
              minDate={new Date()}
            />
          </LocalizationProvider>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Preferred Study Times
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {timeSlots.map((time) => (
                <Chip
                  key={time}
                  label={time}
                  onClick={() => handleTimeSelect(time)}
                  color={formData.preferredTimes.includes(time) ? "primary" : "default"}
                  variant={formData.preferredTimes.includes(time) ? "filled" : "outlined"}
                />
              ))}
            </Box>
          </Box>

          <FormControl required fullWidth>
            <InputLabel>Learning Style</InputLabel>
            <Select
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
              label="Learning Style"
            >
              <MenuItem value="visual">Visual</MenuItem>
              <MenuItem value="auditory">Auditory</MenuItem>
              <MenuItem value="reading">Reading/Writing</MenuItem>
              <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
            </Select>
          </FormControl>

          <FormControl required fullWidth>
            <InputLabel>Difficulty Preference</InputLabel>
            <Select
              name="difficultyPreference"
              value={formData.difficultyPreference}
              onChange={handleChange}
              label="Difficulty Preference"
            >
              <MenuItem value="easy">Easy - Gradual Progress</MenuItem>
              <MenuItem value="moderate">Moderate - Balanced Approach</MenuItem>
              <MenuItem value="challenging">Challenging - Intensive Learning</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? 'Generating Plan...' : 'Generate Study Plan'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default PlannerForm; 