import React, { useState } from 'react';
import { X, Calendar, Clock, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import '../../styles/dashboard/AddTaskModal.css';

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { newTask, setNewTask } = useTasks();
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let start = new Date(newTask.dueDate);
    let end = new Date(newTask.dueDate);

    if (!isAllDay) {
      const [startHours, startMinutes] = startTime.split(':');
      const [endHours, endMinutes] = endTime.split(':');
      
      start.setHours(parseInt(startHours), parseInt(startMinutes), 0);
      end.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    }

    const task = {
      ...newTask,
      start,
      end,
      allDay: isAllDay,
      completed: false,
      description,
      tags: [...tags],
    };

    if (typeof onAddTask === 'function') {
      onAddTask(task);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setNewTask({ title: '', dueDate: new Date() });
    setIsAllDay(true);
    setStartTime('09:00');
    setEndTime('17:00');
    setDescription('');
    setTags([]);
    setNewTag('');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="modal-content"
          >
            <div className="modal-header">
              <h2>Add New Task</h2>
              <button onClick={onClose} className="close-button">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="title-input"
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description..."
                  className="description-input"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="date-time-group">
                  <div className="input-with-icon">
                    <Calendar size={20} />
                    <input
                      type="date"
                      value={newTask.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="all-day-toggle">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  <label htmlFor="allDay">All day</label>
                </div>
              </div>

              {!isAllDay && (
                <div className="form-row">
                  <div className="time-group">
                    <div className="input-with-icon">
                      <Clock size={20} />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="time-group">
                    <div className="input-with-icon">
                      <Clock size={20} />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <div className="tags-input">
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="input-with-icon">
                    <Tag size={20} />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleAddTag}
                      placeholder="Add tags..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={onClose} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
