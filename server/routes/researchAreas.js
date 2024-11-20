const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// GET research areas by category ID
router.get('/:categoryId', async (req, res) => {
    const { categoryId } = req.params; // Capture the category ID from the request parameters

    // Log the received categoryId for debugging purposes
    console.log('Received categoryId:', categoryId);

    // Validate that categoryId is a valid number (you can adapt this check as needed)
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    try {
        // Query the database for research areas based on the category ID
        const result = await pool.query(
            'SELECT * FROM research_areas WHERE category_id = $1 ORDER BY name',
            [categoryId]
        );

        // If no research areas are found, return a 404 status
        if (result.rows.length === 0) {
            console.log(`No research areas found for category ID: ${categoryId}`); // Log if no data found
            return res.status(404).json({ error: 'No research areas found for this category' });
        }

        // Return the fetched research areas
        res.status(200).json(result.rows);
    } catch (error) {
        // Log the error details for better debugging
        console.error('Error executing query:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a research area by researchAreaId
router.get('/researchArea/:researchAreaId', async (req, res) => {
    const { researchAreaId } = req.params; // Capture the researchAreaId from the request parameters

    // Log the received researchAreaId for debugging purposes
    console.log('Received researchAreaId:', researchAreaId);

    // Validate that researchAreaId is a valid number
    if (isNaN(researchAreaId)) {
        return res.status(400).json({ error: 'Invalid research area ID' });
    }

    try {
        // Query the database for the research area by its ID
        const result = await pool.query(
            'SELECT * FROM research_areas WHERE research_area_id = $1',
            [researchAreaId]
        );

        // If no research area is found, return a 404 status
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Research area not found' });
        }

        // Return the fetched research area
        res.status(200).json(result.rows[0]);
    } catch (error) {
        // Log the error details for better debugging
        console.error('Error executing query:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all research areas (fallback route)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM research_areas ORDER BY name');
        res.status(200).json(result.rows); // Return all research areas in JSON format
    } catch (error) {
        // Log the error details for better debugging
        console.error('Error executing query:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
