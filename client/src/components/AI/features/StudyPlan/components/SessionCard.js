import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';

const SessionCard = ({ session, isExpanded, onToggle }) => {
  return (
    <motion.div
      className={`rounded-lg overflow-hidden ${
        session.completed ? 'bg-gray-50' : 'bg-white border border-gray-100'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${
            session.completed ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {session.completed ? (
              <BookOpen className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="text-left">
            <h4 className="font-medium">{session.topic}</h4>
            <p className="text-sm text-gray-500">
              {session.day} at {session.time} • {session.duration}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              <div className="pl-14">
                <h5 className="text-sm font-medium mb-2">Resources</h5>
                <ul className="space-y-2">
                  {session.resources.map((resource, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
              {!session.completed && (
                <div className="pl-14">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Add to Calendar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SessionCard;
