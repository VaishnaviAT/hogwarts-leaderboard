# Hogwarts Leaderboard Database Schema

## Create Database
```sql
CREATE DATABASE IF NOT EXISTS hogwarts_leaderboard;
USE hogwarts_leaderboard;

-- Users table for basic authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Houses table
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL, -- hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entries table for storing points transactions
CREATE TABLE entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    reason VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_house (house),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (house) REFERENCES houses(name) ON UPDATE CASCADE
);

-- Insert the four Hogwarts houses
INSERT INTO houses (name, color) VALUES 
('Gryffindor', '#740001'),
('Slytherin', '#1a472a'),
('Ravenclaw', '#0e1a40'),
('Hufflepuff', '#ecb939');

-- Insert some sample data
INSERT INTO entries (house, points, reason, timestamp) VALUES 
('Gryffindor', 50, 'Excellent Transfiguration work', NOW() - INTERVAL 2 HOUR),
('Slytherin', 30, 'Outstanding Potions brewing', NOW() - INTERVAL 1 HOUR),
('Ravenclaw', 40, 'Brilliant Defense Against Dark Arts', NOW() - INTERVAL 30 MINUTE),
('Hufflepuff', 35, 'Exceptional Herbology knowledge', NOW() - INTERVAL 15 MINUTE),
('Gryffindor', -20, 'Breaking curfew', NOW() - INTERVAL 10 MINUTE),
('Slytherin', 25, 'Creative problem solving', NOW() - INTERVAL 5 MINUTE);
```

## Database Connection Test
```sql
-- Test query to verify setup
SELECT 
    h.name as house,
    h.color,
    COALESCE(SUM(e.points), 0) as total_points,
    COUNT(e.id) as total_entries
FROM houses h
LEFT JOIN entries e ON h.name = e.house
GROUP BY h.id, h.name, h.color
ORDER BY total_points DESC;
```