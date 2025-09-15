// utils/dataGenerator.js
const Entry = require('../models/Entry');

class DataGenerator {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.listeners = [];
    }

    // Add event listener for new data generation
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove event listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners of new data
    notifyListeners(data) {
        this.listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in data generator listener:', error);
            }
        });
    }

    // Start generating random data at intervals
    start(intervalMinutes = 1) {
        if (this.isRunning) {
            console.log('Data generator is already running');
            return;
        }

        this.isRunning = true;
        const intervalMs = intervalMinutes * 2 * 1000;
        
        console.log(`🚀 Starting data generator with ${intervalMinutes} minute intervals`);

        // Generate initial entry immediately
        this.generateAndSaveEntry();

        // Set up recurring generation
        this.intervalId = setInterval(() => {
            this.generateAndSaveEntry();
        }, intervalMs);
    }

    // Stop generating data
    stop() {
        if (!this.isRunning) {
            console.log('Data generator is not running');
            return;
        }

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('🛑 Data generator stopped');
    }

    // Generate and save a random entry
    async generateAndSaveEntry() {
        try {
            const entry = Entry.generateRandomEntry();
            await entry.save();
            
            const entryData = {
                id: entry.id,
                house: entry.house,
                points: entry.points,
                reason: entry.reason,
                timestamp: new Date(),
                type: 'new_entry'
            };

            console.log(`📊 Generated entry: ${entry.house} ${entry.points > 0 ? '+' : ''}${entry.points} - ${entry.reason}`);
            
            // Notify listeners
            this.notifyListeners(entryData);

            return entryData;
        } catch (error) {
            console.error('Error generating entry:', error);
            throw error;
        }
    }

    // Generate multiple entries at once
    async generateBulkEntries(count = 10) {
        const entries = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const entryData = await this.generateAndSaveEntry();
                entries.push(entryData);
                
                // Small delay between entries
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error generating bulk entry ${i + 1}:`, error);
            }
        }

        console.log(`📈 Generated ${entries.length} bulk entries`);
        return entries;
    }

    // Generate entries for testing different time windows
    async generateTestData() {
        console.log('🧪 Generating test data for different time windows...');
        
        const testEntries = [
            // Recent entries (last 5 minutes)
            { house: 'Gryffindor', points: 25, reason: 'Recent: Brave deed', minutesAgo: 2 },
            { house: 'Slytherin', points: -15, reason: 'Recent: Caught cheating', minutesAgo: 1 },
            
            // Medium entries (last hour)
            { house: 'Ravenclaw', points: 40, reason: 'Hour ago: Brilliant answer', minutesAgo: 30 },
            { house: 'Hufflepuff', points: 20, reason: 'Hour ago: Helping others', minutesAgo: 45 },
            
            // Older entries (last 24 hours)
            { house: 'Gryffindor', points: 35, reason: 'Day ago: Excellent essay', minutesAgo: 120 },
            { house: 'Slytherin', points: 30, reason: 'Day ago: Perfect potion', minutesAgo: 180 },
        ];

        for (const testEntry of testEntries) {
            try {
                // Create entry with custom timestamp
                const entry = new Entry(testEntry.house, testEntry.points, testEntry.reason);
                await entry.save();
                
                // Update timestamp to be in the past
                const { pool } = require('../config/database');
                await pool.execute(
                    'UPDATE entries SET timestamp = DATE_SUB(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
                    [testEntry.minutesAgo, entry.id]
                );
                
                console.log(`✅ Test entry: ${testEntry.house} ${testEntry.points} (${testEntry.minutesAgo}m ago)`);
            } catch (error) {
                console.error('Error generating test entry:', error);
            }
        }

        console.log('✅ Test data generation complete');
    }

    // Get generator status
    getStatus() {
        return {
            isRunning: this.isRunning,
            listenersCount: this.listeners.length,
            intervalId: !!this.intervalId
        };
    }

    // Generate entries with specific house bias (for testing)
    async generateHouseBiasedEntry(favoredHouse, biasFactor = 0.7) {
        const houses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];
        const selectedHouse = Math.random() < biasFactor 
            ? favoredHouse 
            : houses[Math.floor(Math.random() * houses.length)];
        
        const entry = new Entry(selectedHouse, 0, '');
        Object.assign(entry, Entry.generateRandomEntry());
        entry.house = selectedHouse;
        
        await entry.save();
        
        const entryData = {
            id: entry.id,
            house: entry.house,
            points: entry.points,
            reason: entry.reason,
            timestamp: new Date(),
            type: 'biased_entry'
        };

        this.notifyListeners(entryData);
        return entryData;
    }
}

// Create singleton instance
const dataGenerator = new DataGenerator();

module.exports = dataGenerator;