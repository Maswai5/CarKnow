-- Add auction feature tables
-- Run this in PostgreSQL: psql -d vehicle_platform -f add_auctions.sql

-- Update users role to allow auctioneer and bidder
-- (Already varchar, so no change needed)

-- Insert sample users if needed
-- But assume roles are set via admin

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    auctioneer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    starting_bid DECIMAL(10,2) NOT NULL,
    current_bid DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, ended, cancelled
    winner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    payment_reference VARCHAR(100), -- Link to payments table if needed
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);