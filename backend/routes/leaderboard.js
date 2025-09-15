// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const {
    getLeaderboard,
    getRecentActivity,
    addEntry,
    getHouseStats,
    controlDataGenerator,
    getGeneratorStatus,
    getEntriesInTimeWindow
} = require('../controllers/leaderboardController');

// Leaderboard routes
router.get('/leaderboard', getLeaderboard);
router.get('/activity', getRecentActivity);
router.get('/entries', getEntriesInTimeWindow);
router.post('/entries', addEntry);
router.get('/house/:house/stats', getHouseStats);

// Data generator routes
router.post('/generator/control', controlDataGenerator);
router.get('/generator/status', getGeneratorStatus);

// Health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Leaderboard API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;