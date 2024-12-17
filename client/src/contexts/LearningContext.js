import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LearningContext = createContext();

export const useLearning = () => useContext(LearningContext);

export const LearningProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get('http://localhost:50001/api/learning-goals', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGoals(response.data);
      } catch (error) {
        console.error('Error fetching learning goals:', error.response?.data || error.message);
      }
    };

    fetchGoals();
  }, []);

  const addGoal = async (goal) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('http://localhost:50001/api/learning-goals', goal, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setGoals(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding learning goal:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateGoal = async (id, updates) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`http://localhost:50001/api/learning-goals/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(prev => prev.map(goal => 
        goal._id === id ? response.data : goal
      ));
    } catch (error) {
      console.error('Error updating learning goal:', error);
      throw error;
    }
  };

  const removeGoal = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:50001/api/learning-goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(prev => prev.filter(goal => goal._id !== id));
    } catch (error) {
      console.error('Error removing learning goal:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get('http://localhost:50001/api/subjects', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error.response?.data || error.message);
      }
    };

    fetchSubjects();
  }, []);

  const addSubject = async (subjectData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('http://localhost:50001/api/subjects', subjectData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSubjects(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding subject:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateSubject = async (id, updates) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`http://localhost:50001/api/subjects/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(prev => prev.map(subject => 
        subject._id === id ? response.data : subject
      ));
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  };

  const removeSubject = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:50001/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(prev => prev.filter(subject => subject._id !== id));
    } catch (error) {
      console.error('Error removing subject:', error);
      throw error;
    }
  };

  const addAssignment = async (subjectId, assignment) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Adding assignment:', { subjectId, assignment });

      const response = await axios.post(
        `http://localhost:50001/api/subjects/${subjectId}/assignments`,
        {
          title: assignment.title,
          type: assignment.type || 'other',
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore || 100,
          notes: assignment.notes || '',
          learningMaterials: assignment.learningMaterials || [],
          status: assignment.status || 'pending'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId ? response.data : subject
      ));
      return response.data;
    } catch (error) {
      console.error('Error adding assignment:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateAssignment = async (subjectId, assignmentId, updates) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:50001/api/subjects/${subjectId}/assignments/${assignmentId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId ? response.data : subject
      ));
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  };

  const deleteAssignment = async (subjectId, assignmentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `http://localhost:50001/api/subjects/${subjectId}/assignments/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId
          ? {
              ...subject,
              assignments: subject.assignments.filter(a => a._id !== assignmentId)
            }
          : subject
      ));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:50001/api/learning-goals/${goalId}`,
        { progress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? response.data : goal
      ));
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  };

  const removeAssignment = async (subjectId, assignmentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `http://localhost:50001/api/subjects/${subjectId}/assignments/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId
          ? {
              ...subject,
              assignments: subject.assignments.filter(a => a._id !== assignmentId)
            }
          : subject
      ));
    } catch (error) {
      console.error('Error removing assignment:', error);
      throw error;
    }
  };

  const updateGrades = async (subjectId, grades) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.put(
        `http://localhost:50001/api/subjects/${subjectId}/grades`,
        { grades },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId ? response.data : subject
      ));

      return response.data;
    } catch (error) {
      console.error('Error updating grades:', error);
      throw error;
    }
  };

  const getSubjectProgress = async (subjectId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `http://localhost:50001/api/subjects/${subjectId}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching subject progress:', error.response?.data || error.message);
      throw error;
    }
  };

  const deleteAssessmentScore = async (subjectId, assessmentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(
        `http://localhost:50001/api/subjects/${subjectId}/assessments/${assessmentId}/score`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubjects(prev => prev.map(subject =>
        subject._id === subjectId ? response.data : subject
      ));
    } catch (error) {
      console.error('Error deleting assessment score:', error);
      throw error;
    }
  };

  return (
    <LearningContext.Provider value={{
      goals,
      subjects,
      addGoal,
      updateGoal,
      removeGoal,
      addSubject,
      updateSubject,
      removeSubject,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      updateGoalProgress,
      removeAssignment,
      updateGrades,
      getSubjectProgress,
      deleteAssessmentScore
    }}>
      {children}
    </LearningContext.Provider>
  );
};
