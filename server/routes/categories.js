// categories.js
const express = require('express');
const pool = require('../db'); // Database connection
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage to process the image in memory
const upload = multer({ storage });

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category_id, name, image_url
      FROM categories
      ORDER BY name
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No categories found' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST - Add a new category
router.post('/', upload.single('image'), async (req, res) => {
  const { name } = req.body;
  if (!name || !req.file) {
    return res.status(400).json({ error: 'Name and Image are required' });
  }

  const imagePath = `uploads/${Date.now()}-${req.file.originalname}`;
  try {
    // Resize the image to 720x720
    await sharp(req.file.buffer)
      .resize(720, 720)
      .toFile(imagePath);

    const image_url = `/${imagePath}`;

    const result = await pool.query(`
      INSERT INTO categories (name, image_url)
      VALUES ($1, $2)
      RETURNING *
    `, [name, image_url]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding category:', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT - Update a category
router.put('/:category_id', upload.single('image'), async (req, res) => {
  const { category_id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  let image_url = null;
  if (req.file) {
    const imagePath = `uploads/${Date.now()}-${req.file.originalname}`;
    try {
      // Resize the image to 720x720
      await sharp(req.file.buffer)
        .resize(720, 720)
        .toFile(imagePath);

      image_url = `/${imagePath}`;
    } catch (error) {
      console.error('Error processing image:', error.stack);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  try {
    const result = await pool.query(`
      UPDATE categories
      SET name = $1, image_url = COALESCE($2, image_url)
      WHERE category_id = $3
      RETURNING *
    `, [name, image_url, category_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
