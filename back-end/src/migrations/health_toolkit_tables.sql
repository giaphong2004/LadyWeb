-- Health Toolkit Database Migration
-- Run this SQL in your MySQL database

-- User Health Profile Table
CREATE TABLE IF NOT EXISTS user_health_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    goal ENUM('avoid_pregnancy', 'track_health', 'trying_to_conceive') DEFAULT 'track_health',
    avg_cycle_length FLOAT DEFAULT 28,
    avg_period_length FLOAT DEFAULT 5,
    cycle_length_std FLOAT DEFAULT 2,
    avg_luteal_phase FLOAT DEFAULT 14,
    last_period_date DATE NULL,
    is_pregnant BOOLEAN DEFAULT FALSE,
    pregnancy_start_date DATE NULL,
    expected_due_date DATE NULL,
    track_sexual_activity BOOLEAN DEFAULT FALSE,
    cycles_recorded INT DEFAULT 0,
    notify_period BOOLEAN DEFAULT TRUE,
    notify_ovulation BOOLEAN DEFAULT TRUE,
    notify_fertile_window BOOLEAN DEFAULT TRUE,
    notify_days_before INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cycle History Table
CREATE TABLE IF NOT EXISTS cycle_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    period_end_date DATE NULL,
    cycle_length INT NULL,
    period_length INT NULL,
    ovulation_date DATE NULL,
    ovulation_confirmed BOOLEAN DEFAULT FALSE,
    luteal_phase_length INT NULL,
    avg_flow_intensity FLOAT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_start (user_id, start_date)
);

-- Daily Log Table
CREATE TABLE IF NOT EXISTS daily_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    cycle_day INT NULL,
    is_period_day BOOLEAN DEFAULT FALSE,
    flow_intensity INT NULL CHECK (flow_intensity >= 1 AND flow_intensity <= 5),
    bbt FLOAT NULL,
    cervical_mucus ENUM('dry', 'sticky', 'creamy', 'watery', 'egg_white') NULL,
    ovulation_test ENUM('negative', 'positive', 'peak') NULL,
    sexual_activity BOOLEAN DEFAULT FALSE,
    protection_used BOOLEAN NULL,
    symptoms JSON DEFAULT NULL,
    mood INT NULL CHECK (mood >= 1 AND mood <= 5),
    energy_level INT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    sleep_quality INT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    sleep_hours FLOAT NULL,
    water_intake INT NULL,
    exercise_minutes INT NULL,
    weight FLOAT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, log_date),
    INDEX idx_user_period (user_id, is_period_day)
);

-- Symptom Pattern Table
CREATE TABLE IF NOT EXISTS symptom_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symptom VARCHAR(50) NOT NULL,
    typical_cycle_days JSON DEFAULT NULL,
    frequency FLOAT DEFAULT 0,
    avg_intensity FLOAT NULL,
    occurrence_count INT DEFAULT 0,
    phase_distribution JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_symptom (user_id, symptom)
);

-- Add indexes for better performance
CREATE INDEX idx_cycle_user_complete ON cycle_history(user_id, is_complete);
CREATE INDEX idx_daily_log_date ON daily_logs(log_date);
