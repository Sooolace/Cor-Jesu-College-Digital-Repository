// routes/keywords.js

const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST - Add a new keyword
router.post('/', async (req, res) => {
    const { keyword } = req.body; // Expecting a single keyword

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO keywords (keyword) VALUES ($1) RETURNING *',
            [keyword]
        );
        res.status(201).json(result.rows[0]); // Return the created keyword
    } catch (error) {
        console.error('Error inserting keyword:', error.stack);
        res.status(500).json({ error: 'Failed to submit keyword' });
    }
});

// GET - Fetch all keywords
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM keywords ORDER BY keyword');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving keywords:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve keywords' });
    }
});

// GET - Fetch a single keyword by keyword_id
router.get('/:keyword_id', async (req, res) => {
    const { keyword_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM keywords WHERE keyword_id = $1', [keyword_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving keyword:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve keyword' });
    }
});

// PUT - Update a keyword by keyword_id
router.put('/:keyword_id', async (req, res) => {
    const { keyword_id } = req.params;
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        const result = await pool.query(
            'UPDATE keywords SET keyword = $1 WHERE keyword_id = $2 RETURNING *',
            [keyword, keyword_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating keyword:', error.stack);
        res.status(500).json({ error: 'Failed to update keyword' });
    }
});

// DELETE - Remove a keyword by keyword_id
router.delete('/:keyword_id', async (req, res) => {
    const { keyword_id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM keywords WHERE keyword_id = $1 RETURNING *',
            [keyword_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        res.status(200).json({ message: 'Keyword deleted successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error deleting keyword:', error.stack);
        res.status(500).json({ error: 'Failed to delete keyword' });
    }
});

// GET - Fetch projects by a specific keyword
router.get('/:keyword_id/projects', async (req, res) => {
    const { keyword_id } = req.params;
    try {
        const projects = await pool.query(
            `SELECT p.* FROM projects p
             JOIN project_keywords pk ON p.project_id = pk.project_id
             WHERE pk.keyword_id = $1`,
            [keyword_id]
        );
        
        res.status(200).json(projects.rows);
    } catch (error) {
        console.error('Error retrieving projects:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});


module.exports = router;
