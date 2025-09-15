// controllers/leaderboardController.js
const Entry = require('../models/Entry');
const dataGenerator = require('../utils/dataGenerator.js');

// Get leaderboard data for specified time window
const getLeaderboard = async (req, res) => {
    try {
        const { timeWindow } = req.query;
        let minutes = null;

        // Convert time window to minutes
        switch (timeWindow) {
            case '5min':
                minutes = 5;
                break;
            case '1hour':
                minutes = 60;
                break;
            case '24hours':
                minutes = 60 * 24;
                break;
            case 'all':
            default:
                minutes = null; // All time
                break;
        }

        const leaderboard = await Entry.getLeaderboard(minutes);
        
        res.json({
            success: true,
            timeWindow: timeWindow || 'all',
            data: leaderboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard data'
        });
    }
};

const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const activity = await Entry.getRecentActivity(parseInt(limit));
        
        res.json({
            success: true,
            data: activity,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
};

const addEntry = async (req, res) => {
    try {
        const { house, points, reason } = req.body;

        // Validate required fields
        if (!house || points === undefined) {
            return res.status(400).json({
                success: false,
                error: 'House and points are required'
            });
        }

        // Validate house name
        const validHouses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];
        if (!validHouses.includes(house)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid house name'
            });
        }

        // Validate points range
        if (points < -100 || points > 100) {
            return res.status(400).json({
                success: false,
                error: 'Points must be between -100 and 100'
            });
        }

        // Create and save entry
        const entry = new Entry(house, parseInt(points), reason);
        await entry.save();

        res.status(201).json({
            success: true,
            data: {
                id: entry.id,
                house: entry.house,
                points: entry.points,
                reason: entry.reason,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add entry'
        });
    }
};

const getHouseStats = async (req, res) => {
    try {
        const { house } = req.params;

        // Validate house name
        const validHouses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];
        if (!validHouses.includes(house)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid house name'
            });
        }

        const stats = await Entry.getHouseStats(house);
        
        if (!stats) {
            return res.status(404).json({
                success: false,
                error: 'No data found for this house'
            });
        }

        res.json({
            success: true,
            house,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching house stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch house statistics'
        });
    }
};

// Control data generator
const controlDataGenerator = async (req, res) => {
    try {
        const { action, intervalMinutes } = req.body;

        switch (action) {
            case 'start':
                const interval = intervalMinutes || 1;
                dataGenerator.start(interval);
                break;
            case 'stop':
                dataGenerator.stop();
                break;
            case 'generate':
                await dataGenerator.generateAndSaveEntry();
                break;
            case 'bulk':
                const count = req.body.count || 10;
                await dataGenerator.generateBulkEntries(count);
                break;
            case 'test':
                await dataGenerator.generateTestData();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action. Use: start, stop, generate, bulk, or test'
                });
        }

        const status = dataGenerator.getStatus();
        
        res.json({
            success: true,
            action,
            status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error controlling data generator:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to control data generator'
        });
    }
};

// Get data generator status
const getGeneratorStatus = (req, res) => {
    try {
        const status = dataGenerator.getStatus();
        
        res.json({
            success: true,
            status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting generator status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get generator status'
        });
    }
};

// Get entries within time window
const getEntriesInTimeWindow = async (req, res) => {
    try {
        const { minutes } = req.query;
        
        if (!minutes || isNaN(minutes)) {
            return res.status(400).json({
                success: false,
                error: 'Minutes parameter is required and must be a number'
            });
        }

        const entries = await Entry.getEntriesInTimeWindow(parseInt(minutes));
        
        res.json({
            success: true,
            timeWindow: `${minutes} minutes`,
            data: entries,
            count: entries.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching entries in time window:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch entries in time window'
        });
    }
};

module.exports = {
    getLeaderboard,
    getRecentActivity,
    addEntry,
    getHouseStats,
    controlDataGenerator,
    getGeneratorStatus,
    getEntriesInTimeWindow
};