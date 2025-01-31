<<<<<<< HEAD
=======
//topics.js

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

<<<<<<< HEAD
// GET topics by research area ID
=======
// GET topics by research area ID, including category information
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
router.get('/:researchAreaId', async (req, res) => {
    const { researchAreaId } = req.params; // Capture the research area ID from the request parameters
    try {
        const result = await pool.query(
<<<<<<< HEAD
            'SELECT * FROM topics WHERE research_area_id = $1 ORDER BY name', 
            [researchAreaId]
        );
        
=======
            `
            SELECT topics.topic_id, topics.name, topics.category_id, categories.name AS category_name
            FROM topics
            LEFT JOIN categories ON topics.category_id = categories.category_id
            WHERE research_area_id = $1
            ORDER BY topics.name
            `, 
            [researchAreaId]
        );

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No topics found for this research area' });
        }

<<<<<<< HEAD
        res.status(200).json(result.rows);
=======
        res.status(200).json(result.rows);  // Return topics with category info
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

<<<<<<< HEAD
=======

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
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

<<<<<<< HEAD
=======
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

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
module.exports = router;
