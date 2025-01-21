const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// GET topics by research area ID
router.get('/:researchAreaId', async (req, res) => {
    const { researchAreaId } = req.params; // Capture the research area ID from the request parameters
    try {
        const result = await pool.query(
            'SELECT * FROM topics WHERE research_area_id = $1 ORDER BY name', 
            [researchAreaId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No topics found for this research area' });
        }

        res.status(200).json(result.rows);
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

module.exports = router;
