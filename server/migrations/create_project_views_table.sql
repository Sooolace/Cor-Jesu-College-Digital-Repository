-- Create project_views table to track individual views
CREATE TABLE IF NOT EXISTS project_views (
    view_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id INTEGER,  -- NULL for anonymous users
    session_id VARCHAR(255), -- To track anonymous users' views
    ip_address VARCHAR(45),  -- To track by IP address
    view_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_duration INTEGER DEFAULT 0, -- Duration in seconds
    is_valid BOOLEAN DEFAULT FALSE -- Will be updated to TRUE after 10 seconds
);

-- Add index to speed up queries
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_session_id ON project_views(session_id);
CREATE INDEX IF NOT EXISTS idx_project_views_timestamp ON project_views(view_timestamp); 