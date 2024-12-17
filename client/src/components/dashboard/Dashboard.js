import React from 'react';
import TaskView from './TaskView';
import '../../styles/dashboard/Dashboard.css';


const Dashboard = ({ user, tasks, onAddTask }) => {
  console.log('Dashboard received onAddTask:', onAddTask);

  return (
    <div className="dashboard">
      <TaskView onAddTask={onAddTask} />
    </div>
  );
};

export default Dashboard;
