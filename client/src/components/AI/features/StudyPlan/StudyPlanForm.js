import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import axios from 'axios';

const StudyPlanForm = ({ onGeneratePlan, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    goal: '',
    deadline: '',
    preferredTimes: [],
    restrictions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    subject: false,
    goal: false,
    deadline: false,
    preferredTimes: false
  });

  const validateStep = (currentStep) => {
    setError(null);
    setFieldErrors({
      subject: false,
      goal: false,
      deadline: false,
      preferredTimes: false
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (currentStep) {
      case 1:
        if (!formData.subject.trim()) {
          setFieldErrors(prev => ({ ...prev, subject: true }));
          return false;
        }
        if (!formData.goal.trim()) {
          setFieldErrors(prev => ({ ...prev, goal: true }));
          return false;
        }
        break;
      case 2:
        if (!formData.deadline) {
          setFieldErrors(prev => ({ ...prev, deadline: true }));
          return false;
        }
        if (formData.preferredTimes.length === 0) {
          setFieldErrors(prev => ({ ...prev, preferredTimes: true }));
          return false;
        }
        
        const selectedDate = new Date(formData.deadline);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
          setFieldErrors(prev => ({ ...prev, deadline: true }));
          return false;
        }
        break;
      case 3:
        return true;
      default:
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        setLoading(true);
        const response = await axios.post('/api/study-plans/generate', formData);
        onGeneratePlan?.(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to generate study plan');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-light">What would you like to learn?</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => {
                    setFieldErrors(prev => ({ ...prev, subject: false }));
                    setFormData({ ...formData, subject: e.target.value });
                  }}
                  className={`w-full border-b py-3 text-xl focus:outline-none transition-colors ${
                    fieldErrors.subject 
                      ? 'border-red-400' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter subject"
                />
                {fieldErrors.subject && (
                  <p className="text-sm text-red-500 mt-1">Please enter a subject</p>
                )}
              </div>
              <div className="space-y-1">
                <textarea
                  value={formData.goal}
                  onChange={(e) => {
                    setFieldErrors(prev => ({ ...prev, goal: false }));
                    setFormData({ ...formData, goal: e.target.value });
                  }}
                  className={`w-full border-b py-3 text-xl focus:outline-none transition-colors resize-none ${
                    fieldErrors.goal 
                      ? 'border-red-400' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Describe your learning goals..."
                  rows={3}
                />
                {fieldErrors.goal && (
                  <p className="text-sm text-red-500 mt-1">Please describe your learning goals</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-light">When do you study best?</h2>
            <div className={`grid grid-cols-2 gap-4 ${fieldErrors.preferredTimes ? 'bg-red-50 p-4 rounded-lg' : ''}`}>
              {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                <motion.button
                  key={time}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFieldErrors(prev => ({ ...prev, preferredTimes: false }));
                    const times = formData.preferredTimes.includes(time)
                      ? formData.preferredTimes.filter(t => t !== time)
                      : [...formData.preferredTimes, time];
                    setFormData({ ...formData, preferredTimes: times });
                  }}
                  className={`p-4 rounded-lg transition-all ${
                    formData.preferredTimes.includes(time)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Target completion date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => {
                  setFieldErrors(prev => ({ ...prev, deadline: false }));
                  setFormData({ ...formData, deadline: e.target.value });
                }}
                className={`w-full border-b py-3 text-xl focus:outline-none transition-colors ${
                  fieldErrors.deadline 
                    ? 'border-red-400' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              />
              {fieldErrors.deadline && (
                <p className="text-sm text-red-500 mt-1">Please select a future date</p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-light">Any restrictions?</h2>
            <div className="space-y-4">
              {['No weekends', 'No early mornings', 'No late nights'].map((restriction) => (
                <motion.button
                  key={restriction}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const restrictions = formData.restrictions.includes(restriction)
                      ? formData.restrictions.filter(r => r !== restriction)
                      : [...formData.restrictions, restriction];
                    setFormData({ ...formData, restrictions });
                  }}
                  className={`w-full p-4 rounded-lg transition-all ${
                    formData.restrictions.includes(restriction)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {restriction}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-2xl font-light">Create Study Plan</h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                  stepNumber === step
                    ? 'bg-blue-500'
                    : stepNumber < step
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : step === 3 ? 'Generate Plan' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default StudyPlanForm;
