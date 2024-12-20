import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Brain, Target, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = 'http://localhost:50001';

const PerformanceAnalysisContent = () => {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeframe]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/performance/metrics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMetrics(response.data.metrics);
      setTrends(response.data.trends);
      setError(null);
    } catch (err) {
      setError('Failed to load performance data');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('accessToken');
      window.location.href = `${API_BASE_URL}/api/performance/export?format=${format}&token=${token}`;
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const chartData = {
    labels: trends?.[timeframe]?.map((_, index) => `Point ${index + 1}`) || [],
    datasets: [
      {
        label: 'Session Completion',
        data: trends?.[timeframe]?.map(t => t.sessionCompletionRate) || [],
        borderColor: '#000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Learning Progress',
        data: trends?.[timeframe]?.map(t => t.learningVelocity) || [],
        borderColor: '#666',
        backgroundColor: 'rgba(102, 102, 102, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#000',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16">
          <RefreshCw className="w-full h-full animate-spin text-black" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchPerformanceData}
          className="px-6 py-2 bg-black text-white hover:bg-gray-900 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Inter']">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {['overview', 'trends', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs text-gray-500">Completion Rate</span>
            </div>
            <div className="text-3xl font-light">
              {(metrics?.sessionCompletionRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-5 h-5" />
              <span className="text-xs text-gray-500">Avg. Duration</span>
            </div>
            <div className="text-3xl font-light">
              {Math.round(metrics?.averageSessionDuration)}m
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-5 h-5" />
              <span className="text-xs text-gray-500">Topics/Hour</span>
            </div>
            <div className="text-3xl font-light">
              {metrics?.learningVelocity.toFixed(1)}
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-5 h-5" />
              <span className="text-xs text-gray-500">AI Prediction</span>
            </div>
            <div className="text-3xl font-light">
              {(metrics?.predictedPerformance * 100).toFixed(1)}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Trends Section */}
      {activeTab === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Performance Trends</h3>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white text-sm focus:outline-none focus:border-black"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="bg-white p-6 border border-gray-100">
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations Section */}
      {activeTab === 'recommendations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {metrics?.recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white p-6 border border-gray-100 transition-all hover:border-black"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  rec.priority === 'high' ? 'bg-black' : 'bg-gray-400'
                }`} />
                <div>
                  <div className="text-sm font-medium mb-1">
                    {rec.priority.toUpperCase()} PRIORITY
                  </div>
                  <p className="text-gray-600">{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Export Options */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          CSV
        </button>
        <button
          onClick={() => handleExport('json')}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          JSON
        </button>
      </div>
    </div>
  );
};

export default PerformanceAnalysisContent;