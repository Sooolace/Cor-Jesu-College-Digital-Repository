const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db'); // Database connection
const NodeCache = require('node-cache'); // In-memory cache
const logActivity = require('../middlewares/logActivity'); // Import log activity middleware

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
            const insertAuthorsQuery = `
                INSERT INTO authors (name) 
                VALUES ($1)
                RETURNING author_id
            `;
            const authorInsertPromises = authors.map((author) => 
                pool.query(insertAuthorsQuery, [author])
            );
            const authorResults = await Promise.all(authorInsertPromises);

            console.log('Authors inserted:', authorResults.map(result => result.rows[0].author_id));

            // Link project and authors
            const insertProjectAuthorsQuery = `
                INSERT INTO project_authors (project_id, author_id) 
                VALUES ($1, $2)
            `;
            const projectAuthorInsertPromises = authorResults.map((authorResult) => 
                pool.query(insertProjectAuthorsQuery, [projectId, authorResult.rows[0].author_id])
            );
            await Promise.all(projectAuthorInsertPromises);
        }

        // Insert keywords if provided
        if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            const insertKeywordsQuery = `
                INSERT INTO keywords (keyword) 
                VALUES ($1)
                RETURNING keyword_id
            `;
            const keywordInsertPromises = keywords.map((keyword) => 
                pool.query(insertKeywordsQuery, [keyword])
            );
            const keywordResults = await Promise.all(keywordInsertPromises);

            console.log('Keywords inserted:', keywordResults.map(result => result.rows[0].keyword_id));

            // Link project and keywords
            const insertProjectKeywordsQuery = `
                INSERT INTO project_keywords (project_id, keyword_id) 
                VALUES ($1, $2)
            `;
            const projectKeywordInsertPromises = keywordResults.map((keywordResult) => 
                pool.query(insertProjectKeywordsQuery, [projectId, keywordResult.rows[0].keyword_id])
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

module.exports = router;