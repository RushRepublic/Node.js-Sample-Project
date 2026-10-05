-- For Hostinger (phpMyAdmin): the database already exists, so there is no
-- CREATE DATABASE or USE line. Select your database in phpMyAdmin first, then import this file.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  photo VARCHAR(255) NULL,
  video VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
