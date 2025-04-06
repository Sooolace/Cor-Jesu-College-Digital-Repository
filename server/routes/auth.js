const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');  // Fixed path to database connection
const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Query the database for the user by username
    const query = 'SELECT * FROM admin WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0]; // User data from the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);  // Compare hashed password

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Update last_login timestamp
    const updateLastLoginQuery = 'UPDATE admin SET last_login = NOW() WHERE id = $1';
    await pool.query(updateLastLoginQuery, [user.id]);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },  // Include relevant user data
      process.env.JWT_SECRET || 'your_secret_key',  // Use environment variable if available
      { expiresIn: '1h' }
    );

    // Send the token and user info back to the client
    return res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role || 'admin'
      }
    });

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Google OAuth login route
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Your existing Google token verification logic here
    // ... 

    // Once user is authenticated/created, update the last_login timestamp
    const userQuery = 'SELECT * FROM admin WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]); // email should come from Google token verification
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      // Update last_login timestamp
      const updateLastLoginQuery = 'UPDATE admin SET last_login = NOW() WHERE id = $1';
      await pool.query(updateLastLoginQuery, [user.id]);
      
      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user.id, username: user.username || user.name, role: user.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '1h' }
      );
      
      // Return user data and token
      return res.json({
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          picture: user.picture,
          role: user.role
        }
      });
    } else {
      // Handle case where Google user doesn't exist in your database
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ 
      message: 'Server error during Google authentication',
      details: error.message
    });
  }
});

module.exports = router;
