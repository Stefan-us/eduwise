import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyPlanContent from './StudyPlan/StudyPlanContent';
import ResourceRecommendationsContent from './Resources/ResourceRecommendationsContent';
import PerformanceAnalysisContent from './Performance/PerformanceAnalysisContent';
import '../../../styles/AI/AISidebar.css';

const AIFeatureModal = ({ isOpen, onClose, feature, onExpandChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(newExpandedState);
  };

  const handleGeneratePlan = (planData) => {
    console.log('Generating plan:', planData);
    onClose();
  };

  const renderContent = () => {
    console.log('Rendering content for:', feature?.title);
    switch (feature?.title) {
      case "Study Plan Generation":
        return <StudyPlanContent onGeneratePlan={handleGeneratePlan} />;
      case "Resource Recommendations":
        return <ResourceRecommendationsContent />;
      case "Performance Analysis":
        return <PerformanceAnalysisContent />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95 }}
              animate={{
                scale: 1,
                width: isExpanded ? '90vw' : '600px',
                height: isExpanded ? '90vh' : '600px',
                x: isExpanded ? 0 : -190,
              }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative bg-white rounded-lg shadow-xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center space-x-2">
                  {feature?.icon}
                  <Dialog.Title className="text-lg font-medium">
                    {feature?.title}
                  </Dialog.Title>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExpand}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 h-[calc(100%-4rem)] overflow-y-auto">
                {renderContent()}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AIFeatureModal;