import React from 'react';
import { Calendar, CheckCircle, Edit2, Trash2 } from 'lucide-react';

const AssignmentList = ({ assignments, onUpdate, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="divide-y divide-gray-200">
      {assignments.map(assignment => (
        <div key={assignment._id} 
          className={`p-4 hover:bg-gray-50 ${
            assignment.status === 'completed' ? 'bg-gray-100' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                <span className={`ml-2 text-sm ${getStatusColor(assignment.status)}`}>
                  ({assignment.status})
                </span>
              </div>
              
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-1" />
                {formatDate(assignment.dueDate)}
              </div>
              
              {assignment.notes && (
                <p className="mt-1 text-sm text-gray-600">{assignment.notes}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {assignment.score !== undefined && (
                <span className="text-sm font-medium text-gray-900">
                  {assignment.score}/{assignment.maxScore}
                </span>
              )}
              
              <button
                onClick={() => onUpdate(assignment._id, {
                  status: assignment.status === 'completed' ? 'pending' : 'completed'
                })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <CheckCircle size={18} className={getStatusColor(assignment.status)} />
              </button>
              
              <button
                onClick={() => onDelete(assignment._id)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
