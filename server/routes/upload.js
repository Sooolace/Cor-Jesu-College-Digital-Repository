const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db'); // Database connection
const NodeCache = require('node-cache'); // In-memory cache
const logActivity = require('../middlewares/logActivity'); // Import log activity middleware
const fs = require('fs');

const router = express.Router();

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'downloads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save the file with its original name
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Initialize in-memory cache (TTL: 10 minutes)
const cache = new NodeCache({ stdTTL: 600 });

// Utility to parse and validate `study_url`
const parseStudyUrl = (study_url) => {
    if (!study_url) return '';
    try {
        const urls = Array.isArray(study_url) ? study_url : JSON.parse(study_url);
        return urls.join(', ');
    } catch {
        throw new Error('Invalid study_url format');
    }
};

// POST - Upload a file and add a new project
router.post('/upload', upload.single('file_path'), async (req, res) => { 
    const { title, description_type, abstract, publication_date, study_urls, category_id, authors, keywords } = req.body;
    const { file } = req;

    // Ensure required fields are present
    if (!title || !abstract || !publication_date) {
        console.log('Missing required fields:', { title, abstract, publication_date });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const filePath = file ? file.originalname : null; // Only the file name if file is uploaded
        const studyUrlString = parseStudyUrl(study_urls); // Parse study URL if provided

        console.log('Inserting project with data:', { title, description_type, abstract, publication_date, filePath, studyUrlString });

        // Insert project into the database
        const query = `
            INSERT INTO projects (title, description_type, abstract, publication_date, file_path, study_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await pool.query(query, [title, description_type, abstract, publication_date, filePath, studyUrlString]);

        const projectId = result.rows[0].project_id;

        console.log('Project inserted with ID:', projectId);

        // Insert authors if provided
        if (authors && Array.isArray(authors) && authors.length > 0) {
            const insertProjectAuthorsQuery = `
                INSERT INTO project_authors (project_id, author_id) 
                VALUES ($1, (SELECT author_id FROM authors WHERE name = $2))
            `;
            const projectAuthorInsertPromises = authors.map((authorName) => 
                pool.query(insertProjectAuthorsQuery, [projectId, authorName])
            );
            await Promise.all(projectAuthorInsertPromises);
        }

        // Insert keywords if provided
        if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            const insertProjectKeywordsQuery = `
                INSERT INTO project_keywords (project_id, keyword_id) 
                VALUES ($1, (SELECT keyword_id FROM keywords WHERE keyword = $2))
            `;
            const projectKeywordInsertPromises = keywords.map((keywordName) => 
                pool.query(insertProjectKeywordsQuery, [projectId, keywordName])
            );
            await Promise.all(projectKeywordInsertPromises);
        }

        // Respond with the newly created project, including the file_path if any
        res.status(201).json({
            ...result.rows[0],
            file_path: filePath,  // Add file_path to the response if any
        });
    } catch (error) {
        console.error('Error adding project:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Configure storage for department images
const departmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to public/assets folder
    const uploadPath = path.join(__dirname, '../../public/assets');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use the filename provided in the request or generate one
    const filename = req.body.filename || `department-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const departmentUpload = multer({ 
  storage: departmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Route to handle department image uploads
router.post('/department-image', departmentUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the path to be stored in the database
    // This is the public URL path, not the full file system path
    const imagePath = `/assets/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      imagePath: imagePath,
      originalname: req.file.originalname,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

module.exports = router;