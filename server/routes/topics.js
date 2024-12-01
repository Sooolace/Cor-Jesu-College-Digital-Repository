//topics.js

const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// GET topics by research area ID, including category information
router.get('/:researchAreaId', async (req, res) => {
    const { researchAreaId } = req.params; // Capture the research area ID from the request parameters
    try {
        const result = await pool.query(
            `
            SELECT topics.topic_id, topics.name, topics.category_id, categories.name AS category_name
            FROM topics
            LEFT JOIN categories ON topics.category_id = categories.category_id
            WHERE research_area_id = $1
            ORDER BY topics.name
            `, 
            [researchAreaId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No topics found for this research area' });
        }

        res.status(200).json(result.rows);  // Return topics with category info
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/topics/:topicId', async (req, res) => {
    const { topicId } = req.params; // Capture the topicId from the request parameters

    // Log the received topicId for debugging purposes
    console.log('Received topicId:', topicId);

    // Validate that topicId is a valid number
    if (isNaN(topicId)) {
        return res.status(400).json({ error: 'Invalid topic ID' });
    }

    try {
        // Query the database for the specific topic by its ID
        const result = await pool.query(
            'SELECT * FROM topics WHERE topic_id = $1',
            [topicId]
        );

        // If no topic is found, return a 404 status
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Return the fetched topic
        res.status(200).json(result.rows[0]);
    } catch (error) {
        // Log the error details for better debugging
        console.error('Error executing query:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all authors (potentially misplaced route for topics)
// This route should be defined in the "authors" route file instead of here
router.get('/', async (req, res) => {
    try {
        // Query to select all authors
        const result = await pool.query(
            'SELECT * FROM authors ORDER BY name' // Fetch all authors, ordered by name
        );

        // If no authors found, return an empty array
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No authors found' });
        }

        // Send the result as JSON
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' }); // Returning error in JSON format
    }
});

module.exports = router;
