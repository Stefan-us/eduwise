import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Book, Brain, X, BookOpen, Library, BarChart2 } from 'lucide-react';
import '../../styles/AI/AISidebar.css';
import AIFeatureModal from './features/AIFeatureModal';

const features = [
  {
    title: "Study Plan Generation",
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    description: "Generate personalized study plans based on your goals."
  },
  {
    title: "Resource Recommendations",
    icon: <Library className="w-5 h-5 text-green-500" />,
    description: "Get recommended learning resources and materials."
  },
  {
    title: "Performance Analysis",
    icon: <BarChart2 className="w-5 h-5 text-purple-500" />,
    description: "Analyze your learning progress and performance."
  }
];

const AISidebar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalExpanded, setIsModalExpanded] = useState(false);

  const handleModalExpandChange = (expanded) => {
    setIsModalExpanded(expanded);
  };

  const handleCloseModal = () => {
    setSelectedFeature(null);
    setIsModalExpanded(false);
  };

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement AI query handling
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isModalExpanded && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="ai-sidebar"
          >
            <div className="ai-sidebar-header">
              <div className="flex items-center">
                <Bot className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold">AI Assistant</h2>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="ai-sidebar-content">
              <form onSubmit={handleSubmit} className="ai-query-form">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything..."
                    className="ai-query-input"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ai-query-button"
                  >
                    {isLoading ? (
                      <div className="loading-spinner" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>

              <div className="ai-features">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Features</h3>
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="ai-feature-card"
                    onClick={() => handleFeatureClick(feature)}
                  >
                    <div className="flex items-center mb-2">
                      {feature.icon}
                      <h4 className="ml-2 font-medium">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIFeatureModal
        isOpen={selectedFeature !== null}
        onClose={handleCloseModal}
        feature={selectedFeature}
        onExpandChange={handleModalExpandChange}
      />
    </>
  );
};

export default AISidebar;
