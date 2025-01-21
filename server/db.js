// db.js
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    user: 'postgres',          // Your database username
    host: 'localhost',         // Your database host (e.g., 'localhost')
    database: 'cjcresearchrepo',      // Your database name
    password: 'LETMELOG',   // Your database password
    port: 5432,                     // Default PostgreSQL port
});

// Test the connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to the database');
        done();  // Always release the client after use
    }
});

module.exports = pool;
