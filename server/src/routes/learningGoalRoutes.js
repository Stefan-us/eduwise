const express = require('express');
const learningGoalController = require('../controllers/learningGoalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', learningGoalController.createLearningGoal);
router.get('/', learningGoalController.getLearningGoals);
router.put('/:id', learningGoalController.updateLearningGoal);
router.delete('/:id', learningGoalController.deleteLearningGoal);

module.exports = router;