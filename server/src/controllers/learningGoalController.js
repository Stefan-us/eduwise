const LearningGoal = require('../models/LearningGoal');

exports.createLearningGoal = async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const goalTargetDate = new Date(targetDate);
    goalTargetDate.setHours(0, 0, 0, 0);

    if (goalTargetDate < today) {
      return res.status(400).json({ error: 'Target date cannot be before today' });
    }

    const learningGoal = new LearningGoal({
      title,
      description,
      targetDate,
      user: req.user.userId,
      completed: false,
      progress: 0
    });

    await learningGoal.save();
    res.status(201).json(learningGoal);
  } catch (error) {
    console.error('Error creating learning goal:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getLearningGoals = async (req, res) => {
  try {
    const learningGoals = await LearningGoal.find({ user: req.user.userId })
      .sort({ targetDate: 1 });
    res.json(learningGoals);
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateLearningGoal = async (req, res) => {
  try {
    const { completed, title, targetDate, description, progress } = req.body;
    const updateFields = {};
    
    if (completed !== undefined) updateFields.completed = completed;
    if (title) updateFields.title = title;
    if (targetDate) updateFields.targetDate = targetDate;
    if (description !== undefined) updateFields.description = description;
    if (progress !== undefined) updateFields.progress = progress;

    const learningGoal = await LearningGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!learningGoal) {
      return res.status(404).json({ error: 'Learning goal not found' });
    }
    res.json(learningGoal);
  } catch (error) {
    console.error('Error updating learning goal:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLearningGoal = async (req, res) => {
  try {
    const learningGoal = await LearningGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!learningGoal) {
      return res.status(404).json({ error: 'Learning goal not found' });
    }
    res.json({ message: 'Learning goal deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};