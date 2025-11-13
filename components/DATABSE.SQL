-- Create database (run as privileged user)
CREATE DATABASE IF NOT EXISTS fence_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fence_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emf_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone INT,
  lat DOUBLE NULL,
  lon DOUBLE NULL,
  emf DOUBLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone INT,
  emf DOUBLE,
  severity VARCHAR(32),
  raw_message TEXT,
  source VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin (replace password hash)
-- Generate bcrypt hash (e.g., in node: require('bcryptjs').hashSync('yourpassword', 10))
INSERT INTO users (username, password) VALUES ('admin', '$2a$10$REPLACE_WITH_HASH');
