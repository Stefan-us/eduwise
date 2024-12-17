import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock } from 'lucide-react';

const StudyPlanCard = ({ plan, isSelected, onClick }) => {
  return (
    <motion.button
      onClick={() => onClick(plan)}
      className={`w-full text-left p-6 rounded-lg transition-all ${
        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-gray-100'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="text-lg font-medium mb-2">{plan.subject}</h3>
      <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
        {plan.goal}
      </p>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Next: {plan.nextSession?.day} at {plan.nextSession?.time}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span className="text-sm">{plan.progress}%</span>
        </div>
      </div>
    </motion.button>
  );
};

export default StudyPlanCard;
