const express = require('express');
const pool = require('../db');
const router = express.Router();
// POST to link project and keyword
router.post('/', async (req, res) => {
    const { project_id, keyword_id } = req.body;

    if (!project_id || !keyword_id) {
        return res.status(400).json({ error: 'Project ID and Keyword ID are required' });
    }

    try {
        // Check if the link already exists
        const existingLink = await pool.query(
            'SELECT * FROM project_keywords WHERE project_id = $1 AND keyword_id = $2',
            [project_id, keyword_id]
        );

        if (existingLink.rows.length > 0) {
            console.log('Link already exists');
            return res.status(409).json({ error: 'This link between project and keyword already exists' });
        }

        // Insert the new link and return the created row
        const result = await pool.query(
            'INSERT INTO project_keywords (project_id, keyword_id) VALUES ($1, $2) RETURNING *',
            [project_id, keyword_id]
        );

        console.log('Link created:', result.rows[0]);
        res.status(201).json({ project_id, keyword_id, message: 'Link created' });
    } catch (error) {
        console.error('Error creating link:', error.stack);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

// DELETE to remove a link between project and keyword
router.delete('/', async (req, res) => {
    const { project_id, keyword_id } = req.body;

    if (!project_id || !keyword_id) {
        return res.status(400).json({ error: 'Project ID and Keyword ID are required' });
    }

    try {
        // Delete the link from project_keywords
        const result = await pool.query(
            'DELETE FROM project_keywords WHERE project_id = $1 AND keyword_id = $2 RETURNING *',
            [project_id, keyword_id]
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

// GET keywords for a specific project
router.get('/:project_id', async (req, res) => {
    const projectId = parseInt(req.params.project_id);

    if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
        const result = await pool.query(
            'SELECT keywords.* FROM keywords ' +
            'INNER JOIN project_keywords ON keywords.keyword_id = project_keywords.keyword_id ' +
            'WHERE project_keywords.project_id = $1',
            [projectId]
        );
        res.json(result.rows); // Return the list of keywords
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Server error');
    }
});

module.exports = router;
