const express = require('express');
const subjectController = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', subjectController.createSubject);
router.get('/', subjectController.getSubjects);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

// Assignment routes - Change :id to :subjectId for consistency
router.post('/:subjectId/assignments', subjectController.addAssignment);
router.put('/:subjectId/assignments/:assignmentId', subjectController.updateAssignment);
router.delete('/:subjectId/assignments/:assignmentId', subjectController.deleteAssignment);

router.put('/:id/grades', protect, subjectController.updateGrades);
router.get('/:id/progress', protect, subjectController.getSubjectProgress);

router.delete('/:subjectId/assessments/:assessmentId/score', protect, subjectController.deleteAssessmentScore);

module.exports = router;
