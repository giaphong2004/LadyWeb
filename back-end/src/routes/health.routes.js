// routes/health.routes.js
/**
 * Health Toolkit Routes
 * All personalized reproductive health tracking endpoints
 */

const express = require('express');
const router = express.Router();
const healthToolkitController = require('../controllers/healthToolkit.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== PROFILE ROUTES ====================
// GET /api/health/profile - Get user's health profile
router.get('/profile', healthToolkitController.getProfile);

// PUT /api/health/profile - Update user's health profile
router.put('/profile', healthToolkitController.updateProfile);

// ==================== CYCLE TRACKING ROUTES ====================
// POST /api/health/cycle/update - Log period start/end or update cycle data
router.post('/cycle/update', healthToolkitController.updateCycle);

// GET /api/health/cycle/history - Get cycle history
router.get('/cycle/history', healthToolkitController.getCycleHistory);

// ==================== PREDICTION ROUTES ====================
// GET /api/health/prediction - Get all predictions (next period, ovulation, etc.)
router.get('/prediction', healthToolkitController.getPrediction);

// ==================== FERTILITY ROUTES ====================
// GET /api/health/fertility/score - Get daily fertility score
router.get('/fertility/score', healthToolkitController.getFertilityScore);

// GET /api/health/fertility/calendar - Get fertility calendar for a month
router.get('/fertility/calendar', healthToolkitController.getFertilityCalendar);

// ==================== DAILY LOG ROUTES ====================
// POST /api/health/daily-log - Log daily symptoms and activities
router.post('/daily-log', healthToolkitController.createDailyLog);

// GET /api/health/daily-logs - Get daily logs for a date range
router.get('/daily-logs', healthToolkitController.getDailyLogs);

// ==================== HEALTH SUGGESTIONS ROUTES ====================
// GET /api/health/suggestions - Get personalized health suggestions
router.get('/suggestions', healthToolkitController.getHealthSuggestions);

// ==================== INSIGHTS & ANALYTICS ROUTES ====================
// GET /api/health/insights - Get 3-month trend insights
router.get('/insights', healthToolkitController.getInsights);

// ==================== DASHBOARD ROUTE ====================
// GET /api/health/dashboard - Get complete dashboard data
router.get('/dashboard', healthToolkitController.getDashboard);

module.exports = router;
