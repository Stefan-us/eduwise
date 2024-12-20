const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPerformanceMetrics,
  refreshMetrics,
  getHistoricalMetrics,
  exportMetrics
} = require('../controllers/analyzerController');

// All routes require authentication
router.use(protect);

// Get current performance metrics with trends
router.get('/metrics', getPerformanceMetrics);

// Refresh performance metrics
router.post('/metrics/refresh', refreshMetrics);

// Get historical performance data
router.get('/historical', getHistoricalMetrics);

// Export performance data
router.get('/export', exportMetrics);

module.exports = router; 