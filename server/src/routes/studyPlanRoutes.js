const express = require('express');
const studyPlanController = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', studyPlanController.createStudyPlan);
router.get('/', studyPlanController.getStudyPlans);
router.get('/:id', studyPlanController.getStudyPlan);
router.put('/:id', studyPlanController.updateStudyPlan);
router.delete('/:id', studyPlanController.deleteStudyPlan);
router.put('/:id/sessions/:sessionId/complete', studyPlanController.completeSession);

module.exports = router;
