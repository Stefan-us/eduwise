const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    const { title, dueDate, description, start, end, allDay } = req.body;
    
    console.log('User ID:', req.user.userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);

    if (taskDueDate < today) {
      return res.status(400).json({ error: 'Due date cannot be before today' });
    }

    const task = new Task({
      title,
      dueDate,
      description,
      start: start || dueDate,
      end: end || dueDate,
      allDay: allDay !== undefined ? allDay : true,
      user: req.user.userId,
      completed: false
    });

    await task.save();
    console.log('Task created:', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { completed, title, dueDate, start, end, allDay, description } = req.body;
    const updateFields = {};
    
    if (completed !== undefined) updateFields.completed = completed;
    if (title) updateFields.title = title;
    if (dueDate) updateFields.dueDate = dueDate;
    if (start) updateFields.start = start;
    if (end) updateFields.end = end;
    if (allDay !== undefined) updateFields.allDay = allDay;
    if (description !== undefined) updateFields.description = description;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
