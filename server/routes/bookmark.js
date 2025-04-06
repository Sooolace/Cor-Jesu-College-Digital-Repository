const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();
const logActivity = require('../middlewares/logActivity'); // Activity logger middleware

/**
 * @route   GET /api/bookmarks/admin/:admin_id
 * @desc    Get all bookmarks for a specific admin
 * @access  Private
 */
router.get('/admin/:admin_id', async (req, res) => {
    try {
        const { admin_id } = req.params;
        
        const query = `
            SELECT b.*, p.title, p.abstract 
            FROM bookmarks b
            JOIN projects p ON b.project_id = p.project_id
            WHERE b.admin_id = $1
            ORDER BY b.created_at DESC
        `;
        
        const result = await pool.query(query, [admin_id]);
        
        // Always return a JSON array (empty if no bookmarks)
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        // Send empty array on error to prevent frontend hanging
        res.status(500).json({ error: 'Failed to fetch bookmarks', bookmarks: [] });
    }
});

/**
 * @route   GET /api/bookmarks/project/:project_id
 * @desc    Get all admins who bookmarked a specific project
 * @access  Private
 */
router.get('/project/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;
        
        const query = `
            SELECT b.*, a.username, a.email
            FROM bookmarks b
            JOIN admin a ON b.admin_id = a.id
            WHERE b.project_id = $1
        `;
        
        const result = await pool.query(query, [project_id]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching project bookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch project bookmarks' });
    }
});

/**
 * @route   POST /api/bookmarks
 * @desc    Add a new bookmark
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/bookmarks - Request body:', req.body);
        
        // Validate required parameters
        const { admin_id, project_id } = req.body;
        
        if (!admin_id || !project_id) {
            console.log('Missing required parameters. admin_id:', admin_id, 'project_id:', project_id);
            return res.status(400).json({ 
                error: 'Missing required parameters',
                message: 'Both admin_id and project_id are required'
            });
        }

        // Check if the IDs are valid integers
        if (isNaN(parseInt(admin_id)) || isNaN(parseInt(project_id))) {
            console.log('Invalid parameters format. admin_id:', admin_id, 'project_id:', project_id);
            return res.status(400).json({ 
                error: 'Invalid parameters',
                message: 'Both admin_id and project_id must be valid integers'
            });
        }
        
        // Check if the bookmark already exists
        const checkQuery = `
            SELECT * FROM bookmarks 
            WHERE admin_id = $1 AND project_id = $2
        `;
        
        console.log('Checking if bookmark exists with admin_id:', admin_id, 'project_id:', project_id);
        const checkResult = await pool.query(checkQuery, [admin_id, project_id]);
        
        if (checkResult.rows.length > 0) {
            console.log('Bookmark already exists');
            return res.status(400).json({ 
                error: 'Bookmark already exists',
                message: 'This project is already bookmarked by this admin'
            });
        }
        
        // Add the bookmark
        const insertQuery = `
            INSERT INTO bookmarks (admin_id, project_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        
        console.log('Inserting new bookmark for admin_id:', admin_id, 'project_id:', project_id);
        const result = await pool.query(insertQuery, [admin_id, project_id]);
        console.log('Bookmark inserted successfully:', result.rows[0]);

        // Instead of using the middleware, send a direct response
        res.status(201).json({
            success: true,
            message: 'Bookmark added successfully',
            bookmark: result.rows[0]
        });
        
        // Log activity separately
        try {
            req.activity = 'Added bookmark';
            req.additionalInfo = JSON.stringify({ admin_id, project_id });
            req.user = { id: admin_id, role: 'admin' }; // Add user info for logging
            
            // Call logActivity directly
            logActivity(req, res, () => {
                console.log('Activity logged');
            });
        } catch (logError) {
            console.error('Failed to log activity, but bookmark was still added:', logError);
        }
    } catch (error) {
        console.error('Error adding bookmark:', error);
        // Send detailed error for debugging
        res.status(500).json({ 
            error: 'Failed to add bookmark', 
            details: error.message,
            stack: error.stack
        });
    }
});

/**
 * @route   DELETE /api/bookmarks/:admin_id/:project_id
 * @desc    Delete a bookmark
 * @access  Private
 */
router.delete('/:admin_id/:project_id', async (req, res) => {
    try {
        console.log('DELETE /api/bookmarks - Request params:', req.params);
        
        const { admin_id, project_id } = req.params;
        
        // Validate parameters
        if (!admin_id || !project_id) {
            console.log('Missing required parameters. admin_id:', admin_id, 'project_id:', project_id);
            return res.status(400).json({ 
                error: 'Missing required parameters',
                message: 'Both admin_id and project_id are required'
            });
        }
        
        const query = `
            DELETE FROM bookmarks
            WHERE admin_id = $1 AND project_id = $2
            RETURNING *
        `;
        
        console.log('Deleting bookmark with admin_id:', admin_id, 'project_id:', project_id);
        const result = await pool.query(query, [admin_id, project_id]);
        
        if (result.rows.length === 0) {
            console.log('Bookmark not found for deletion');
            return res.status(404).json({ 
                error: 'Bookmark not found',
                message: 'No bookmark found with the provided admin and project IDs'
            });
        }
        
        console.log('Bookmark deleted successfully:', result.rows[0]);

        // Direct response without middleware
        res.status(200).json({
            success: true,
            message: 'Bookmark deleted successfully',
            bookmark: result.rows[0]
        });
        
        // Log activity separately
        try {
            req.activity = 'Removed bookmark';
            req.additionalInfo = JSON.stringify({ admin_id, project_id });
            req.user = { id: admin_id, role: 'admin' }; // Add user info for logging
            
            // Call logActivity directly
            logActivity(req, res, () => {
                console.log('Activity logged');
            });
        } catch (logError) {
            console.error('Failed to log activity, but bookmark was still deleted:', logError);
        }
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        // Send detailed error for debugging
        res.status(500).json({ 
            error: 'Failed to delete bookmark', 
            details: error.message,
            stack: error.stack
        });
    }
});

/**
 * @route   GET /api/bookmarks/check/:admin_id/:project_id
 * @desc    Check if a specific project is bookmarked by an admin
 * @access  Private
 */
router.get('/check/:admin_id/:project_id', async (req, res) => {
    try {
        const { admin_id, project_id } = req.params;
        
        const query = `
            SELECT * FROM bookmarks
            WHERE admin_id = $1 AND project_id = $2
        `;
        
        const result = await pool.query(query, [admin_id, project_id]);
        
        res.status(200).json({ 
            isBookmarked: result.rows.length > 0,
            bookmark: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        res.status(500).json({ error: 'Failed to check bookmark status' });
    }
});

module.exports = router; 