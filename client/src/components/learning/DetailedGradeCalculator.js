import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Medal, Trophy, Star, AlertCircle } from 'lucide-react';
import { calculateOverallGrade, getGradeColor, getGradeLabel } from '../../utils/gradeCalculations';

const getGradeIcon = (grade) => {
  if (grade >= 70) return <Trophy className="w-5 h-5 text-green-500" />;
  if (grade >= 60) return <Medal className="w-5 h-5 text-blue-500" />;
  if (grade >= 50) return <Award className="w-5 h-5 text-yellow-500" />;
  if (grade >= 40) return <Star className="w-5 h-5 text-orange-500" />;
  return <AlertCircle className="w-5 h-5 text-red-500" />;
};

const formatRequiredGrade = (required) => {
  if (required <= 0) return 'Guaranteed!';
  if (required > 100) return 'Not possible';
  return `Need ${Math.round(required)}%`;
};

const DetailedGradeCalculator = ({ subject }) => {
  const currentGrade = calculateOverallGrade(subject);
  const completedAssessments = subject.assessments.filter(a => a.status === 'graded');
  const pendingAssessments = subject.assessments.filter(a => a.status === 'pending');
  
  const calculateRequiredForAssessment = (targetGrade, assessment) => {
    if (assessment.weight === 0) {
      return {
        required: null,
        possible: false,
        assumedGrade: null,
        message: 'Does not count towards the grade'
      };
    }

    const completedWeight = completedAssessments.reduce((sum, a) => sum + a.weight, 0);
    const otherPendingWeight = pendingAssessments
      .filter(a => a._id !== assessment._id)
      .reduce((sum, a) => sum + a.weight, 0);
    
    const currentTotal = completedAssessments.reduce((sum, a) => sum + (a.score * a.weight), 0);
    
    // Assume average grade (target grade) for other pending assessments
    const assumedGrade = targetGrade;
    const required = (targetGrade - currentTotal - (assumedGrade * otherPendingWeight)) / assessment.weight;
    
    return {
      required,
      possible: required <= 100,
      assumedGrade
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">{subject.code}</h2>
          <p className="text-sm text-gray-500">Currently working at {currentGrade?.toFixed(1)}%</p>
        </div>
        {currentGrade && (
          <div className="flex items-center">
            {getGradeIcon(currentGrade)}
            <span className={`ml-2 font-bold ${getGradeColor(currentGrade)}`}>
              {getGradeLabel(currentGrade)}
            </span>
          </div>
        )}
      </div>

      {pendingAssessments.map(assessment => (
        <div key={assessment._id} className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-700 flex items-center justify-between">
            <span>{assessment.name} ({(assessment.weight * 100).toFixed(0)}%)</span>
            <span className="text-sm text-gray-500">Pending</span>
          </h3>
          
          <div className="space-y-3">
            {[
              { label: 'First', grade: 70 },
              { label: '2:1', grade: 60 },
              { label: '2:2', grade: 50 },
              { label: 'Third', grade: 40 }
            ].map(target => {
              const { required, possible, assumedGrade, message } = calculateRequiredForAssessment(target.grade, assessment);
              return (
                <div
                  key={target.label}
                  className={`p-3 rounded-lg ${possible ? `${getGradeColor(target.grade).replace('text', 'bg')}-50` : 'bg-red-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getGradeIcon(target.grade)}
                      <span className={`ml-2 font-medium ${getGradeColor(target.grade)}`}>
                        {target.label}
                      </span>
                    </div>
                    {possible ? (
                      <span className={getGradeColor(target.grade)}>
                        {formatRequiredGrade(required)}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {assessment.weight === 0 ? 'Does not count towards the grade' : 'Not possible'}
                      </span>
                    )}
                  </div>
                  {possible && (
                    <p className="text-sm text-gray-500 mt-2">
                      Assuming other pending assessments achieve at least {assumedGrade}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Completed Assessments</h4>
        {completedAssessments.map(assessment => (
          <div key={assessment._id} className="flex justify-between items-center text-sm">
            <span>{assessment.name} ({(assessment.weight * 100).toFixed(0)}%)</span>
            <span className={getGradeColor(assessment.score)}>
              {assessment.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedGradeCalculator;
