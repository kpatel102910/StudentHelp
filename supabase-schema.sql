-- Create submissions table for Student Help app
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    topic TEXT,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'request',
    status TEXT DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_timestamp ON submissions(timestamp DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Enable Row Level Security (optional, can be disabled for public access)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for security)
CREATE POLICY "Allow all access to submissions" ON submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);
