-- Add scope to objectives
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('objectives') AND name = 'scope')
    ALTER TABLE objectives ADD scope NVARCHAR(20) NOT NULL CONSTRAINT df_objectives_scope DEFAULT 'organization';

-- Add session_id to tasks (direct session association, independent of minutes)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tasks') AND name = 'session_id')
    ALTER TABLE tasks ADD session_id UNIQUEIDENTIFIER NULL
        CONSTRAINT fk_tasks_session FOREIGN KEY REFERENCES check_in_sessions(id);
