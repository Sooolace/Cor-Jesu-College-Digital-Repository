// categories.js
const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();

// Helper function to process the result into a nested structure
const processCategoryData = (rows) => {
    return rows.reduce((acc, row) => {
        let category = acc.find(c => c.category_id === row.category_id);
        if (!category) {
            category = {
                category_id: row.category_id,
                name: row.category_name,
                research_areas: []
            };
            acc.push(category);
        }

        let researchArea = category.research_areas.find(ra => ra.research_area_id === row.research_area_id);
        if (row.research_area_id && !researchArea) {
            researchArea = {
                research_area_id: row.research_area_id,
                name: row.research_area_name,
                topics: []
            };
            category.research_areas.push(researchArea);
        }

        if (row.topic_id) {
            const existingTopic = researchArea.topics.find(topic => topic.topic_id === row.topic_id);
            if (!existingTopic) {
                researchArea.topics.push({
                    topic_id: row.topic_id,
                    name: row.topic_name
                });
            }
        }

        return acc;
    }, []);
};

// GET all categories with their research areas and topics
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                categories.category_id, 
                categories.name AS category_name,
                research_areas.research_area_id, 
                research_areas.name AS research_area_name,
                topics.topic_id, 
                topics.name AS topic_name
            FROM categories
            LEFT JOIN research_areas ON categories.category_id = research_areas.category_id
            LEFT JOIN topics ON research_areas.research_area_id = topics.research_area_id
            ORDER BY categories.name, research_areas.name, topics.name
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No categories found' });
        }

        const categories = processCategoryData(result.rows);

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a single category with its research areas and topics by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                categories.category_id, 
                categories.name AS category_name,
                research_areas.research_area_id, 
                research_areas.name AS research_area_name,
                topics.topic_id, 
                topics.name AS topic_name
            FROM categories
            LEFT JOIN research_areas ON categories.category_id = research_areas.category_id
            LEFT JOIN topics ON research_areas.research_area_id = topics.research_area_id
            WHERE categories.category_id = $1
            ORDER BY research_areas.name, topics.name
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const category = processCategoryData(result.rows)[0]; // Single category

        res.status(200).json(category);
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
