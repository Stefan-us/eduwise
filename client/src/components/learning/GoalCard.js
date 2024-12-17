import React, { useState } from 'react';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';

const GoalCard = ({ goal, onComplete, onDelete, onUpdateProgress }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  // Check if goal is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(goal.targetDate);
    dueDate.setHours(0, 0, 0, 0);
    return !goal.completed && dueDate < today;
  };

  const progressColor = goal.progress >= 75 ? 'bg-green-500' : 
                       goal.progress >= 50 ? 'bg-yellow-500' : 
                       'bg-blue-500';

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    onUpdateProgress(goal._id, newProgress);
  };

  return (
    <div className={`rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
      goal.completed ? 'bg-green-50 border-l-4 border-green-500' : 
      isOverdue() ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-semibold text-lg ${
          goal.completed ? 'text-green-700' :
          isOverdue() ? 'text-red-700' : ''
        }`}>{goal.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onComplete(goal._id)}
            className={`p-1 rounded-full transition-colors ${
              goal.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
            }`}
          >
            <CheckCircle size={20} />
          </button>
          <button
            onClick={() => onDelete(goal._id)}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
      )}

      <div className={`flex items-center text-sm mb-3 ${
        goal.completed ? 'text-green-600' :
        isOverdue() ? 'text-red-600' : 'text-gray-500'
      }`}>
        <Clock size={16} className="mr-1" />
        <span>
          Due: {new Date(goal.targetDate).toLocaleDateString()}
        </span>
      </div>

      <div className="relative pt-1"
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {goal.progress}%
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${goal.progress}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor} transition-all duration-500`}
            />
          </div>
          {showSlider && (
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress}
              onChange={handleProgressChange}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;

