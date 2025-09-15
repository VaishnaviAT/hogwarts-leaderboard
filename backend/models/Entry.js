// models/Entry.js
const { pool } = require('../config/database');

class Entry {
    constructor(house, points, reason = null) {
        this.house = house;
        this.points = points;
        this.reason = reason;
    }

    // Save a new entry to the database
    async save() {
        try {
            const [result] = await pool.execute(
                'INSERT INTO entries (house, points, reason) VALUES (?, ?, ?)',
                [this.house, this.points, this.reason]
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving entry:', error);
            throw error;
        }
    }

    // Get all entries within a time window
    static async getEntriesInTimeWindow(minutes) {
        try {
            const query = `
                SELECT e.*, h.color 
                FROM entries e
                JOIN houses h ON e.house = h.name
                WHERE e.timestamp >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
                ORDER BY e.timestamp DESC
            `;
            
            const [rows] = await pool.execute(query, [minutes]);
            return rows;
        } catch (error) {
            console.error('Error fetching entries in time window:', error);
            throw error;
        }
    }

    // Get leaderboard data for a specific time window
    static async getLeaderboard(minutes = null) {
        try {
            let query = `
                SELECT 
                    h.name as house,
                    h.color,
                    COALESCE(SUM(e.points), 0) as total_points,
                    COUNT(e.id) as total_entries,
                    MAX(e.timestamp) as last_activity
                FROM houses h
                LEFT JOIN entries e ON h.name = e.house
            `;
            
            const params = [];
            
            if (minutes) {
                query += ` AND e.timestamp >= DATE_SUB(NOW(), INTERVAL ? MINUTE)`;
                params.push(minutes);
            }
            
            query += `
                GROUP BY h.id, h.name, h.color
                ORDER BY total_points DESC, h.name ASC
            `;
            
            const [rows] = await pool.execute(query, params);
            
            // Add ranking
            return rows.map((row, index) => ({
                ...row,
                rank: index + 1,
                total_points: parseInt(row.total_points),
                total_entries: parseInt(row.total_entries)
            }));
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    // Get recent activity feed
    static async getRecentActivity(limit = 10) {
        try {
            const query = `
            SELECT 
                e.*,
                h.color
            FROM entries e
            JOIN houses h ON e.house = h.name
            ORDER BY e.timestamp DESC
            LIMIT ${parseInt(limit, 10)}
        `;
        const [rows] = await pool.query(query)
            return rows;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    // Get house statistics
    static async getHouseStats(house) {
        try {
            const query = `
                SELECT 
                    house,
                    COUNT(*) as total_entries,
                    SUM(points) as total_points,
                    AVG(points) as avg_points,
                    MAX(points) as max_points,
                    MIN(points) as min_points,
                    SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as positive_points,
                    SUM(CASE WHEN points < 0 THEN points ELSE 0 END) as negative_points
                FROM entries
                WHERE house = ?
                GROUP BY house
            `;
            
            const [rows] = await pool.execute(query, [house]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching house stats:', error);
            throw error;
        }
    }

    // Delete old entries (cleanup function)
    static async deleteOldEntries(daysOld = 30) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM entries WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
                [daysOld]
            );
            
            return result.affectedRows;
        } catch (error) {
            console.error('Error deleting old entries:', error);
            throw error;
        }
    }

    // Generate random entry (for testing/demo purposes)
    static generateRandomEntry() {
        const houses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];
        const reasons = [
            'Outstanding classroom performance',
            'Helping a fellow student',
            'Exceptional spell work',
            'Leadership qualities',
            'Creative problem solving',
            'Defending a classmate',
            'Academic excellence',
            'Displaying house values',
            'Late to class',
            'Talking during lesson',
            'Incomplete homework',
            'Disrupting class',
            'Minor mischief'
        ];
        
        const house = houses[Math.floor(Math.random() * houses.length)];
        const reasonIndex = Math.floor(Math.random() * reasons.length);
        const reason = reasons[reasonIndex];
        
        // Positive points for first 8 reasons, negative for last 5
        const points = reasonIndex < 8 
            ? Math.floor(Math.random() * 50) + 10  // 10-59 points
            : -(Math.floor(Math.random() * 30) + 5); // -5 to -34 points
        
        return new Entry(house, points, reason);
    }
}

module.exports = Entry;