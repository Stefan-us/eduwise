const StudyPlan = require('../models/StudyPlan');

exports.createStudyPlan = async (req, res) => {
  try {
    const { title, description, startDate, endDate, tasks } = req.body;
    const studyPlan = new StudyPlan({
      title,
      description,
      user: req.user._id,
      startDate,
      endDate,
      tasks
    });
    await studyPlan.save();
    res.status(201).json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudyPlans = async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({ user: req.user._id })
      .populate('tasks', 'title status');
    res.json(studyPlans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id })
      .populate('tasks', 'title status');
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }
    res.json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('tasks', 'title status');
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }
    res.json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }
    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    // Update session status
    if (studyPlan.nextSession?._id.toString() === req.params.sessionId) {
      studyPlan.nextSession.completed = true;
      studyPlan.completedSessions.push(studyPlan.nextSession);
      studyPlan.nextSession = studyPlan.upcomingSessions[0] || null;
      studyPlan.upcomingSessions = studyPlan.upcomingSessions.slice(1);
    } else {
      const sessionIndex = studyPlan.upcomingSessions.findIndex(
        s => s._id.toString() === req.params.sessionId
      );
      if (sessionIndex !== -1) {
        const completedSession = studyPlan.upcomingSessions[sessionIndex];
        completedSession.completed = true;
        studyPlan.completedSessions.push(completedSession);
        studyPlan.upcomingSessions.splice(sessionIndex, 1);
      }
    }

    // Update progress
    const totalSessions = studyPlan.completedSessions.length + 
                         (studyPlan.nextSession ? 1 : 0) + 
                         studyPlan.upcomingSessions.length;
    studyPlan.progress = (studyPlan.completedSessions.length / totalSessions) * 100;

    await studyPlan.save();
    res.json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
