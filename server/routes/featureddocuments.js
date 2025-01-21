// routes/featuredDocuments.js

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET - Fetch featured documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.project_id, p.title, pa.author_id, p.publication_date, p.abstract AS description
      FROM projects p
      JOIN project_authors pa ON p.project_id = pa.project_id
      ORDER BY p.publication_date DESC
      LIMIT 4;  -- Adjust the number to match the featured documents count
    `);

    const featuredDocuments = await Promise.all(result.rows.map(async (document) => {
      // Fetch author details
      const authorResult = await pool.query('SELECT name FROM authors WHERE author_id = $1', [document.author_id]);
      const author = authorResult.rows[0] ? authorResult.rows[0].name : 'Unknown Author';
      
      return {
        project_id: document.project_id,
        title: document.title,
        author: author,
        publication_date: document.publication_date,
        description: document.description
      };
    }));

    res.status(200).json(featuredDocuments);
  } catch (error) {
    console.error('Error fetching featured documents:', error.stack);
    res.status(500).json({ error: 'Failed to fetch featured documents' });
  }
});

// PUT - Update featured document (updates featured flag, title, publication date, abstract)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, publication_date, abstract, featured } = req.body;

  try {
    // First, check if the document exists
    const checkDocument = await pool.query('SELECT * FROM projects WHERE project_id = $1', [id]);

    if (checkDocument.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update the document's featured status and other fields
    const updatedDocument = await pool.query(`
      UPDATE projects 
      SET 
        title = $1,
        publication_date = $2,
        abstract = $3
      WHERE project_id = $4
      RETURNING project_id, title, publication_date, abstract
    `, [title, publication_date, abstract, id]);

    // Optionally, you can also update the "featured" flag if needed
    if (featured !== undefined) {
      await pool.query(`
        UPDATE projects
        SET featured = $1
        WHERE project_id = $2
      `, [featured, id]);
    }

    res.status(200).json(updatedDocument.rows[0]);
  } catch (error) {
    console.error('Error updating featured document:', error.stack);
    res.status(500).json({ error: 'Failed to update featured document' });
  }
});

module.exports = router;
