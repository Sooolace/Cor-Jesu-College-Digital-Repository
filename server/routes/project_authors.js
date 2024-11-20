const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST to link project and author
router.post('/', async (req, res) => {
    const { project_id, author_id } = req.body;

    if (!project_id || !author_id) {
        return res.status(400).json({ error: 'Project ID and Author ID are required' });
    }

    try {
        // Check if the link already exists
        const existingLink = await pool.query(
            'SELECT * FROM project_authors WHERE project_id = $1 AND author_id = $2',
            [project_id, author_id]
        );

        if (existingLink.rows.length > 0) {
            console.log('Link already exists');
            return res.status(409).json({ error: 'This link between project and author already exists' });
        }

        // Insert the new link and return the created row
        const result = await pool.query(
            'INSERT INTO project_authors (project_id, author_id) VALUES ($1, $2) RETURNING *',
            [project_id, author_id]
        );

        console.log('Link created:', result.rows[0]);
        res.status(201).json({ project_id, author_id, message: 'Link created' });
    } catch (error) {
        console.error('Error creating link:', error.stack);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

// DELETE to remove a link between project and author
router.delete('/', async (req, res) => {
    const { project_id, author_id } = req.body;

    if (!project_id || !author_id) {
        return res.status(400).json({ error: 'Project ID and Author ID are required' });
    }

    try {
        // Delete the link from project_authors
        const result = await pool.query(
            'DELETE FROM project_authors WHERE project_id = $1 AND author_id = $2 RETURNING *',
            [project_id, author_id]
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

// GET authors for a specific project
router.get('/:project_id', async (req, res) => {
    const projectId = parseInt(req.params.project_id);

    if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
        const result = await pool.query(
            'SELECT authors.* FROM authors ' +
            'INNER JOIN project_authors ON authors.author_id = project_authors.author_id ' +
            'WHERE project_authors.project_id = $1',
            [projectId]
        );
        res.json(result.rows); // Return the list of authors
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Server error');
    }
});

module.exports = router;
