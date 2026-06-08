-- Migration: Check-in Sessions
-- Run after 0001_init.sql

-- Add frequency column to okr_periods
ALTER TABLE okr_periods ADD frequency NVARCHAR(20) NULL DEFAULT 'weekly';
ALTER TABLE okr_periods ADD CONSTRAINT chk_okr_periods_frequency CHECK (frequency IN ('weekly', 'biweekly', 'monthly'));

-- Check-in sessions table
CREATE TABLE check_in_sessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    period_id UNIQUEIDENTIFIER NOT NULL REFERENCES okr_periods(id),
    title NVARCHAR(200) NOT NULL,
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    due_date DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'locked',
    frequency NVARCHAR(20) NOT NULL DEFAULT 'weekly',
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT chk_session_status CHECK (status IN ('locked', 'open', 'closed')),
    CONSTRAINT chk_session_frequency CHECK (frequency IN ('weekly', 'biweekly', 'monthly'))
);

-- Add session_id FK to check_ins
ALTER TABLE check_ins ADD session_id UNIQUEIDENTIFIER NULL REFERENCES check_in_sessions(id);

-- Indexes
CREATE INDEX idx_check_in_sessions_period ON check_in_sessions(period_id);
CREATE INDEX idx_check_in_sessions_status ON check_in_sessions(status);
CREATE INDEX idx_check_in_sessions_dates ON check_in_sessions(start_date, end_date);
CREATE INDEX idx_check_ins_session ON check_ins(session_id);
