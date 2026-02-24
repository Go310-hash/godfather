-- ============================================================
-- PCHS Bamenda - Online Student Registration System
-- MySQL Database Schema
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS pchs_registration
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pchs_registration;

-- ============================================================
-- ROLES (optional - for future role-based access)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_roles_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- ADMINS TABLE (secure authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  role_id INT UNSIGNED DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
  INDEX idx_admins_username (username),
  INDEX idx_admins_email (email),
  INDEX idx_admins_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  class_applying_for VARCHAR(50) NOT NULL,
  parent_guardian_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  previous_school VARCHAR(255),
  passport_photo_path VARCHAR(500),
  registration_fee INT UNSIGNED NULL COMMENT 'Registration fee in XAF',
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  payment_provider VARCHAR(20) NULL COMMENT 'orange or mtn',
  payment_phone VARCHAR(20) NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewed_by INT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_students_status (status),
  INDEX idx_students_email (email),
  INDEX idx_students_created (created_at),
  INDEX idx_students_name (full_name),
  INDEX idx_students_class (class_applying_for)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DEFAULT ROLE AND OPTIONAL ADMIN
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Manage students and view dashboard'),
  ('viewer', 'View only access')
ON DUPLICATE KEY UPDATE name = name;

-- Optional: Create first admin (password: Admin@123 - change in production!)
-- INSERT INTO admins (username, email, password_hash, full_name, role_id)
-- VALUES ('admin', 'admin@pchsbamenda.edu', '$2b$10$...', 'System Administrator', 1);

-- ============================================================
-- DATA VALIDATION NOTES (application layer enforces):
-- - full_name: 2-150 chars
-- - email: valid format
-- - phone: digits, 9-15 chars
-- - date_of_birth: past date, reasonable age range
-- ============================================================
