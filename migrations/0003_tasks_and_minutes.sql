-- Migration 0003: Fix period unique constraint + session minutes + tasks

-- Fix period soft-delete: allow recreating a period with same year+quarter after deletion
IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'uq_period_year_quarter' AND type = 'UQ' AND parent_object_id = OBJECT_ID('okr_periods'))
    ALTER TABLE okr_periods DROP CONSTRAINT uq_period_year_quarter;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uix_period_year_quarter_active' AND object_id = OBJECT_ID('okr_periods'))
    CREATE UNIQUE INDEX uix_period_year_quarter_active ON okr_periods(year, quarter) WHERE deleted_at IS NULL;

-- Session minutes (one per check-in session)
CREATE TABLE session_minutes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    session_id UNIQUEIDENTIFIER NOT NULL UNIQUE REFERENCES check_in_sessions(id),
    content NVARCHAR(MAX) NULL,
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    updated_by UNIQUEIDENTIFIER NULL REFERENCES users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Tasks board
CREATE TABLE tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'done', 'archived')),
    priority NVARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    assignee_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    minutes_id UNIQUEIDENTIFIER NULL REFERENCES session_minutes(id),
    due_date DATETIME2 NULL,
    position INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Task comments
CREATE TABLE task_comments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    task_id UNIQUEIDENTIFIER NOT NULL REFERENCES tasks(id),
    author_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Task tags
CREATE TABLE task_tags (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    task_id UNIQUEIDENTIFIER NOT NULL REFERENCES tasks(id),
    label NVARCHAR(100) NOT NULL,
    color NVARCHAR(20) NOT NULL DEFAULT '#6366f1',
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Indexes
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deleted ON tasks(deleted_at);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_tags_task ON task_tags(task_id);
CREATE INDEX idx_session_minutes_session ON session_minutes(session_id);
