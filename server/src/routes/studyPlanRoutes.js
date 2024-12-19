const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Generate new study plan
router.post('/generate', studyPlanController.generatePlan);

// Get all study plans for user
router.get('/', studyPlanController.getAllPlans);

// Get specific study plan
router.get('/:id', studyPlanController.getPlanById);

// Update study plan
router.put('/:id', studyPlanController.updatePlan);

// Delete study plan
router.delete('/:id', studyPlanController.deletePlan);

// Update session status
router.patch('/:id/session', studyPlanController.updateSessionStatus);

module.exports = router;
