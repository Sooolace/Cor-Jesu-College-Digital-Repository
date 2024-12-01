const bcrypt = require('bcryptjs');
const pool = require('../db');  // Import the PostgreSQL pool

async function insertAdminUser() {
  const username = 'admin';  // Username for the admin user
  const plainPassword = 'admin';  // Password for the admin user

  // Hash the password/
  const hashedPassword = await bcrypt.hash(plainPassword, 10);  // 10 is the salt rounds

  // Insert into the database
  try {
    const query = 'INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING id';
    const values = [username, hashedPassword];

    const result = await pool.query(query, values);

    console.log('Admin user created with ID:', result.rows[0].id);
  } catch (error) {
    console.error('Error inserting admin user:', error);
  }
}

// Call the function to insert the admin user
insertAdminUser();
