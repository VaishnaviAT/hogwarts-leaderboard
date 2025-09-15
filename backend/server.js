// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database and utilities
const { testConnection, initializeDatabase } = require('./config/database');
const leaderboardRoutes = require('./routes/leaderboard');
const dataGenerator = require('./utils/dataGenerator');
const Entry = require('./models/Entry');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.set('trust proxy', 1);

// CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api', leaderboardRoutes);

// This also works for all unknown /api paths
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`👋 Client connected: ${socket.id}`);
    
    // Send current leaderboard on connection
    Entry.getLeaderboard().then(leaderboard => {
        socket.emit('leaderboard-update', {
            type: 'initial',
            data: leaderboard,
            timestamp: new Date().toISOString()
        });
    }).catch(error => {
        console.error('Error sending initial leaderboard:', error);
    });
    
    // Handle client requesting specific time window
    socket.on('request-leaderboard', async (data) => {
        try {
            const { timeWindow } = data;
            let minutes = null;
            
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
            }
            
            const leaderboard = await Entry.getLeaderboard(minutes);
            socket.emit('leaderboard-update', {
                type: 'timeWindow',
                timeWindow,
                data: leaderboard,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error handling leaderboard request:', error);
            socket.emit('error', { message: 'Failed to fetch leaderboard data' });
        }
    });
    
    // Handle manual entry addition
    socket.on('add-entry', async (data) => {
        try {
            const { house, points, reason } = data;
            
            // Validate data
            const validHouses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];
            if (!validHouses.includes(house) || points === undefined) {
                socket.emit('error', { message: 'Invalid entry data' });
                return;
            }
            
            // Create and save entry
            const entry = new Entry(house, parseInt(points), reason);
            await entry.save();
            
            // Broadcast to all clients
            const entryData = {
                id: entry.id,
                house: entry.house,
                points: entry.points,
                reason: entry.reason,
                timestamp: new Date().toISOString()
            };
            
            io.emit('new-entry', entryData);
            
            // Send updated leaderboard
            const leaderboard = await Entry.getLeaderboard();
            io.emit('leaderboard-update', {
                type: 'new-entry',
                data: leaderboard,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error adding entry:', error);
            socket.emit('error', { message: 'Failed to add entry' });
        }
    });
    
    // Handle data generator control
    socket.on('control-generator', (data) => {
        try {
            const { action, intervalMinutes } = data;
            
            switch (action) {
                case 'start':
                    dataGenerator.start(intervalMinutes || 1);
                    break;
                case 'stop':
                    dataGenerator.stop();
                    break;
                case 'generate':
                    dataGenerator.generateAndSaveEntry();
                    break;
            }
            
            const status = dataGenerator.getStatus();
            socket.emit('generator-status', status);
            
        } catch (error) {
            console.error('Error controlling generator:', error);
            socket.emit('error', { message: 'Failed to control generator' });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`👋 Client disconnected: ${socket.id}`);
    });
});

// Set up data generator listeners for real-time updates
dataGenerator.addListener(async (entryData) => {
    try {
        // Broadcast new entry to all clients
        io.emit('new-entry', entryData);
        
        // Send updated leaderboard
        const leaderboard = await Entry.getLeaderboard();
        io.emit('leaderboard-update', {
            type: 'auto-generated',
            data: leaderboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error broadcasting generator data:', error);
    }
});



// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Express error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler for API routes
// app.use('/api/*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         error: 'API endpoint not found'
//     });
// });

// Initialize and start server
async function startServer() {
    try {
        console.log('🚀 Starting Hogwarts Leaderboard Server...');
        
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }
        
        // Initialize database tables
        await initializeDatabase();
        
        // Start server
        server.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 Frontend: http://localhost:${PORT}`);
            console.log(`🔌 API: http://localhost:${PORT}/api`);
            console.log(`📊 Health: http://localhost:${PORT}/api/health`);
            
            // Start data generator with 2-minute intervals
            setTimeout(() => {
                dataGenerator.start(2);
            }, 2000);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    dataGenerator.stop();
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully');
    dataGenerator.stop();
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Start the server
startServer();

module.exports = { app, server, io };