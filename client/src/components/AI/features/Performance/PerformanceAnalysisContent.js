import React from 'react';

const PerformanceAnalysisContent = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium mb-4">Performance Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-gray-500">Tasks Completed</div>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-gray-500">Study Hours</div>
          <div className="text-2xl font-bold">32</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-2xl font-bold">78%</div>
        </div>
      </div>
    </div>
    
    <div>
      <h3 className="font-medium mb-4">Recent Activity</h3>
      <div className="space-y-2">
        {['Completed Math Assignment', 'Studied Physics', 'Read Chapter 5'].map((activity) => (
          <div key={activity} className="p-3 border rounded hover:bg-gray-50">
            {activity}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PerformanceAnalysisContent;