import { useMemo } from 'react';
import axios from 'axios';

export const useAxios = () => {
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:50001/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token found');
            }
            
            const response = await axios.post('/auth/refresh-token', 
              { token: refreshToken },
              { baseURL: 'http://localhost:50001/api' }
            );
            
            if (response.data.accessToken) {
              localStorage.setItem('accessToken', response.data.accessToken);
              localStorage.setItem('refreshToken', response.data.refreshToken);
              instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  return axiosInstance;
};