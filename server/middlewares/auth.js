const jwt = require('jsonwebtoken');
const pool = require('../db');

const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
        
        // Get user from database
        const result = await pool.query('SELECT * FROM admin WHERE id = $1', [decoded.userId]);
        
        if (result.rows.length > 0) {
            req.user = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                role: result.rows[0].role
            };
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        req.user = null;
        next();
    }
};

module.exports = verifyToken; 