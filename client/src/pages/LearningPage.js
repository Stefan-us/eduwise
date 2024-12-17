import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, GraduationCap, Target, Bot } from 'lucide-react';
import { useLearning } from '../contexts/LearningContext';
import GoalCard from '../components/learning/GoalCard';
import SubjectCard from '../components/learning/SubjectCard';
import SubjectModal from '../components/learning/modals/SubjectModal';
import GradeEntryModal from '../components/learning/GradeEntryModal';
import AcademicProgressModal from '../components/learning/AcademicProgressModal';
import GoalModal from '../components/learning/modals/GoalModal';
import AISidebar from '../components/AI/AISidebar';

const LearningPage = () => {
  const {
    goals,
    subjects,
    addGoal,
    updateGoal,
    removeGoal,
    addSubject,
    removeSubject,
    updateGrades,
    updateSubject,
    deleteAssessmentScore
  } = useLearning();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState([]);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleGradeEntry = (subject) => {
    setSelectedSubject(subject);
    setShowGradeModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowSubjectModal(true);
  };

  const handleCloseSubjectModal = () => {
    setShowSubjectModal(false);
    setEditingSubject(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Learning Goals
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Goal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onComplete={(id) => updateGoal(id, { completed: !goal.completed })}
                onDelete={removeGoal}
                onUpdateProgress={(id, progress) => updateGoal(id, { progress })}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Subjects
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowProgressModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                View Progress
              </button>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subject
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                isExpanded={expandedSubjects.includes(subject._id)}
                onToggle={() => toggleSubjectExpansion(subject._id)}
                onDelete={() => removeSubject(subject._id)}
                onGradeEntry={() => handleGradeEntry(subject)}
                onEdit={() => handleEditSubject(subject)}
                onDeleteScore={deleteAssessmentScore}
              >
                <div className="mt-4 space-y-2">
                  {subject.assessments.map(assessment => (
                    <div
                      key={assessment._id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{assessment.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">
                          {(assessment.weight * 100).toFixed(0)}%
                        </span>
                        {assessment.status === 'graded' ? (
                          <span className="text-green-500">{assessment.score}%</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SubjectCard>
            ))}
          </div>
        </section>
      </main>

      {showGoalModal && (
        <GoalModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onSubmit={async (goal) => {
            try {
              await addGoal(goal);
              setShowGoalModal(false);
            } catch (error) {
              throw error;
            }
          }}
        />
      )}

      {showSubjectModal && (
        <SubjectModal
          isOpen={showSubjectModal}
          onClose={handleCloseSubjectModal}
          onSubmit={editingSubject ? 
            (data) => updateSubject(editingSubject._id, data) : 
            addSubject}
          initialData={editingSubject}
        />
      )}

      {showGradeModal && selectedSubject && (
        <GradeEntryModal
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedSubject(null);
          }}
          subject={selectedSubject}
          onSubmit={async (grades) => {
            try {
              await updateGrades(selectedSubject._id, grades);
              setShowGradeModal(false);
              setSelectedSubject(null);
            } catch (error) {
              throw error;
            }
          }}
        />
      )}

      {showProgressModal && (
        <AcademicProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          subjects={subjects}
        />
      )}

      <AISidebar
        isOpen={showAISidebar}
        onClose={() => setShowAISidebar(false)}
      />
    </div>
  );
};

export default LearningPage;
