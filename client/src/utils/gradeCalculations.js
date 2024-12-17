export const calculateOverallGrade = (subject) => {
  if (!subject || !subject.assessments) return null;
  
  const gradedAssessments = subject.assessments.filter(a => a.status === 'graded');
  if (gradedAssessments.length === 0) return null;

  const weightedSum = gradedAssessments.reduce((sum, assessment) => {
    return sum + (assessment.score * assessment.weight);
  }, 0);

  const totalWeight = gradedAssessments.reduce((sum, assessment) => sum + assessment.weight, 0);
  return totalWeight > 0 ? weightedSum / totalWeight : null;
};

export const getGradeColor = (grade) => {
  if (!grade && grade !== 0) return 'text-gray-400';
  if (grade >= 70) return 'text-green-500';
  if (grade >= 60) return 'text-blue-500';
  if (grade >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

export const getGradeLabel = (grade) => {
  if (!grade && grade !== 0) return 'Not Graded';
  if (grade >= 70) return 'First';
  if (grade >= 60) return '2:1';
  if (grade >= 50) return '2:2';
  if (grade >= 40) return 'Third';
  return 'Fail';
};

export const formatRequiredGrade = (required) => {
  if (required <= 0) return 'Guaranteed!';
  if (required > 100) return 'Not possible';
  return `Need ${Math.round(required)}%`;
};