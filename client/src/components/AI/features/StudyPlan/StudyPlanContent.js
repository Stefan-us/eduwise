import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';

const StudyPlanContent = ({ onGeneratePlan }) => {
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
  const [recentPlans, setRecentPlans] = useState([]);

  useEffect(() => {
    const fetchRecentPlans = async () => {
      try {
        const response = await axios.get('/api/study-plans');
        setRecentPlans(response.data.slice(0, 3)); // Get 3 most recent plans
      } catch (err) {
        console.error('Failed to fetch recent plans:', err);
      }
    };

    fetchRecentPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current step
    if (step === 1 && (!formData.subject.trim() || !formData.goal.trim())) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 2 && (!formData.deadline || formData.preferredTimes.length === 0)) {
      setError('Please select your preferred times and deadline');
      return;
    }

    if (step < 3) {
      setError(null);
      setStep(step + 1);
    } else {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post('/api/study-plans/generate', formData);
        onGeneratePlan?.(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to generate study plan');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRecentPlanClick = (plan) => {
    setFormData({
      ...formData,
      subject: plan.subject,
      goal: plan.goal,
      deadline: plan.deadline || '',
      preferredTimes: plan.preferredTimes || [],
      restrictions: plan.restrictions || []
    });
    setError(null);
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
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter subject"
              />
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Describe your learning goals..."
                rows={3}
              />
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
            <div className="grid grid-cols-2 gap-4">
              {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                <motion.button
                  key={time}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
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
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
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
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
        
        {/* Navigation Footer */}
        <div className="mt-8 border-t border-gray-100 pt-6">
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
                  onClick={() => setStep(step - 1)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <span>
                  {loading 
                    ? 'Processing...' 
                    : step === 3 
                      ? 'Generate Plan' 
                      : 'Continue'
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Study Plans Section */}
      {step === 1 && (
        <div className="px-6 pb-6 mt-auto border-t border-gray-100 pt-6">
          <h3 className="font-medium mb-4 text-gray-600">Recent Study Plans</h3>
          <div className="space-y-2">
            {recentPlans.map((plan) => (
              <motion.button
                key={plan.id}
                onClick={() => handleRecentPlanClick(plan)}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-medium group-hover:text-blue-500 transition-colors">
                  {plan.subject}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{plan.goal}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Created {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-500">
                    Due {new Date(plan.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plan.preferredTimes.map((time) => (
                    <span key={time} className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded">
                      {time}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanContent;
