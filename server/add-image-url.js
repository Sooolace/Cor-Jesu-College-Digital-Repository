const mysql = require('mysql');
require('dotenv').config();

// Create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cjcdb',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // First, check if the column already exists
  const checkColumnSql = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'categories' 
    AND COLUMN_NAME = 'image_url'
  `;
  
  db.query(checkColumnSql, [process.env.DB_NAME || 'cjcdb'], (err, results) => {
    if (err) {
      console.error('Error checking for column:', err);
      db.end();
      return;
    }

    if (results.length > 0) {
      console.log('image_url column already exists in categories table');
      
      // Update existing categories with placeholder images if needed
      updatePlaceholders();
    } else {
      // Add the column if it doesn't exist
      const addColumnSql = `
        ALTER TABLE categories 
        ADD COLUMN image_url VARCHAR(255)
      `;
      
      db.query(addColumnSql, (err, results) => {
        if (err) {
          console.error('Error adding image_url column:', err);
          db.end();
          return;
        }
        
        console.log('Successfully added image_url column to categories table');
        
        // Update with placeholder images
        updatePlaceholders();
      });
    }
  });
});

function updatePlaceholders() {
  const updateSql = `
    UPDATE categories
    SET image_url = CONCAT('https://via.placeholder.com/150?text=', REPLACE(name, ' ', '+'))
    WHERE image_url IS NULL
  `;
  
  db.query(updateSql, (err, results) => {
    if (err) {
      console.error('Error updating placeholders:', err);
      db.end();
      return;
    }
    
    console.log('Updated', results.affectedRows, 'categories with placeholder images');
    
    // Display the results
    db.query('SELECT category_id, name, image_url FROM categories', (err, results) => {
      if (err) {
        console.error('Error querying categories:', err);
        db.end();
        return;
      }
      
      console.log('Categories with image_url:');
      console.table(results);
      
      db.end(() => {
        console.log('MySQL connection closed');
      });
    });
  });
} 