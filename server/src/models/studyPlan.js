const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  day: String,
  time: String,
  duration: String,
  topic: String,
  resources: [String],
  completed: {
    type: Boolean,
    default: false
  }
});

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  preferredTimes: [{
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night']
  }],
  restrictions: [{
    type: String,
    enum: ['No weekends', 'No early mornings', 'No late nights']
  }],
  progress: {
    type: Number,
    default: 0
  },
  nextSession: studySessionSchema,
  upcomingSessions: [studySessionSchema],
  completedSessions: [studySessionSchema],
  metrics: {
    sessionCompletionRate: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    preferredTimeSlots: [{
      dayOfWeek: String,
      hour: Number,
      successRate: Number
    }],
    topicDifficulty: {
      type: Number,
      default: 5  // Scale 1-10
    },
    learningVelocity: {
      type: Number,
      default: 1  // Multiplier for expected progress
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);