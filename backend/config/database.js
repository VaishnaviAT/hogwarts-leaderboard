const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'hogwarts_leaderboard',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database test query successful');
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

const initializeDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'houses'"
        );
        
        if (tables.length === 0) {
            console.log('🔄 Creating database tables...');
            
            // Create houses table
            await connection.execute(`
                CREATE TABLE houses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    color VARCHAR(7) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create entries table
            await connection.execute(`
                CREATE TABLE entries (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    house VARCHAR(50) NOT NULL,
                    points INT NOT NULL,
                    reason VARCHAR(255),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_house (house),
                    INDEX idx_timestamp (timestamp),
                    FOREIGN KEY (house) REFERENCES houses(name) ON UPDATE CASCADE
                )
            `);
            
            // Insert Hogwarts houses
            await connection.execute(`
                INSERT INTO houses (name, color) VALUES 
                ('Gryffindor', '#740001'),
                ('Slytherin', '#1a472a'),
                ('Ravenclaw', '#0e1a40'),
                ('Hufflepuff', '#ecb939')
            `);
            
            // Insert sample data
            await connection.execute(`
                INSERT INTO entries (house, points, reason, timestamp) VALUES 
                ('Gryffindor', 50, 'Excellent Transfiguration work', NOW() - INTERVAL 2 HOUR),
                ('Slytherin', 30, 'Outstanding Potions brewing', NOW() - INTERVAL 1 HOUR),
                ('Ravenclaw', 40, 'Brilliant Defense Against Dark Arts', NOW() - INTERVAL 30 MINUTE),
                ('Hufflepuff', 35, 'Exceptional Herbology knowledge', NOW() - INTERVAL 15 MINUTE),
                ('Gryffindor', -20, 'Breaking curfew', NOW() - INTERVAL 10 MINUTE),
                ('Slytherin', 25, 'Creative problem solving', NOW() - INTERVAL 5 MINUTE)
            `);
            
            console.log('✅ Database tables created and populated');
        }
        
        connection.release();
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};