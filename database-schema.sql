
-- Color Prediction Game Database Schema for Spring Boot

-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Games table
CREATE TABLE games (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(50) UNIQUE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    winning_color ENUM('red', 'green'),
    red_total DECIMAL(15,2) DEFAULT 0.00,
    green_total DECIMAL(15,2) DEFAULT 0.00,
    total_bets_count INT DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_game_id (game_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
);

-- Bets table
CREATE TABLE bets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    color ENUM('red', 'green') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    actual_win DECIMAL(15,2) DEFAULT 0.00,
    is_winner BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'won', 'lost') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_game_id (game_id),
    INDEX idx_status (status)
);

-- Transactions table for money management
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'bet_deduct', 'win_credit', 'bonus') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_id VARCHAR(100), -- For external payment references
    game_id BIGINT NULL, -- For bet-related transactions
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- User statistics table
CREATE TABLE user_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    total_games_played INT DEFAULT 0,
    total_games_won INT DEFAULT 0,
    total_amount_bet DECIMAL(15,2) DEFAULT 0.00,
    total_amount_won DECIMAL(15,2) DEFAULT 0.00,
    biggest_win DECIMAL(15,2) DEFAULT 0.00,
    win_rate DECIMAL(5,2) DEFAULT 0.00, -- Stored as percentage
    current_streak INT DEFAULT 0,
    longest_win_streak INT DEFAULT 0,
    longest_lose_streak INT DEFAULT 0,
    last_game_played TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Game statistics table
CREATE TABLE game_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game_id BIGINT UNIQUE NOT NULL,
    total_players INT DEFAULT 0,
    total_red_bets INT DEFAULT 0,
    total_green_bets INT DEFAULT 0,
    red_percentage DECIMAL(5,2) DEFAULT 0.00,
    green_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_pool DECIMAL(15,2) DEFAULT 0.00,
    house_edge DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id)
);

-- Admin settings table
CREATE TABLE admin_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('game_duration', '30', 'Game duration in seconds'),
('min_bet_amount', '10', 'Minimum bet amount'),
('max_bet_amount', '10000', 'Maximum bet amount'),
('win_multiplier', '2.0', 'Win multiplier for correct predictions'),
('house_edge', '0.05', 'House edge percentage'),
('max_daily_withdrawal', '50000', 'Maximum daily withdrawal amount'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode');

-- Create indexes for better performance
CREATE INDEX idx_bets_user_created ON bets(user_id, created_at);
CREATE INDEX idx_games_status_start ON games(status, start_time);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at);

-- Create views for common queries
CREATE VIEW active_games AS
SELECT * FROM games WHERE status = 'active';

CREATE VIEW user_balance_view AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.balance,
    COALESCE(us.total_games_played, 0) as total_games_played,
    COALESCE(us.total_games_won, 0) as total_games_won,
    COALESCE(us.win_rate, 0) as win_rate
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE u.is_active = TRUE;
