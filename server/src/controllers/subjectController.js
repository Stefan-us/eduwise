const Subject = require('../models/Subject');

exports.createSubject = async (req, res) => {
  try {
    console.log('Creating subject with data:', req.body);
    const { name, code, assessments } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Subject name and code are required' });
    }
    
    const subject = new Subject({
      name,
      code,
      assessments: assessments || [],
      user: req.user.userId,
      progress: 0
    });

    await subject.save();
    console.log('Subject created:', subject);
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.userId });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    console.log('Updating subject with data:', req.body);
    const { name, code, assessments } = req.body;
    
    // Find the subject first to verify it exists
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Update the subject fields
    subject.name = name || subject.name;
    subject.code = code || subject.code;
    
    if (assessments) {
      subject.assessments = assessments.map(assessment => ({
        name: assessment.name,
        type: assessment.type,
        weight: Number(assessment.weight),
        status: assessment.status || 'pending',
        score: assessment.status === 'pending' ? 0 : (assessment.score || 0),
        _id: assessment._id
      }));

      // Recalculate progress based on graded assessments
      const gradedCount = subject.assessments.filter(a => a.status === 'graded').length;
      subject.progress = (gradedCount / subject.assessments.length) * 100;
    }

    // Save the updated subject
    const updatedSubject = await subject.save();
    console.log('Subject updated:', updatedSubject);
    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const { title, type, dueDate } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignmentDueDate = new Date(dueDate);
    assignmentDueDate.setHours(0, 0, 0, 0);

    if (assignmentDueDate < today) {
      return res.status(400).json({ error: 'Due date cannot be before today' });
    }

    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const { maxScore, notes, learningMaterials, status } = req.body;

    // Validate required fields
    if (!title || !type || !dueDate) {
      return res.status(400).json({
        error: 'Missing required fields: title, type, and dueDate are required'
      });
    }

    // Validate type
    const validTypes = ['project', 'homework', 'quiz', 'exam', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const newAssignment = {
      title,
      type,
      dueDate: new Date(dueDate),
      maxScore: maxScore || 100,
      notes: notes || '',
      learningMaterials: learningMaterials || [],
      status: status || 'pending'
    };

    subject.assignments.push(newAssignment);
    await subject.save();
    
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error in addAssignment:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const assignment = subject.assignments.id(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    Object.assign(assignment, req.body);
    await subject.save();
    
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    subject.assignments.pull(req.params.assignmentId);
    await subject.save();
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateGrades = async (req, res) => {
  try {
    const { grades } = req.body;
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Update each assessment with new grades
    subject.assessments = subject.assessments.map(assessment => {
      const assessmentObj = assessment.toObject();
      if (grades.hasOwnProperty(assessmentObj._id)) {
        return {
          ...assessmentObj,
          score: Number(grades[assessmentObj._id]),
          status: 'graded',
          submittedDate: new Date()
        };
      }
      return assessmentObj;
    });

    // Calculate new progress based on graded assessments
    const gradedCount = subject.assessments.filter(a => a.status === 'graded').length;
    subject.progress = (gradedCount / subject.assessments.length) * 100;

    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('Error updating grades:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getSubjectProgress = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const overallGrade = subject.calculateOverallGrade();
    const remainingWeight = subject.assessments
      .filter(a => a.status === 'pending')
      .reduce((sum, a) => sum + a.weight, 0);

    res.json({
      currentGrade: overallGrade,
      remainingWeight,
      assessments: subject.assessments
    });
  } catch (error) {
    console.error('Error getting subject progress:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAssessmentScore = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      user: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const assessment = subject.assessments.id(req.params.assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Reset the score to 0 and change status back to pending
    assessment.score = 0;
    assessment.status = 'pending';
    assessment.submittedDate = null;

    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
