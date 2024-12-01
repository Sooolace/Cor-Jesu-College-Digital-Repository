const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST to link project and category
router.post('/', async (req, res) => {
    const { project_id, category_id } = req.body;

    if (!project_id || !category_id) {
        return res.status(400).json({ error: 'Project ID and Category ID are required' });
    }

    try {
        // Check if the link already exists
        const existingLink = await pool.query(
            'SELECT * FROM projects_category WHERE project_id = $1 AND category_id = $2',
            [project_id, category_id]
        );

        if (existingLink.rows.length > 0) {
            console.log('Link already exists');
            return res.status(409).json({
                error: 'This link between project and category already exists',
                existingLink: existingLink.rows[0],  // Optional: Return the existing link
            });
        }

        // Insert the new link and return the created row
        const result = await pool.query(
            'INSERT INTO projects_category (project_id, category_id) VALUES ($1, $2) RETURNING *',
            [project_id, category_id]
        );

        res.status(201).json({ project_id, category_id, message: 'Link created', data: result.rows[0] });
    } catch (error) {
        console.error('Error creating link:', error.stack);
        res.status(500).json({ error: 'Failed to create link' });
    }
});


// DELETE to remove a link between project and category
router.delete('/', async (req, res) => {
    const { project_id, category_id } = req.body;

    if (!project_id || !category_id) {
        return res.status(400).json({ error: 'Project ID and Category ID are required' });
    }

    try {
        // Delete the link from projects_category
        const result = await pool.query(
            'DELETE FROM projects_category WHERE project_id = $1 AND category_id = $2 RETURNING *',
            [project_id, category_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }

        res.status(200).json({ message: 'Link removed successfully' });
    } catch (error) {
        console.error('Error deleting link:', error.stack);
        res.status(500).json({ error: 'Failed to remove link' });
    }
});

// GET categories for a specific project
router.get('/:project_id', async (req, res) => {
    const projectId = parseInt(req.params.project_id);

    if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
        const result = await pool.query(
            'SELECT categories.* FROM categories ' +
            'INNER JOIN projects_category ON categories.category_id = projects_category.category_id ' +
            'WHERE projects_category.project_id = $1',
            [projectId]
        );
        res.json(result.rows); // Return the list of categories
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Server error');
    }
});

module.exports = router;
