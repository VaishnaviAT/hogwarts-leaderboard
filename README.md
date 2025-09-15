# 🏰 Hogwarts House Leaderboard - Full Stack Real-Time Application

A complete full-stack web application that displays a real-time leaderboard for Hogwarts houses with automated data generation, live updates, and administrative controls.

## 🚀 Features

### Core Functionality
- **Real-time Leaderboard**: Live updating house standings with rankings
- **Time Window Filtering**: View data for different time periods (All time, 24 hours, 1 hour, 5 minutes)
- **Live Activity Feed**: Real-time stream of point changes and activities
- **Data Generator**: Automated system for generating realistic house point entries
- **Manual Entry System**: Admin controls for adding custom point entries
- **WebSocket Integration**: Real-time updates without page refresh

### Technical Features
- **Full Stack Architecture**: Node.js/Express backend with React frontend
- **MySQL Database**: Persistent data storage with optimized queries
- **Real-time Communication**: Socket.io for instant updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Professional UI**: Modern dark theme with Hogwarts house colors
- **Error Handling**: Comprehensive error management and user feedback

## 🚀 Running the Application

### Run Backend and Frontend Separately

1. **Start the Backend Server** (Terminal 1):
   ```bash
   cd backend
   npm install
   npm run dev  # or npm start
   ```
   
   You should see:
   ```
   ✅ Database connected successfully
   ✅ Server running on port 3001
   🚀 Starting data generator...
   ```

2. **Start the React Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm install
   npm start
   ```
   
   This will open `http://localhost:3000` in your browser.



## 🔧 Configuration

### Environment Variables

The backend uses the following environment variables:

```env
# Server Settings
PORT=3001                                # Backend server port
NODE_ENV=development                     # Environment mode
CLIENT_URL=http://localhost:3000        # Frontend URL for CORS

# Database Settings
DB_HOST=localhost                       # MySQL host
DB_USER=root                           # MySQL username
DB_PASSWORD=your_password              # MySQL password
DB_NAME=hogwarts_leaderboard          # Database name
DB_PORT=3306                          # MySQL port

# Feature Settings
GENERATOR_INTERVAL_MINUTES=2000 ms      # Auto-generation interval
AUTO_START_GENERATOR=true             # Start generator on boot
```

## 🎯 Usage

### Time Window Controls
- **All Time**: View complete leaderboard history
- **24 Hours**: Last 24 hours of activity
- **1 Hour**: Last hour of activity  
- **5 Minutes**: Last 5 minutes of activity

### Live Updates
Toggle real-time updates on/off. When enabled, you'll see:
- Instant leaderboard updates
- New entry notifications
- Live activity feed updates

### Admin Controls
Access administrative features:
- **Data Generator**: Start/stop/generate automated entries
- **Manual Entry**: Add custom point entries for any house
- **System Status**: Monitor connection and generator status

### API Endpoints

The backend provides the following REST API endpoints:

```
GET  /api/leaderboard?timeWindow=all    # Get leaderboard data
GET  /api/activity?limit=15             # Get recent activity
GET  /api/entries?minutes=60            # Get entries in time window
POST /api/entries                       # Add new entry
GET  /api/house/:house/stats           # Get house statistics
POST /api/generator/control            # Control data generator
GET  /api/generator/status             # Get generator status
GET  /api/health                       # Health check
```

## 📊 Database Schema

### Tables

**houses**
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(50), Unique)
- `color` (VARCHAR(7)) - Hex color code
- `created_at` (TIMESTAMP)

**entries**
- `id` (INT, Primary Key, Auto Increment)
- `house` (VARCHAR(50), Foreign Key)
- `points` (INT)
- `reason` (VARCHAR(255), Nullable)
- `timestamp` (TIMESTAMP)

### Sample Data
The application includes sample data for all four Hogwarts houses:
- Gryffindor (#740001)
- Slytherin (#1a472a)
- Ravenclaw (#0e1a40)
- Hufflepuff (#ecb939)
