const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['exam', 'coursework', 'participation'],
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  dueDate: Date,
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  submittedDate: Date
});

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessments: [assessmentSchema],
  description: String,
  progress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

subjectSchema.methods.calculateOverallGrade = function() {
  const gradedAssessments = this.assessments.filter(a => a.status === 'graded');
  if (gradedAssessments.length === 0) return null;

  return gradedAssessments.reduce((sum, assessment) => {
    return sum + (assessment.score * assessment.weight);
  }, 0);
};

module.exports = mongoose.model('Subject', subjectSchema);