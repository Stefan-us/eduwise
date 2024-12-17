import React, { useState, useEffect } from 'react';
import Dashboard from '../components/dashboard/Dashboard';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { Book, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import DashboardCard from '../components/dashboard/DashboardCard';

const DashboardPage = ({ onAddTask }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { tasks } = useTasks();

  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
    }
  }, [user]);

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => {
    if (!task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  });
  const overdueTasks = tasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  useEffect(() => {
    document.title = 'Eduwise - Dashboard';
    return () => {
      document.title = 'Eduwise';
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error: Unable to load user data. Please try logging in again.</div>;
  }

  console.log('User data in DashboardPage:', user);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        Welcome back, {user.firstName || user.username || 'there'} 
        <span role="img" aria-label="wave">👋</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card active">
          <DashboardCard
            title="Active Tasks"
            icon={<Clock className="h-8 w-8 text-blue-500" />}
            value={activeTasks.length.toString()}
          />
        </div>
        <div className="dashboard-card overdue">
          <DashboardCard
            title="Overdue Tasks"
            icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
            value={overdueTasks.length.toString()}
          />
        </div>
        <div className="dashboard-card completed">
          <DashboardCard
            title="Completed Tasks"
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            value={completedTasks.length.toString()}
          />
        </div>
      </div>
      <Dashboard user={user} tasks={tasks} onAddTask={onAddTask} />
    </>
  );
};

export default DashboardPage;
