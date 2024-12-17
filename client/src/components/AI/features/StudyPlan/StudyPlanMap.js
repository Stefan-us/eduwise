import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyPlanCard from './components/StudyPlanCard';
import SessionCard from './components/SessionCard';
import StudyPlanProgress from './components/StudyPlanProgress';
import { Plus } from 'lucide-react';
import axios from 'axios';

const StudyPlanMap = ({ onCreateNew }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/study-plans');
        setPlans(response.data);
        if (response.data.length > 0) {
          setSelectedPlan(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load study plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanComplete = async (sessionId) => {
    try {
      await axios.put(`/api/study-plans/${selectedPlan._id}/sessions/${sessionId}/complete`);
      // Refresh the plans after marking a session complete
      const response = await axios.get('/api/study-plans');
      setPlans(response.data);
      setSelectedPlan(response.data.find(p => p._id === selectedPlan._id));
    } catch (err) {
      setError('Failed to update session status');
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Study Plans List */}
      <div className="w-1/3 border-r border-gray-100 p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light">Study Plans</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {plans.map((plan) => (
            <StudyPlanCard
              key={plan._id}
              plan={plan}
              isSelected={selectedPlan?._id === plan._id}
              onClick={setSelectedPlan}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Selected Plan Details */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {selectedPlan ? (
            <motion.div
              key={selectedPlan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-light mb-2">{selectedPlan.subject}</h2>
                <p className="text-gray-500">{selectedPlan.goal}</p>
              </div>

              <StudyPlanProgress progress={selectedPlan.progress} />

              {selectedPlan.nextSession && (
                <div>
                  <h3 className="text-xl font-light mb-4">Next Session</h3>
                  <SessionCard
                    session={selectedPlan.nextSession}
                    isExpanded={expandedSession === 'next'}
                    onToggle={() => setExpandedSession(
                      expandedSession === 'next' ? null : 'next'
                    )}
                  />
                </div>
              )}

              {selectedPlan.upcomingSessions?.length > 0 && (
                <div>
                  <h3 className="text-xl font-light mb-4">Upcoming Sessions</h3>
                  <div className="space-y-4">
                    {selectedPlan.upcomingSessions.map((session) => (
                      <SessionCard
                        key={session._id}
                        session={session}
                        isExpanded={expandedSession === session._id}
                        onToggle={() => setExpandedSession(
                          expandedSession === session._id ? null : session._id
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a study plan to view details
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyPlanMap;
