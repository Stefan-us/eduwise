import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X, GraduationCap, FileText, PenTool } from 'lucide-react';

const GradeEntryModal = ({ isOpen, onClose, subject, onSubmit }) => {
  const [grades, setGrades] = useState({});
  const [selectedType, setSelectedType] = useState('exam');

  const ASSESSMENT_TYPES = [
    { id: 'exam', label: 'Exams', icon: GraduationCap, color: 'text-purple-500' },
    { id: 'coursework', label: 'Coursework', icon: FileText, color: 'text-blue-500' },
    { id: 'participation', label: 'Participation', icon: PenTool, color: 'text-green-500' },
  ];

  const getAssessmentsByType = (type) => {
    return subject.assessments.filter(a => a.type === type);
  };

  const handleGradeChange = (assessmentId, value) => {
    setGrades({
      ...grades,
      [assessmentId]: value ? parseFloat(value) : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedGrades = { ...subject.assessments.reduce((acc, a) => ({ ...acc, [a._id]: a.score }), {}), ...grades };
    onSubmit(updatedGrades);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <GraduationCap className="text-blue-500 mr-2" size={24} />
                  <Dialog.Title className="text-lg font-medium">Enter Grades for {subject.name}</Dialog.Title>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-4" aria-label="Assessment Types">
                  {ASSESSMENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-t-lg ${
                        selectedType === type.id
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <type.icon className={`w-4 h-4 mr-2 ${type.color}`} />
                      {type.label}
                    </button>
                  ))}
                </nav>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {getAssessmentsByType(selectedType).map(assessment => (
                  <motion.div
                    key={assessment._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{assessment.name}</h3>
                        <p className="text-sm text-gray-500">
                          Weight: {(assessment.weight * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          value={grades[assessment._id] || ''}
                          onChange={(e) => handleGradeChange(assessment._id, e.target.value)}
                          placeholder="Grade"
                          className="w-24 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          max="100"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                  >
                    Save Grades
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GradeEntryModal;