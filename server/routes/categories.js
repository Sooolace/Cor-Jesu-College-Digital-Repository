// categories.js
const express = require('express');
const pool = require('../db'); // Database connection
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/departments'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
});

// GET a category by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).json({ error: 'Server error' });
  }
});

// POST - Add a new category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const imageUrl = req.file ? `/uploads/departments/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO categories (name, image_url) VALUES ($1, $2) RETURNING *',
      [name, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'Error adding department' });
  }
});

// PUT - Update a category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/departments/${req.file.filename}`;
    }

    let query = 'UPDATE categories SET name = $1';
    let values = [name];

    if (imageUrl) {
      query += ', image_url = $2';
      values.push(imageUrl);
    }

    query += ' WHERE category_id = $' + (values.length + 1) + ' RETURNING *';
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Error updating department' });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department' });
  }
});

// Debug route to check table structure
router.get('/debug/table-info', async (req, res) => {
  try {
    // Get table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'categories'
    `);
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM categories LIMIT 5');
    
    res.json({
      tableStructure: tableInfo.rows,
      sampleData: sampleData.rows
    });
  } catch (error) {
    console.error('Error getting table info:', error);
    res.status(500).json({ error: 'Error getting table info', details: error.message });
  }
});

module.exports = router;
