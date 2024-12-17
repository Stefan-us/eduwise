import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, GraduationCap, FileText, PenTool, Book, AlertCircle } from 'lucide-react';

const SubjectModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [assessments, setAssessments] = useState(initialData?.assessments || []);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setAssessments(initialData.assessments.map(assessment => ({
        ...assessment,
        id: assessment._id || Date.now() + Math.random(),
        weight: assessment.weight * 100
      })) || []);
    }
  }, [initialData]);

  const ASSESSMENT_TYPES = [
    { id: 'exam', label: 'Exams', icon: GraduationCap, color: 'text-purple-500' },
    { id: 'coursework', label: 'Coursework', icon: FileText, color: 'text-blue-500' },
    { id: 'participation', label: 'Participation', icon: PenTool, color: 'text-green-500' },
  ];

  const calculateTotalWeight = () => {
    return assessments.reduce((sum, a) => sum + Number(a.weight || 0), 0);
  };

  const calculateTypeWeight = (typeId) => {
    return assessments
      .filter(a => a.type === typeId)
      .reduce((sum, a) => sum + Number(a.weight || 0), 0);
  };

  const addAssessment = (type) => {
    const newAssessment = {
      id: Date.now(), // temporary id for frontend
      type,
      name: '',
      weight: 0,
      status: 'pending'
    };
    setAssessments([...assessments, newAssessment]);
  };

  const updateAssessment = (id, field, value) => {
    setAssessments(assessments.map(assessment =>
      assessment.id === id || assessment._id === id
        ? { ...assessment, [field]: field === 'weight' ? parseFloat(value) : value }
        : assessment
    ));
  };

  const removeAssessment = (id) => {
    setAssessments(assessments.filter(assessment => 
      assessment.id !== id && assessment._id !== id
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalWeight = calculateTotalWeight();
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Total weight must be 100%. Current total: ${totalWeight}%`);
      return;
    }

    try {
      const convertedAssessments = assessments.map(assessment => ({
        ...assessment,
        weight: Number(assessment.weight) / 100,
        _id: assessment._id || undefined
      }));

      await onSubmit({
        name,
        code,
        assessments: convertedAssessments
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save subject');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Assessments</h3>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${calculateTotalWeight() === 100 ? 'text-green-500' : 'text-orange-500'}`}>
                        Total Weight: {calculateTotalWeight()}%
                      </span>
                      {error && (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assessments */}
                  <div className="space-y-4">
                    {ASSESSMENT_TYPES.map(type => (
                      <div key={type.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <type.icon className={`w-5 h-5 mr-2 ${type.color}`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addAssessment(type.id)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        
                        {assessments
                          .filter(a => a.type === type.id)
                          .map(assessment => (
                            <motion.div
                              key={assessment.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
                            >
                              <input
                                type="text"
                                value={assessment.name}
                                onChange={(e) => updateAssessment(assessment.id, 'name', e.target.value)}
                                placeholder="Assessment name"
                                className="flex-1 px-2 py-1 border rounded-md text-sm"
                                required
                              />
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={assessment.weight}
                                  onChange={(e) => updateAssessment(assessment.id, 'weight', e.target.value)}
                                  placeholder="Weight"
                                  className="w-24 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm text-gray-500">%</span>
                                <button
                                  type="button"
                                  onClick={() => removeAssessment(assessment.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

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
                    {initialData ? 'Update Subject' : 'Add Subject'}
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

export default SubjectModal;

