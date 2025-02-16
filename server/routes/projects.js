const express = require('express');
const pool = require('../db'); // Database connection
const NodeCache = require('node-cache'); // In-memory cache
const logActivity = require('../middlewares/logActivity'); // Import log activity middleware

const router = express.Router();

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

// POST - Add a new project
router.post('/upload', async (req, res) => { 
    const { title, description_type, abstract, publication_date, study_urls, category_id, authors, keywords } = req.body;

    // Ensure required fields are present
    if (!title || !abstract || !publication_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const studyUrlString = parseStudyUrl(study_urls); // Parse study URL if provided

        // Insert project into the database
        const query = `
            INSERT INTO projects (title, description_type, abstract, publication_date, study_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [title, description_type, abstract, publication_date, studyUrlString]);

        const projectId = result.rows[0].project_id;

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

        // Respond with the newly created project
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding project:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// GET - Fetch all projects (excluding archived projects) without cache
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
        WHERE p.is_archived = false
        GROUP BY p.project_id 
        ORDER BY p.publication_date DESC;
    `;

    try {
        // Execute the query to retrieve all projects
        const result = await pool.query(searchQuery);

        // Log the activity (User fetched all projects)
        req.activity = 'User fetched all projects';

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json(result.rows);
        });

    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});

// GET - Fetch all project by recent
router.get('/projects/recent', async (req, res) => {
    const cachedProjects = cache.get('allProjectsCache');
    if (cachedProjects) {
        console.log('Serving from cache');
        return res.status(200).json(cachedProjects);
    }

    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
        LEFT JOIN authors a ON pa.author_id = a.author_id 
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
        WHERE p.is_archived = false
        GROUP BY p.project_id 
        ORDER BY p.publication_date DESC;
    `;

    try {
        const result = await pool.query(searchQuery);

        cache.set('allProjectsCache', result.rows);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});

// GET - Fetch most-viewed projects (excluding archived projects) without cache
router.get('/mostviewed', async (req, res) => {
    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
        LEFT JOIN authors a ON pa.author_id = a.author_id 
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
        WHERE p.is_archived = false
        GROUP BY p.project_id 
        ORDER BY p.view_count DESC;
    `;

    try {
        // Execute the query to retrieve most-viewed projects
        const result = await pool.query(searchQuery);

        // Return the fetched data without caching
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving most-viewed projects:', error);
        res.status(500).json({ error: 'Failed to retrieve most-viewed projects' });
    }
});

//GET ARCHIVED PROJECTS
router.get('/archived-projects', async (req, res) => {
    try {
        const query = `
SELECT 
    p.project_id, 
    p.title, 
    p.publication_date, 
    STRING_AGG(a.name, ', ') AS authors
FROM 
    projects p
LEFT JOIN 
    project_authors pa
ON 
    p.project_id = pa.project_id
LEFT JOIN 
    authors a
ON 
    pa.author_id = a.author_id
WHERE 
    p.is_archived = true
GROUP BY 
    p.project_id;

        `;
        const result = await pool.query(query);

        console.log('Fetched archived projects with authors:', result.rows);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: 'No archived projects found' });
        }
    } catch (error) {
        console.error('Internal server error while fetching archived projects:', error.message);
        res.status(500).json({ error: 'Failed to fetch archived projects' });
    }
});

// GET - Fetch a single project by project_id
router.get('/:project_id', async (req, res, next) => {
    const { project_id } = req.params;
    
    try {
        // Fetch the project data from the database
        const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [project_id]);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get the project's title for the additional info in logging
        const project = result.rows[0];

        // Set activity and additional info for logging before proceeding with the request
        req.activity = 'User viewed project';  // Activity description
        req.additionalInfo = JSON.stringify({ projectTitle: project.title });  // Additional info with project title

        // Proceed to the logging middleware and then send the response
        return logActivity(req, res, () => {
            res.status(200).json(project);  // Send the project data as a response
        });

    } catch (error) {
        console.error('Error retrieving project:', error);
        res.status(500).json({ error: 'Failed to retrieve project' });
    }
});
// PUT - Archive project by project_id
router.put('/:project_id/archive', async (req, res) => {
    const { project_id } = req.params;

    try {
        const query = 'UPDATE projects SET is_archived = true WHERE project_id = $1 RETURNING *';
        const result = await pool.query(query, [project_id]);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Project not found or already archived' });
        }

        // Clear the cache after archiving a project
        cache.del('allProjectsCache');

        res.status(200).json({ message: `Project with ID ${project_id} has been archived`, project: result.rows[0] });
    } catch (error) {
        console.error('Error archiving project:', error);
        res.status(500).json({ error: 'Failed to archive project' });
    }
});

// PUT - Unarchive project by project_id
router.put('/:project_id/unarchive', async (req, res) => {
    const { project_id } = req.params;

    try {
        if (!project_id) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const query = 'UPDATE projects SET is_archived = false WHERE project_id = $1 RETURNING *';
        const result = await pool.query(query, [project_id]);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Project not found or already active' });
        }

        // Invalidate cache to reflect updates
        cache.del('allProjectsCache');

        res.status(200).json({
            message: `Project with ID ${project_id} has been unarchived`,
            project: result.rows[0]
        });
    } catch (error) {
        console.error('Error unarchiving project:', error.stack);
        res.status(500).json({ error: 'Failed to unarchive project' });
    }
});

// PUT - Update project by project_id
router.put('/:project_id', async (req, res) => {
    const { project_id } = req.params;
    const {
        title,
        publication_date,
        keywords,
        abstract,
        study_url, // Assume it's always a single URL
        category_id,
        research_area_id,
        topic_id,
        research_type_id
    } = req.body;

    try {
        const studyUrlString = study_url;

        const query = `
            UPDATE projects 
            SET title = $1, publication_date = $2, abstract = $3, 
                study_url = $4, category_id = $5, research_area_id = $6, 
                topic_id = $7, research_type_id = $8
            WHERE project_id = $9 
            RETURNING *
        `;
        const params = [
            title, publication_date, abstract, studyUrlString,
            category_id, research_area_id, topic_id, research_type_id, project_id
        ];
        const result = await pool.query(query, params);

        if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json(result.rows[0]);

        // Clear the cache after updating a project
        cache.del('allProjectsCache');
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

// GET - Fetch all projects (excluding archived projects)
router.get('/', async (req, res) => {
    const cachedProjects = cache.get('allProjectsCache');
    if (cachedProjects) {
        console.log('Serving from cache');
        return res.status(200).json(cachedProjects);
    }

    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
        LEFT JOIN authors a ON pa.author_id = a.author_id 
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
        WHERE p.is_archived = false
        GROUP BY p.project_id 
        ORDER BY p.publication_date DESC;
    `;

    try {
        const result = await pool.query(searchQuery);

        cache.set('allProjectsCache', result.rows);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});

router.get('/most_viewed', async (req, res) => {
    const query = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
        LEFT JOIN authors a ON pa.author_id = a.author_id 
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
        WHERE p.is_archived = false
        GROUP BY p.project_id 
        ORDER BY p.view_count DESC
        LIMIT 10;
    `;

    try {
        const result = await pool.query(query);
        res.json(result.rows); // Send the rows as JSON response
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE - Delete project by project_id
router.delete('/:project_id', async (req, res) => {
    const { project_id } = req.params;

    try {
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

        // Clear cache after deleting a project
        cache.del('allProjectsCache');
        cache.del('topViewedCache');

        res.status(200).json({ message: `Project with ID ${project_id} and its related data have been deleted` });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// GET - Fetch projects by department name
router.get('/departments/:departmentName', async (req, res) => {
    const { departmentName } = req.params;  

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

    if (!fullDepartmentName) {
        return res.status(404).json({ error: 'Department not found' });
    }

    try {
        // Query the database for projects related to this department and not archived
        const query = `
            SELECT p.*, STRING_AGG(a.name, ', ') AS authors
            FROM projects p
            JOIN projects_category pc ON p.project_id = pc.project_id
            JOIN categories c ON pc.category_id = c.category_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE c.name = $1 AND p.is_archived = false
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC;
        `;
        
        const result = await pool.query(query, [fullDepartmentName]);

        // Log the activity (User fetched projects for the department)
        req.activity = `User fetched projects for ${fullDepartmentName}`;

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json(result.rows);
        });

    } catch (error) {
        console.error('Error retrieving projects by department:', error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});

// GET - Fetch all projects (excluding archived projects) with featured projects at the top
router.get('/projects/featured-proj', async (req, res) => {
    try {
        const searchQuery = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT a.name, ', ') AS authors, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
            FROM projects p
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
            LEFT JOIN authors a ON pa.author_id = a.author_id 
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
            WHERE p.is_archived = false
            GROUP BY p.project_id 
            ORDER BY p.is_featured DESC, p.publication_date DESC;
        `;

        console.log('Executing query to retrieve featured projects');

        const result = await pool.query(searchQuery);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
});

// GET - Fetch all featured projects (excluding archived projects) with featured projects at the top
router.get('/projects/active-featured', async (req, res) => {
    try {
        const searchQuery = `
        SELECT p.*, 
               p.abstract, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
        LEFT JOIN authors a ON pa.author_id = a.author_id 
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
        WHERE p.is_archived = false AND p.is_featured = true
        GROUP BY p.project_id 
        ORDER BY p.publication_date DESC;
      `;
          

        console.log('Executing query to retrieve featured projects');

        const result = await pool.query(searchQuery);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve featured projects' });
    }
});

// PUT - Toggle featured status of a project
router.put('/:projectId/toggle-featured', async (req, res) => {
    const { projectId } = req.params;
    const { is_featured } = req.body;

    if (typeof is_featured !== 'boolean') {
        return res.status(400).json({ error: 'Invalid value for is_featured. Must be a boolean.' });
    }

    try {
        if (is_featured) {
            // Check if there are already 4 featured projects
            const countQuery = 'SELECT COUNT(*) FROM projects WHERE is_featured = TRUE';
            const countResult = await pool.query(countQuery);
            const featuredCount = parseInt(countResult.rows[0].count, 10);

            if (featuredCount >= 4) {
                return res.status(400).json({ error: 'Maximum of 4 featured projects allowed. Unfeature another project first.' });
            }
        }

        // Proceed to update the project's featured status
        const updateQuery = `
            UPDATE projects
            SET is_featured = $1
            WHERE project_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [is_featured, projectId]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error updating featured status:', error);
        res.status(500).json({ error: 'Failed to update featured status' });
    }
});

module.exports = router;
