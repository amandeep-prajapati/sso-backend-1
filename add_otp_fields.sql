-- Add OTP fields to master_users table
-- Run this SQL script in your database

USE vimanotech_user_mangement;

-- Add OTP and expiry time columns to master_users table
ALTER TABLE master_users 
ADD COLUMN user_otp VARCHAR(6) NULL COMMENT 'User OTP for email verification',
ADD COLUMN user_expiry_time TIMESTAMP NULL COMMENT 'OTP expiry timestamp';

-- Verify the columns were added
DESCRIBE master_users;