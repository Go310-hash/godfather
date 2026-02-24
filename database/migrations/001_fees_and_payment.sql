-- Add registration fee and payment fields to students
-- Run once if you already have the database. New installs use schema.sql.

USE pchs_registration;

ALTER TABLE students
  ADD COLUMN registration_fee INT UNSIGNED NULL COMMENT 'Fee in XAF',
  ADD COLUMN payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  ADD COLUMN payment_provider VARCHAR(20) NULL COMMENT 'orange or mtn',
  ADD COLUMN payment_phone VARCHAR(20) NULL;
