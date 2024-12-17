import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ActivitiesPage from './pages/ActivitiesPage';
import Layout from './components/Layout/Layout';
import axios from 'axios';
import { debounce } from 'lodash';
import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { LearningProvider } from './contexts/LearningContext';
import LearningPage from './pages/LearningPage';
import TestVisualizer from './components/visualization/TestVisualizer';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [tasks, setTasks] = useState([]);

  const axiosInstance = axios.create();
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && error.response.data.tokenExpired && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await refreshToken();
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('http://localhost:50001/api/auth/refresh-token', { refreshToken });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
      throw error;
    }
  };

  const debouncedFetchTasks = useCallback(
    async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No token found, skipping task fetch');
          return;
        }
        const response = await axiosInstance.get('http://localhost:50001/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    },
    [axiosInstance, handleLogout]
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthChecked(true);
  }, []);

  useEffect(() => {
    const debouncedFetch = debounce(debouncedFetchTasks, 5000);
    if (user && localStorage.getItem('accessToken')) {
      debouncedFetch();
    }
    return () => debouncedFetch.cancel();
  }, [user, debouncedFetchTasks]);

  const handleLogin = (userData) => {
    const updatedUser = { 
      ...userData.user,
      birthday: userData.user.birthday ? new Date(userData.user.birthday).toISOString() : null
    };
    setUser(updatedUser);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleUpdateUser = async (updatedUserData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found, please log in again');
      }

      const response = await axiosInstance.put('http://localhost:50001/api/user/update', updatedUserData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAddTask = useCallback(async (taskData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.post('http://localhost:50001/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prevTasks => [...prevTasks, response.data]);
      console.log('handleAddTask called:', taskData);
    } catch (error) {
      console.error('Error adding task:', error.response ? error.response.data : error.message);
    }
  }, [axiosInstance]);

  const removeTask = useCallback(async (taskId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axiosInstance.delete(`http://localhost:50001/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));  // Change to _id
    } catch (error) {
      console.error('Error removing task:', error.response ? error.response.data : error.message);
    }
  }, [axiosInstance]);

  const updateTask = useCallback(async (taskId, updatedTaskData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.put(`http://localhost:50001/api/tasks/${taskId}`, updatedTaskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? response.data : task));
      // Trigger a re-fetch of tasks
      debouncedFetchTasks();
    } catch (error) {
      console.error('Error updating task:', error.response ? error.response.data : error.message);
    }
  }, [axiosInstance, debouncedFetchTasks]);

  return (
    <UserProvider>
      <TaskProvider>
        <LearningProvider>
          <Router>
            <div className="App">
              {isAuthChecked && (
                <Routes>
                  <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleLogin} />} />
                  <Route path="/dashboard" element={
                    user ? (
                      <Layout user={user} onLogout={handleLogout}>
                        <DashboardPage user={user} onAddTask={handleAddTask} tasks={tasks} updateTask={updateTask} />
                      </Layout>
                    ) : <Navigate to="/login" />
                  } />
                  <Route path="/profile" element={
                    user ? (
                      <Layout user={user} onLogout={handleLogout}>
                        <ProfilePage user={user} onUpdateUser={handleUpdateUser} />
                      </Layout>
                    ) : <Navigate to="/login" />
                  } />
                  <Route path="/activities" element={
                    user ? (
                      <Layout user={user} onLogout={handleLogout}>
                        <ActivitiesPage user={user} tasks={tasks} removeTask={removeTask} updateTask={updateTask} />
                      </Layout>
                    ) : <Navigate to="/login" />
                  } />
                  <Route path="/learning" element={
                    user ? (
                      <Layout user={user} onLogout={handleLogout}>
                        <LearningProvider>
                          <LearningPage />
                        </LearningProvider>
                      </Layout>
                    ) : <Navigate to="/login" />
                  } />
                  <Route path="/test-results" element={
                    user ? (
                      <Layout user={user} onLogout={handleLogout}>
                        <TestVisualizer />
                      </Layout>
                    ) : <Navigate to="/login" />
                  } />
                  <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                  <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
              )}
            </div>
          </Router>
        </LearningProvider>
      </TaskProvider>
    </UserProvider>
  );
}

export default App;
