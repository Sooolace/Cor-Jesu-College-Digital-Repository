const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name'); // Ensure 'name' matches your actual column name
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a category by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]); // Make sure 'category_id' is the correct column name
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all authors with their category names
router.get('/', async (req, res) => {
    try {
        // SQL query that joins the authors and categories tables
        const result = await pool.query(`
            SELECT authors.*, categories.name AS category_name
            FROM authors
            JOIN categories ON authors.category_id = categories.category_id
            ORDER BY authors.name
        `);
        res.status(200).json(result.rows); // Send the result as JSON
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a single author by ID with category name
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT authors.*, categories.name AS category_name
            FROM authors
            JOIN categories ON authors.category_id = categories.category_id
            WHERE authors.author_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
