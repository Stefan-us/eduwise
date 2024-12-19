const mongoose = require('mongoose');

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
    required: true
  }],
  restrictions: [{
    type: String
  }],
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
    required: true
  },
  difficultyPreference: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    required: true
  },
  aiGeneratedPlan: {
    sessions: [{
      day: String,
      time: String,
      duration: String,
      topic: String,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    modelParameters: {
      learningRate: Number,
      sessionDuration: Number,
      topicDifficulty: Number,
      confidenceScore: Number
    },
    generationMetadata: {
      modelVersion: String,
      generatedAt: Date,
      lastUpdated: Date
    }
  },
  userCustomizations: {
    sessionModifications: [{
      sessionId: String,
      originalTime: String,
      modifiedTime: String,
      reason: String
    }],
    preferenceUpdates: [{
      parameter: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      updatedAt: Date
    }]
  },
  metrics: {
    sessionCompletionRate: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    topicDifficulty: {
      type: Number,
      default: 0
    },
    learningVelocity: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Pre-save middleware to update metrics
studyPlanSchema.pre('save', function(next) {
  if (this.aiGeneratedPlan && this.aiGeneratedPlan.sessions) {
    const completedSessions = this.aiGeneratedPlan.sessions.filter(s => s.completed);
    this.metrics.sessionCompletionRate = completedSessions.length / this.aiGeneratedPlan.sessions.length;
  }
  next();
});

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
module.exports = StudyPlan; 