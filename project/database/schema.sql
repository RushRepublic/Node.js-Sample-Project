CREATE DATABASE IF NOT EXISTS my_app_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE my_app_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  photo VARCHAR(255) NULL,
  video VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional sample data
INSERT IGNORE INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com');
