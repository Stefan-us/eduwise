const StudyPlan = require('../models/StudyPlan');
const studyPlannerService = require('../services/aiService/studyPlannerService');

exports.generatePlan = async (req, res) => {
  try {
    const {
      subject,
      goal,
      deadline,
      preferredTimes,
      restrictions,
      learningStyle,
      difficultyPreference
    } = req.body;

    // Generate AI plan
    const aiGeneratedPlan = await studyPlannerService.generateStudyPlan({
      subject,
      goal,
      deadline,
      preferredTimes,
      restrictions,
      learningStyle,
      difficultyPreference
    });

    // Create new study plan
    const studyPlan = new StudyPlan({
      user: req.user.userId,
      subject,
      goal,
      deadline,
      preferredTimes,
      restrictions,
      learningStyle,
      difficultyPreference,
      aiGeneratedPlan
    });

    await studyPlan.save();
    res.status(201).json(studyPlan);
  } catch (error) {
    console.error('Study plan generation failed:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch study plans', error: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch study plan', error: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const {
      subject,
      goal,
      deadline,
      preferredTimes,
      restrictions,
      learningStyle,
      difficultyPreference,
      userCustomizations
    } = req.body;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update basic fields
    plan.subject = subject || plan.subject;
    plan.goal = goal || plan.goal;
    plan.deadline = deadline || plan.deadline;
    plan.preferredTimes = preferredTimes || plan.preferredTimes;
    plan.restrictions = restrictions || plan.restrictions;
    plan.learningStyle = learningStyle || plan.learningStyle;
    plan.difficultyPreference = difficultyPreference || plan.difficultyPreference;

    // Update customizations if provided
    if (userCustomizations) {
      plan.userCustomizations = {
        ...plan.userCustomizations,
        ...userCustomizations
      };
    }

    // Regenerate AI plan if core parameters changed
    if (subject || goal || deadline || preferredTimes || restrictions || 
        learningStyle || difficultyPreference) {
      const aiGeneratedPlan = await studyPlannerService.generateStudyPlan({
        subject: plan.subject,
        goal: plan.goal,
        deadline: plan.deadline,
        preferredTimes: plan.preferredTimes,
        restrictions: plan.restrictions,
        learningStyle: plan.learningStyle,
        difficultyPreference: plan.difficultyPreference
      });
      plan.aiGeneratedPlan = aiGeneratedPlan;
    }

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update study plan', error: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete study plan', error: error.message });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { sessionId, completed } = req.body;
    
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update session status
    const session = plan.aiGeneratedPlan.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.completed = completed;
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update session status', error: error.message });
  }
};

exports.generateRescheduleSuggestions = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Get the session to reschedule
    const session = plan.aiGeneratedPlan.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Generate suggestions based on user's preferences and schedule
    const suggestions = await studyPlannerService.generateRescheduleSuggestions({
      plan,
      session,
      userId: req.user.userId
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Failed to generate reschedule suggestions:', error);
    res.status(500).json({ message: 'Failed to generate reschedule suggestions', error: error.message });
  }
};

exports.rescheduleSession = async (req, res) => {
  try {
    const { sessionId, newTime } = req.body;
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Find and update the session
    const session = plan.aiGeneratedPlan.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Store the original time in modifications history
    plan.userCustomizations.sessionModifications.push({
      sessionId: session._id,
      originalTime: session.time,
      modifiedTime: newTime,
      reason: 'Rescheduled missed session'
    });

    // Update the session time
    session.time = newTime;
    session.completed = false;

    // Update the plan's metadata
    plan.aiGeneratedPlan.generationMetadata.lastUpdated = new Date();

    await plan.save();
    res.json(plan);
  } catch (error) {
    console.error('Failed to reschedule session:', error);
    res.status(500).json({ message: 'Failed to reschedule session', error: error.message });
  }
}; 