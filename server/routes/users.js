const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and admin role
const verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users (admin only)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const query = 'SELECT id, username, email, role FROM admin ORDER BY username';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/:id/role', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  // Validate role
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user"' });
  }
  
  try {
    // Check if user exists
    const checkQuery = 'SELECT id FROM admin WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update role
    const updateQuery = 'UPDATE admin SET role = $1 WHERE id = $2 RETURNING id, username, role';
    const updateResult = await pool.query(updateQuery, [role, id]);
    
    res.json({
      message: 'Role updated successfully',
      user: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 