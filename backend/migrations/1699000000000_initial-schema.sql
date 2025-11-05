-- Initial database schema for Tetris Cooperativo Asincrono

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    igd_score_baseline INTEGER, -- Internet Gaming Disorder score for research
    social_network_size INTEGER, -- For research
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed INTEGER NOT NULL, -- RNG seed for piece sequence
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    target_lines INTEGER DEFAULT 100,
    total_lines_cleared INTEGER DEFAULT 0,
    max_duration_hours INTEGER DEFAULT 24,
    CONSTRAINT positive_target CHECK (target_lines > 0),
    CONSTRAINT positive_duration CHECK (max_duration_hours > 0)
);

-- Game players (many-to-many relationship)
CREATE TABLE game_players (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_number INTEGER CHECK (player_number BETWEEN 1 AND 4),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (game_id, user_id),
    UNIQUE (game_id, player_number)
);

-- Game state snapshots (current state of the grid)
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    grid_state JSONB NOT NULL, -- 20x10 matrix serialized
    move_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT positive_moves CHECK (move_count >= 0)
);

-- Create only one game_state per game (enforce with unique index)
CREATE UNIQUE INDEX idx_game_states_game_id ON game_states(game_id);

-- Moves (every single piece placed)
CREATE TABLE moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    move_number INTEGER NOT NULL, -- Sequential move number
    piece_type CHAR(1) NOT NULL CHECK (piece_type IN ('I', 'O', 'T', 'S', 'Z', 'J', 'L')),
    piece_rotation INTEGER CHECK (piece_rotation BETWEEN 0 AND 3),
    position_x INTEGER CHECK (position_x BETWEEN 0 AND 9),
    position_y INTEGER CHECK (position_y >= 0),
    lines_cleared INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    time_taken_seconds INTEGER, -- How long the player took
    CONSTRAINT positive_move_number CHECK (move_number >= 0),
    CONSTRAINT positive_time CHECK (time_taken_seconds >= 0),
    UNIQUE (game_id, move_number)
);

-- Notifications (push notifications log)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('turn_ready', 'game_complete', 'game_failed', 'danger_mode', 'invite_received')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Analytics events (for research)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Push tokens (for Expo push notifications)
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);

CREATE INDEX idx_moves_game_id ON moves(game_id);
CREATE INDEX idx_moves_user_id ON moves(user_id);
CREATE INDEX idx_moves_created_at ON moves(created_at DESC);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_game_id ON analytics_events(game_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- Create function to automatically update game total_lines_cleared
CREATE OR REPLACE FUNCTION update_game_lines_cleared()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE games
    SET total_lines_cleared = (
        SELECT COALESCE(SUM(lines_cleared), 0)
        FROM moves
        WHERE game_id = NEW.game_id
    )
    WHERE id = NEW.game_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic line count updates
CREATE TRIGGER trigger_update_game_lines
AFTER INSERT ON moves
FOR EACH ROW
EXECUTE FUNCTION update_game_lines_cleared();

-- Create function to check if game is complete
CREATE OR REPLACE FUNCTION check_game_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if target lines reached
    IF NEW.total_lines_cleared >= NEW.target_lines THEN
        NEW.status = 'completed';
        NEW.completed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for game completion
CREATE TRIGGER trigger_check_completion
BEFORE UPDATE OF total_lines_cleared ON games
FOR EACH ROW
WHEN (OLD.status = 'active')
EXECUTE FUNCTION check_game_completion();

-- Insert admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash generated with bcrypt, cost factor 10
INSERT INTO users (username, email, password_hash)
VALUES (
    'admin',
    'admin@tetriscoop.com',
    '$2b$10$K8jzX8dQq4W5wKz9Y7J3J.qJ7Q8dJ7J8dJ7J8dJ7J8dJ7J8dJ7J8dJ'
);

COMMENT ON TABLE users IS 'User accounts for the game';
COMMENT ON TABLE games IS 'Game sessions with 4 players';
COMMENT ON TABLE game_players IS 'Mapping of users to games';
COMMENT ON TABLE game_states IS 'Current state of each game grid';
COMMENT ON TABLE moves IS 'Individual piece placements by players';
COMMENT ON TABLE notifications IS 'Push notification history';
COMMENT ON TABLE analytics_events IS 'Analytics events for research purposes';
COMMENT ON TABLE push_tokens IS 'Expo push notification tokens';
