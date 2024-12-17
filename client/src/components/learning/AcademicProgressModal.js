import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X, GraduationCap, Award, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { calculateOverallGrade, getGradeColor, getGradeLabel } from '../../utils/gradeCalculations';
import DetailedGradeCalculator from './DetailedGradeCalculator';
import { backgroundZonesPlugin } from '../../utils/chartPlugins';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.register(backgroundZonesPlugin);

const AcademicProgressModal = ({ isOpen, onClose, subjects }) => {
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState(null);

  const calculateGradeClass = (grade) => {
    if (grade >= 70) return 'text-green-500';
    if (grade >= 60) return 'text-blue-500';
    if (grade >= 50) return 'text-yellow-500';
    if (grade >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeLabel = (grade) => {
    if (grade >= 70) return 'First';
    if (grade >= 60) return '2:1';
    if (grade >= 50) return '2:2';
    if (grade >= 40) return 'Third';
    return 'Fail';
  };

  const calculateRequiredGrades = (subject) => {
    const completedAssessments = subject.assessments.filter(a => a.status === 'graded');
    const completedWeight = completedAssessments.reduce((sum, a) => sum + a.weight, 0);
    const currentGrade = calculateOverallGrade(subject);
    const remainingWeight = 1 - completedWeight;

    if (remainingWeight === 0) return null;

    const grades = [
      { name: 'First', min: 70 },
      { name: '2:1', min: 60 },
      { name: '2:2', min: 50 },
      { name: 'Third', min: 40 }
    ];

    return grades.map(grade => {
      const required = ((grade.min - currentGrade * completedWeight) / remainingWeight);
      return {
        ...grade,
        required,
        possible: required <= 100
      };
    });
  };

  const gradedSubjects = subjects.filter(s => calculateOverallGrade(s) !== null);

  const chartData = {
    labels: gradedSubjects.map(s => s.code),
    datasets: [
      {
        label: 'Current Grade',
        data: gradedSubjects.map(s => calculateOverallGrade(s) || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Overall Average',
        data: Array(gradedSubjects.length).fill(
          gradedSubjects.reduce((sum, s) => sum + (calculateOverallGrade(s) || 0), 0) / gradedSubjects.length
        ),
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          drawOnChartArea: true,
          color: function(context) {
            const value = context.tick.value;
            // Make regular grid lines very light
            return 'rgba(229, 231, 235, 0.2)';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      // Add custom background zones plugin
      backgroundZones: {
        zones: [
          {
            yMin: 70,
            yMax: 100,
            color: 'rgba(34, 197, 94, 0.1)', // green
          },
          {
            yMin: 60,
            yMax: 70,
            color: 'rgba(234, 179, 8, 0.1)', // yellow
          },
          {
            yMin: 50,
            yMax: 60,
            color: 'rgba(234, 179, 8, 0.15)', // darker yellow
          },
          {
            yMin: 40,
            yMax: 50,
            color: 'rgba(249, 115, 22, 0.1)', // orange
          },
          {
            yMin: 0,
            yMax: 40,
            color: 'rgba(239, 68, 68, 0.1)', // red
          }
        ]
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-lg font-medium flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-blue-500" />
              Academic Progress
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map(subject => (
                <motion.div
                  key={subject._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedSubjectDetail(subject)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    </div>
                    {calculateOverallGrade(subject) !== null && (
                      <div className={`text-lg font-bold ${calculateGradeClass(calculateOverallGrade(subject))}`}>
                        {calculateOverallGrade(subject).toFixed(1)}%
                        <div className="text-sm font-normal">
                          {getGradeLabel(calculateOverallGrade(subject))}
                        </div>
                      </div>
                    )}
                  </div>

                  {calculateRequiredGrades(subject) && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Required Grades</h4>
                      {calculateRequiredGrades(subject).map((grade, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded ${
                            grade.possible ? 'bg-blue-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span>{grade.name}</span>
                            {grade.possible ? (
                              <span className={grade.required <= 0 ? 'text-green-600' : 'text-blue-600'}>
                                {grade.required <= 0 ? 'Guaranteed!' : `Need ${Math.round(grade.required)}%`}
                              </span>
                            ) : (
                              <span className="text-red-600">Not possible</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 mt-4">
                    {subject.assessments.map(assessment => (
                      <div
                        key={assessment._id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{assessment.name}</span>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">
                            {(assessment.weight * 100).toFixed(0)}%
                          </span>
                          {assessment.status === 'graded' ? (
                            <span className={calculateGradeClass(assessment.score)}>
                              {assessment.score}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Progress Overview
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSubjectDetail && (
        <Dialog
          open={!!selectedSubjectDetail}
          onClose={() => setSelectedSubjectDetail(null)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
              <div className="flex justify-between items-center p-6 border-b">
                <Dialog.Title className="text-lg font-medium">
                  {selectedSubjectDetail.name} - Detailed Analysis
                </Dialog.Title>
                <button
                  onClick={() => setSelectedSubjectDetail(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <DetailedGradeCalculator subject={selectedSubjectDetail} />
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
};

export default AcademicProgressModal;
