const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function applyMigration() {
  try {
    console.log('Starting migration for project_views table...');
    
    const sqlPath = path.join(__dirname, 'migrations', 'create_project_views_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration(); 