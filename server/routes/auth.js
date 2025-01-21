const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');  // Import your PostgreSQL connection
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());  // To parse JSON requests

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Query the database for the user by username
    const query = 'SELECT * FROM admin WHERE username = $1'; // Modify 'admin' to your actual table name
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0]; // User data from the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);  // Compare hashed password

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },  // Include relevant user data
      'your_secret_key',  // Secret key for JWT (use environment variables for security)
      { expiresIn: '1h' }
    );

    // Send the token back to the client
    return res.json({ token });

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
