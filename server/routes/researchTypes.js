const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all research types
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM research_types ORDER BY name');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a research type by ID
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM research_types WHERE research_type_id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Research type not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST a new research type
router.post('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'INSERT INTO research_types (name) VALUES ($1) RETURNING *',
            [req.body.name]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT (update) a research type by ID
router.put('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'UPDATE research_types SET name = $1 WHERE research_type_id = $2 RETURNING *',
            [req.body.name, req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Research type not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a research type by ID
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM research_types WHERE research_type_id = $1', [req.params.id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Research type not found' });
        }
        res.status(204).send(); // No content after successful deletion
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
