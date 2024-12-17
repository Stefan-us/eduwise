import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../utils/chartPlugins';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TestVisualizer() {
  const [visualData, setVisualData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:50001/api/test-results')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data?.chartData) throw new Error('Invalid data format');
        setVisualData(data);
      })
      .catch(error => {
        console.error('Error fetching visualization data:', error);
        setError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (error) return <div className="text-red-500">Error loading visualizations: {error}</div>;
  if (!visualData) return <div>Loading visualizations...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Study Plan Test Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Completion Rates</h2>
          <Line 
            data={visualData.chartData.completionRates.data} 
            options={{...chartOptions, ...visualData.chartData.completionRates.options}} 
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Time Slot Effectiveness</h2>
          <Bar 
            data={visualData.chartData.timeSlotEffectiveness.data} 
            options={{...chartOptions, ...visualData.chartData.timeSlotEffectiveness.options}} 
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Learning Progression</h2>
          <Line 
            data={visualData.chartData.learningProgression.data} 
            options={{...chartOptions, ...visualData.chartData.learningProgression.options}} 
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-600">Total Scenarios</p>
            <p className="text-2xl font-bold">{visualData.summary.totalScenarios}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Average Completion</p>
            <p className="text-2xl font-bold">
              {(visualData.summary.averageCompletionRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Best Time Slot</p>
            <p className="text-2xl font-bold">{visualData.summary.bestPerformingTimeSlot.slot}</p>
          </div>
        </div>
      </div>
    </div>
  );
}