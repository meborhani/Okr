-- OKR Management System - Initial Migration
-- SQL Server

-- Roles
CREATE TABLE roles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(50) NOT NULL UNIQUE,
    display_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Permissions
CREATE TABLE permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL UNIQUE,
    display_name NVARCHAR(200) NOT NULL,
    module NVARCHAR(50) NOT NULL,
    action NVARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Role Permissions
CREATE TABLE role_permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES roles(id),
    permission_id UNIQUEIDENTIFIER NOT NULL REFERENCES permissions(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- Departments
CREATE TABLE departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500) NULL,
    manager_id UNIQUEIDENTIFIER NULL,
    parent_id UNIQUEIDENTIFIER NULL REFERENCES departments(id),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Teams
CREATE TABLE teams (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500) NULL,
    department_id UNIQUEIDENTIFIER NULL REFERENCES departments(id),
    manager_id UNIQUEIDENTIFIER NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Users
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES roles(id),
    department_id UNIQUEIDENTIFIER NULL REFERENCES departments(id),
    team_id UNIQUEIDENTIFIER NULL REFERENCES teams(id),
    is_active BIT NOT NULL DEFAULT 1,
    last_login_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Add manager foreign keys after users table
ALTER TABLE departments ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES users(id);
ALTER TABLE teams ADD CONSTRAINT fk_team_manager FOREIGN KEY (manager_id) REFERENCES users(id);

-- OKR Periods (Shamsi quarters)
CREATE TABLE okr_periods (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(200) NOT NULL,
    year INT NOT NULL,
    quarter INT NOT NULL CHECK (quarter IN (1, 2, 3, 4)),
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    description NVARCHAR(500) NULL,
    created_by UNIQUEIDENTIFIER NULL REFERENCES users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL,
    CONSTRAINT uq_period_year_quarter UNIQUE (year, quarter)
);

-- Objectives
CREATE TABLE objectives (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(2000) NULL,
    period_id UNIQUEIDENTIFIER NOT NULL REFERENCES okr_periods(id),
    owner_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    department_id UNIQUEIDENTIFIER NULL REFERENCES departments(id),
    team_id UNIQUEIDENTIFIER NULL REFERENCES teams(id),
    parent_id UNIQUEIDENTIFIER NULL REFERENCES objectives(id),
    status NVARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'archived')),
    progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Key Results
CREATE TABLE key_results (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(2000) NULL,
    objective_id UNIQUEIDENTIFIER NOT NULL REFERENCES objectives(id),
    owner_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    start_value DECIMAL(18,4) NOT NULL DEFAULT 0,
    target_value DECIMAL(18,4) NOT NULL,
    current_value DECIMAL(18,4) NOT NULL DEFAULT 0,
    unit NVARCHAR(50) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'off_track', 'completed', 'cancelled')),
    progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

-- Check-ins
CREATE TABLE check_ins (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    key_result_id UNIQUEIDENTIFIER NOT NULL REFERENCES key_results(id),
    checked_by UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    value DECIMAL(18,4) NOT NULL,
    note NVARCHAR(2000) NULL,
    check_date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NULL REFERENCES users(id),
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(100) NOT NULL,
    entity_id NVARCHAR(255) NULL,
    old_values NVARCHAR(MAX) NULL,
    new_values NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_deleted ON users(deleted_at);
CREATE INDEX idx_objectives_period ON objectives(period_id);
CREATE INDEX idx_objectives_owner ON objectives(owner_id);
CREATE INDEX idx_objectives_deleted ON objectives(deleted_at);
CREATE INDEX idx_key_results_objective ON key_results(objective_id);
CREATE INDEX idx_key_results_owner ON key_results(owner_id);
CREATE INDEX idx_key_results_deleted ON key_results(deleted_at);
CREATE INDEX idx_check_ins_key_result ON check_ins(key_result_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
