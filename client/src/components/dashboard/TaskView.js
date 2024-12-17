import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { format, isToday, isTomorrow, isFuture } from 'date-fns';
import AddTaskModal from './AddTaskModal';
import { useTasks } from '../../contexts/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, AlertTriangle, Bot, ClipboardList, Calendar, Sunrise, Clock } from 'lucide-react';
import '../../styles/dashboard/TaskView.css';
import { toast } from 'react-toastify';
import AISidebar from '../AI/AISidebar';

const TASKS_PER_PAGE = 5;

const TaskView = React.memo(({ onAddTask }) => {
  const { tasks, setTasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showOverdueTasks, setShowOverdueTasks] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:50001/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const fetchedTasks = await response.json();
          setTasks(fetchedTasks);
        } else {
          console.error('Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleToggleComplete = useCallback(async (taskId) => {
    try {
      const taskToUpdate = tasks.find(task => task._id === taskId);
      if (taskToUpdate) {
        const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:50001/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ completed: updatedTask.completed })
        });
        if (response.ok) {
          const updatedTaskFromServer = await response.json();
          setTasks(prevTasks => prevTasks.map(task => 
            task._id === taskId ? updatedTaskFromServer : task
          ));
        } else {
          console.error('Failed to update task');
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [tasks, setTasks]);

  const handleRemoveTask = useCallback(async (taskId) => {
    setDeletingTaskId(taskId);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:50001/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeletingTaskId(null);
    }
  }, [setTasks]);

  const groupTasks = useCallback((tasks) => {
    if (!tasks || tasks.length === 0) {
      return { today: [], tomorrow: [], future: [], overdue: [] };
    }

    const grouped = {
      today: [],
      tomorrow: [],
      future: [],
      overdue: []
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (task.completed) {
        if (dueDate >= now) {
          if (isToday(dueDate)) {
            grouped.today.push(task);
          } else if (isTomorrow(dueDate)) {
            grouped.tomorrow.push(task);
          } else if (isFuture(dueDate)) {
            grouped.future.push(task);
          }
        }
      } else {
        if (dueDate < now) {
          grouped.overdue.push(task);
        } else if (isToday(dueDate)) {
          grouped.today.push(task);
        } else if (isTomorrow(dueDate)) {
          grouped.tomorrow.push(task);
        } else if (isFuture(dueDate)) {
          grouped.future.push(task);
        }
      }
    });

    return grouped;
  }, []);

  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks, groupTasks]);

  const allTasks = useMemo(() => {
    return [
      ...groupedTasks.overdue.map(task => ({ ...task, group: 'Overdue' })),
      ...groupedTasks.today.map(task => ({ ...task, group: 'Today' })),
      ...groupedTasks.tomorrow.map(task => ({ ...task, group: 'Tomorrow' })),
      ...groupedTasks.future.map(task => ({ ...task, group: 'Future' }))
    ];
  }, [groupedTasks]);

  const activeTasks = allTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return !task.completed && dueDate >= today;
  });

  const overdueTasks = useMemo(() => {
    return allTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return !task.completed && dueDate < today;
    });
  }, [allTasks]);

  const completedTasks = useMemo(() => {
    return allTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return task.completed && dueDate >= today;
    });
  }, [allTasks]);

  const displayedTasks = showCompletedTasks ? completedTasks : (showOverdueTasks ? overdueTasks : activeTasks);

  const totalPages = Math.ceil(displayedTasks.length / TASKS_PER_PAGE);

  const sortTasks = useCallback((tasks) => {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, []);

  const paginatedTasks = useMemo(() => {
    const sortedTasks = sortTasks(displayedTasks);
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    return sortedTasks.slice(startIndex, endIndex);
  }, [displayedTasks, currentPage, sortTasks]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleDeleteAllOverdue = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const deletePromises = overdueTasks.map(task => 
        fetch(`http://localhost:50001/api/tasks/${task._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      
      await Promise.all(deletePromises);
      setTasks(prevTasks => prevTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today || task.completed;
      }));
      
      toast.success('All overdue tasks deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting overdue tasks:', error);
      toast.error('Failed to delete overdue tasks');
    }
  }, [overdueTasks, setTasks]);

  const handleDeleteAllOverdueClick = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all overdue tasks?')) {
      handleDeleteAllOverdue();
    }
  }, [handleDeleteAllOverdue]);

  return (
    <div className="view">
      <div className="viewHeader">
        <div className="title flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-gray-700" />
          <span>Manage Tasks</span>
        </div>
        <div className="functions">
          <button className="button primary" onClick={openModal}>
            <Plus className="mr-2" size={18} />
            Add New Task
          </button>
          <button
            className={`button ${showCompletedTasks ? 'bg-blue-500' : 'bg-green-500'} text-white`}
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
          >
            {showCompletedTasks ? 'Show Active' : 'Show Completed'}
          </button>
          <button
            className={`button ${showOverdueTasks ? 'bg-red-500' : 'bg-gray-200'} text-white`}
            onClick={() => setShowOverdueTasks(!showOverdueTasks)}
          >
            {showOverdueTasks ? 'Hide Overdue' : 'Show Overdue'}
          </button>
          {showOverdueTasks && overdueTasks.length > 0 && (
            <div className="flex gap-2">
              <button
                className="button bg-red-600 text-white"
                onClick={handleDeleteAllOverdueClick}
              >
                Delete All Overdue
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAISidebar(true)}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors duration-200"
          >
            <Bot className="w-5 h-5 mr-2" />
            AI Assistant
          </button>
        </div>
      </div>
      <div className="taskContent">
        <div className="task-groups-container">
          {paginatedTasks.map((task, index) => (
            <React.Fragment key={task._id}>
              {(index === 0 || paginatedTasks[index - 1].group !== task.group) && (
                <h3 className="group-title flex items-center gap-2">
                  {task.group === 'Today' && <Calendar className="h-5 w-5 text-blue-600" />}
                  {task.group === 'Tomorrow' && <Sunrise className="h-5 w-5 text-blue-600" />}
                  {task.group === 'Future' && <Clock className="h-5 w-5 text-blue-600" />}
                  <span className="text-blue-600 font-semibold">{task.group}</span>
                </h3>
              )}
              <TaskItem
                task={task}
                onToggleComplete={handleToggleComplete}
                onRemove={handleRemoveTask}
                isDeleting={deletingTaskId === task._id}
              />
            </React.Fragment>
          ))}
          {paginatedTasks.length === 0 && (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>No Tasks Available</h3>
              <p>Add your first task to get started!</p>
            </div>
          )}
        </div>
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1 || totalPages === 0}>
            Previous
          </button>
          <span>
            {totalPages === 0 ? 'No pages available' : `${currentPage} / ${totalPages}`}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
            Next
          </button>
        </div>
      </div>
      <AddTaskModal isOpen={isModalOpen} onClose={closeModal} onAddTask={onAddTask} />
      <AISidebar isOpen={showAISidebar} onClose={() => setShowAISidebar(false)} />
    </div>
  );
});

const TaskItem = ({ task, onToggleComplete, onRemove, isDeleting }) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = !task.completed && dueDate < now;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`mb-2 p-3 bg-gray-50 rounded-md flex items-center justify-between ${
        task.completed ? 'opacity-70' : ''
      } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task._id)}
          className="mr-3 h-5 w-5 text-blue-500"
        />
        <div>
          <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600">
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
            {!task.allDay && task.start && task.end && (
              <span className="ml-2">
                {formatTime(task.start)} - {formatTime(task.end)}
              </span>
            )}
            {task.allDay && <span className="ml-2">(All day)</span>}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(task._id)}
        className="text-red-500 hover:text-red-700"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <div className="w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin"></div>
        ) : (
          <X size={18} />
        )}
      </button>
    </motion.div>
  );
};

export default TaskView;
