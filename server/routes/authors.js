const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST - Add a new author
router.post('/', async (req, res) => {
    const { name, category_id } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        // Check if the author already exists in the database
        const checkAuthorQuery = 'SELECT * FROM authors WHERE name = $1';
        const existingAuthor = await pool.query(checkAuthorQuery, [name]);

        if (existingAuthor.rows.length > 0) {
            // If author already exists, return a 400 error
            return res.status(400).json({ error: 'Author with this name already exists' });
        }

        // Insert the new author into the authors table
        const insertQuery = 'INSERT INTO authors (name, category_id) VALUES ($1, $2) RETURNING *';

        // If no category_id is provided, we insert NULL for category_id (or handle based on your requirement)
        const result = await pool.query(insertQuery, [name, category_id || null]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding author:', error.stack);
        res.status(500).json({ error: 'Failed to add author' });
    }
});



// PUT - Update an existing author with category_id
router.put('/authwcatid/:authorId', async (req, res) => {
    const { authorId } = req.params;
    const { name, category_id } = req.body;

    if (!name || !category_id) {
        return res.status(400).json({ error: 'Name and category_id are required' });
    }

    try {
        // Update the author in the database
        const result = await pool.query(
            'UPDATE authors SET name = $1, category_id = $2 WHERE author_id = $3 RETURNING *',
            [name, category_id, authorId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating author:', error.stack);
        res.status(500).json({ error: 'Failed to update author' });
    }
});


// GET - Fetch all authors with category (if exists)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, c.name AS category_name
            FROM authors a
            LEFT JOIN categories c ON a.category_id = c.category_id
            ORDER BY a.name
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving authors:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve authors' });
    }
});



// GET - Fetch a single author by author_id
router.get('/:author_id', async (req, res) => {
    const { author_id } = req.params;

    // Validate the author_id (make sure it's a valid integer)
    if (!author_id || isNaN(author_id)) {
        return res.status(400).json({ error: 'Invalid author ID' });
    }

    try {
        const result = await pool.query('SELECT * FROM authors WHERE author_id = $1', [author_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving author:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve author' });
    }
});

// GET - Fetch a single author by author_id along with categories
router.get('/:author_id/details', async (req, res) => {
    const { author_id } = req.params;

    if (!author_id || isNaN(author_id)) {
        return res.status(400).json({ error: 'Invalid author ID' });
    }

    console.log(`Fetching author with ID: ${author_id}`); // Debugging log

    try {
        // Fetch author details
        const authorResult = await pool.query('SELECT * FROM authors WHERE author_id = $1', [author_id]);

        if (authorResult.rows.length === 0) {
            console.log(`No author found for ID: ${author_id}`); // Debugging log
            return res.status(404).json({ error: 'Author not found' });
        }

        // Fetch categories list
        const categoriesResult = await pool.query('SELECT * FROM categories');

        // Return both author and categories
        res.status(200).json({
            author: authorResult.rows[0],
            categories: categoriesResult.rows
        });
    } catch (error) {
        console.error('Error retrieving author details:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve author details and categories' });
    }
});



// GET - Fetch works by a specific author
router.get('/:author_id/works', async (req, res) => {
    const { author_id } = req.params;
    try {
        const works = await pool.query(
            `SELECT p.* FROM projects p 
             JOIN project_authors pa ON p.project_id = pa.project_id 
             WHERE pa.author_id = $1`, 
             [author_id]
        );
        
        res.status(200).json(works.rows);
    } catch (error) {
        console.error('Error retrieving works:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve works' });
    }
});

// PUT - Update an author by author_id (with category_id)
router.put('/:author_id', async (req, res) => {
    const { author_id } = req.params;
    const { name, category_id } = req.body;

    if (!name || !category_id) {
        return res.status(400).json({ error: 'Name and category_id are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE authors SET name = $1, category_id = $2 WHERE author_id = $3 RETURNING *',
            [name, category_id, author_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating author:', error.stack);
        res.status(500).json({ error: 'Failed to update author' });
    }
});

// DELETE - Remove an author by author_id
router.delete('/:author_id', async (req, res) => {
    const { author_id } = req.params;

    // Validate the author_id (ensure it's a valid integer)
    if (!author_id || isNaN(author_id)) {
        return res.status(400).json({ error: 'Invalid author ID' });
    }

    try {
        // Delete the author from the database
        const result = await pool.query('DELETE FROM authors WHERE author_id = $1 RETURNING *', [author_id]);

        // Check if the author was found and deleted
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        // Successfully deleted
        res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error) {
        console.error('Error deleting author:', error.stack);
        res.status(500).json({ error: 'Failed to delete author' });
    }
});

router.get('/top-viewed', async (req, res) => {
    try {
      const topViewedProjects = await Project.find()
        .sort({ view_count: -1 }) // Sort by view_count in descending order
        .limit(10); // Limit to top 10
      res.json(topViewedProjects);
    } catch (error) {
      console.error('Error fetching top viewed projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  // New route to fetch an author by name
router.get('/name/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await pool.query('SELECT * FROM authors WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving author:', error.stack);
        res.status(500).json({ error: 'Failed to retrieve author' });
    }
});

module.exports = router;
