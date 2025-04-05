const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addRoleColumn() {
  try {
    console.log('Checking if role column exists...');
    
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin' AND column_name = 'role';
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('Role column does not exist. Adding it...');
      
      // Add the role column
      const alterQuery = `
        ALTER TABLE admin 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user';
      `;
      
      await pool.query(alterQuery);
      console.log('Role column added successfully!');
    } else {
      console.log('Role column already exists!');
    }
    
    // Add other necessary columns for OAuth
    console.log('Adding other necessary columns if they don\'t exist...');
    
    const alterQueries = [
      `ALTER TABLE admin ADD COLUMN IF NOT EXISTS email VARCHAR(255);`,
      `ALTER TABLE admin ADD COLUMN IF NOT EXISTS picture_url VARCHAR(500);`
    ];
    
    for (const query of alterQueries) {
      await pool.query(query);
    }
    
    console.log('Database structure updated successfully!');
    
    // Show current structure
    const structureQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'admin'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await pool.query(structureQuery);
    
    console.log('\nCurrent admin table structure:');
    structureResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    pool.end();
  }
}

// Run the function
addRoleColumn(); 