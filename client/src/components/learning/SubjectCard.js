import React from 'react';
import { motion } from 'framer-motion';
import { Book, ChevronDown, ChevronUp, Trash2, PenTool, GraduationCap, X } from 'lucide-react';
import { calculateOverallGrade, getGradeColor } from '../../utils/gradeCalculations';

const SubjectCard = ({ subject, isExpanded, onToggle, onDelete, onEdit, onGradeEntry, onDeleteScore }) => {
  const calculateProgress = () => {
    const graded = subject.assessments.filter(a => a.status === 'graded').length;
    return subject.assessments.length > 0 ? (graded / subject.assessments.length) * 100 : 0;
  };

  const currentGrade = calculateOverallGrade(subject);

  return (
    <motion.div layout className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{subject.name}</h3>
          <p className="text-sm text-gray-500">{subject.code}</p>
        </div>
        <div className="flex items-center space-x-2">
          {currentGrade !== null && (
            <span className={`font-bold ${getGradeColor(currentGrade)}`}>
              {currentGrade.toFixed(1)}%
            </span>
          )}
          <button
            onClick={() => onEdit(subject)}
            className="p-2 text-gray-400 hover:text-blue-500"
            title="Edit Subject"
          >
            <PenTool size={18} />
          </button>
          <button
            onClick={() => onGradeEntry(subject)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <GraduationCap size={18} />
          </button>
          <button
            onClick={() => onDelete(subject._id)}
            className="p-2 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => onToggle(subject._id)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <div className="space-y-2">
            {subject.assessments.map(assessment => (
              <div
                key={assessment._id}
                className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md"
              >
                <div>
                  <span className="font-medium">{assessment.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({(assessment.weight * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {assessment.status === 'graded' ? (
                    <>
                      <span className={getGradeColor(assessment.score)}>
                        {assessment.score}%
                      </span>
                      <button
                        onClick={() => onDeleteScore(subject._id, assessment._id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        title="Delete Score"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubjectCard;
