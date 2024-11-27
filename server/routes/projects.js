const express = require('express');
const pool = require('../db'); // Database connection
const multer = require('multer'); // For handling file uploads

const router = express.Router();

// Set up multer for handling file uploads
const upload = multer({
    dest: 'downloads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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

// POST - Add a new project
router.post('/', upload.single('file_path'), async (req, res) => {
    const { title, description_type, abstract, publication_date, study_url, category_id, keywords } = req.body;

    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const filePath = req.file.path;
        const studyUrlString = parseStudyUrl(study_url);

        const query = `
            INSERT INTO projects (title, description_type, abstract, publication_date, file_path, study_url, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await pool.query(query, [title, description_type, abstract, publication_date, filePath, studyUrlString, category_id]);

        // Insert keywords into the keywords table
        const projectId = result.rows[0].project_id; // Get the inserted project ID
        if (keywords && keywords.length > 0) {
            const insertKeywordsQuery = `
                INSERT INTO keywords (project_id, keyword)
                VALUES ($1, $2)
            `;
            const keywordInsertPromises = keywords.map(keyword => pool.query(insertKeywordsQuery, [projectId, keyword]));
            await Promise.all(keywordInsertPromises);
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

  // GET - Fetch all projects without any search conditions
router.get('/', async (req, res) => {
    const searchQuery = `
SELECT p.*, 
       STRING_AGG(DISTINCT a.name, ', ') AS authors, 
       STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
FROM projects p
LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
LEFT JOIN authors a ON pa.author_id = a.author_id 
LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
GROUP BY p.project_id 
ORDER BY p.publication_date DESC

    `;

    try {
        // Execute the query to retrieve all projects
        const result = await pool.query(searchQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});


// GET - Fetch a single project by project_id
router.get('/:project_id', async (req, res) => {
    const { project_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [project_id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving project:', error);
        res.status(500).json({ error: 'Failed to retrieve project' });
    }
});



router.put('/:project_id', upload.single('file_path'), async (req, res) => {
    const { project_id } = req.params;
    const {
        title,
        publication_date,
        keywords,
        abstract,
        study_url,  // Assume it's always a single URL
        category_id,
        research_area_id,
        topic_id,
        research_type_id
    } = req.body;

    console.log('Updating project:', {
        project_id,
        title,
        publication_date,
        abstract,
        category_id,
        research_area_id,
        topic_id,
        research_type_id,
    });

    try {
        const filePath = req.file ? req.file.path : undefined;
        
        // Directly use the single study_url
        const studyUrlString = study_url;  

        const query = `
            UPDATE projects 
            SET title = $1, publication_date = $2, abstract = $3, 
                study_url = $4, category_id = $5, research_area_id = $6, 
                topic_id = $7, research_type_id = $8, 
                file_path = COALESCE($9, file_path) 
            WHERE project_id = $10 
            RETURNING *
        `;
        const params = [
            title, publication_date, abstract, studyUrlString,
            category_id, research_area_id, topic_id, research_type_id, filePath, project_id
        ];
        const result = await pool.query(query, params);

        if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});


// POST - Add an author to a project
router.post('/:project_id/authors', async (req, res) => {
    const { project_id } = req.params;
    const { author_id } = req.body;

    if (!author_id) return res.status(400).json({ error: 'Author ID is required' });

    try {
        const existingLink = await pool.query(
            'SELECT * FROM project_authors WHERE project_id = $1 AND author_id = $2',
            [project_id, author_id]
        );

        if (existingLink.rows.length) return res.status(409).json({ error: 'Link already exists' });

        await pool.query(
            'INSERT INTO project_authors (project_id, author_id) VALUES ($1, $2)',
            [project_id, author_id]
        );

        res.status(201).json({ project_id, author_id, message: 'Link created' });
    } catch (error) {
        console.error('Error adding author to project:', error);
        res.status(500).json({ error: 'Failed to create link' });
    }
});
router.get('/top-viewed', async (req, res) => {
  try {
    const query = `
      SELECT project_id, title, view_count
      FROM projects
      ORDER BY view_count DESC
      LIMIT 10;
    `;
    const result = await pool.query(query); // Assuming you have a pool of database connections
    res.status(200).json(result.rows);  // Ensure the response is an array
  } catch (error) {
    console.error('Error fetching top viewed projects:', error); // Log the error to debug
    res.status(500).json({ error: 'Failed to retrieve project' });  // Send error response
  }
});
router.delete('/:project_id', async (req, res) => {
    const { project_id } = req.params;

    try {
        // Check if the project exists
        const checkQuery = 'SELECT * FROM projects WHERE project_id = $1';
        const checkResult = await pool.query(checkQuery, [project_id]);

        if (!checkResult.rows.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete related records in other tables
        await pool.query('DELETE FROM project_authors WHERE project_id = $1', [project_id]);
        await pool.query('DELETE FROM projects_category WHERE project_id = $1', [project_id]);
        await pool.query('DELETE FROM project_keywords WHERE project_id = $1', [project_id]);

        // Delete the project from the database
        await pool.query('DELETE FROM projects WHERE project_id = $1', [project_id]);

        res.status(200).json({ message: `Project with ID ${project_id} and its related data have been deleted` });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});


router.get('/departments/:departmentName', async (req, res) => {
    const { departmentName } = req.params;  // Capture the department short code from the URL

    // Mapping of department short codes to full department names
    const departmentNameMapping = {
        'ccis': 'College of Computer and Information Sciences (CCIS)',
        'coe': 'College of Engineering (COE)',
        'cabe': 'College of Accountancy, Business, and Entrepreneurship (CABE)',
        'chs': 'College of Health Sciences (CHS)',
        'cedas': 'College of Education Arts and Sciences (CEDAS)',
        'cjc': 'Graduate School',
    };

    const fullDepartmentName = departmentNameMapping[departmentName.toLowerCase()];

    // Check if the department name exists in the mapping
    if (!fullDepartmentName) {
        return res.status(404).json({ error: 'Department not found' });
    }

    try {
        // Query the database for projects related to this department
        const query = `
            SELECT p.*, STRING_AGG(a.name, ', ') AS authors
            FROM projects p
            JOIN projects_category pc ON p.project_id = pc.project_id
            JOIN categories c ON pc.category_id = c.category_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE c.name = $1
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC;
        `;
        
        // Pass `fullDepartmentName` as the parameter for the query
        const result = await pool.query(query, [fullDepartmentName]);
        res.status(200).json(result.rows);  // Return the list of projects for the department
    } catch (error) {
        console.error('Error retrieving projects by department:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});


module.exports = router;
