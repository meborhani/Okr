-- Migration 0005: Add source_type to tasks for traceability
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tasks') AND name = 'source_type')
    ALTER TABLE tasks ADD source_type NVARCHAR(50) NULL;
