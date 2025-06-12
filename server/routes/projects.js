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

// Helper function to get client IP address
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket?.remoteAddress;
};

// POST - Start tracking a view for a project
router.post('/startview/:project_id', async (req, res) => {
    const { project_id } = req.params;
    const userId = req.user?.id || null;
    const sessionId = req.session?.id || req.headers['x-session-id'] || req.cookies?.sessionId || Math.random().toString(36).substring(2);
    const ipAddress = getClientIp(req);
    
    try {
        // 1. Check for rate limiting (prevents spam views)
        // If there are too many view attempts from the same IP in the last minute, block it
        const rateLimitQuery = `
            SELECT COUNT(*) as recent_views
            FROM project_views
            WHERE ip_address = $1
              AND view_timestamp > NOW() - INTERVAL '1 minute'
        `;
        const rateLimitResult = await pool.query(rateLimitQuery, [ipAddress]);
        const recentViewCount = parseInt(rateLimitResult.rows[0].recent_views);
        
        // If more than 5 view attempts in the last minute, apply rate limiting
        if (recentViewCount > 5) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many view requests. Please try again later.'
            });
        }
        
        // 2. Check for existing valid view in the current day
        // YouTube-like approach: count only one valid view per user/IP per day per video
        const todayViewQuery = `
            SELECT view_id
            FROM project_views
            WHERE project_id = $1
              AND (
                  (user_id IS NOT NULL AND user_id = $2) OR
                  (session_id = $3) OR
                  (ip_address = $4 AND user_id IS NULL)
              )
              AND is_valid = TRUE
              AND view_timestamp > NOW() - INTERVAL '1 day'
        `;
        const todayViewResult = await pool.query(todayViewQuery, [project_id, userId, sessionId, ipAddress]);
        
        // If there's already a valid view today from this user/session/IP
        if (todayViewResult.rows.length > 0) {
            return res.status(200).json({
                view_id: todayViewResult.rows[0].view_id,
                message: 'Already counted a view for this project today',
                alreadyCounted: true
            });
        }
        
        // 3. Check for an existing incomplete view session (view started but not completed)
        // This prevents multiple view records for the same viewing session
        const activeViewQuery = `
            SELECT view_id
            FROM project_views
            WHERE project_id = $1
              AND (
                  (user_id IS NOT NULL AND user_id = $2) OR
                  (session_id = $3) OR
                  (ip_address = $4 AND user_id IS NULL)
              )
              AND is_valid = FALSE
              AND view_timestamp > NOW() - INTERVAL '15 minutes'
        `;
        const activeViewResult = await pool.query(activeViewQuery, [project_id, userId, sessionId, ipAddress]);
        
        if (activeViewResult.rows.length > 0) {
            // Return the existing view ID for the active session
            return res.status(200).json({
                view_id: activeViewResult.rows[0].view_id,
                message: 'Continuing existing view session'
            });
        }
        
        // 4. Start a new view tracking session
        const query = `
            INSERT INTO project_views (project_id, user_id, session_id, ip_address, is_valid)
            VALUES ($1, $2, $3, $4, FALSE)
            RETURNING view_id
        `;
        const result = await pool.query(query, [project_id, userId, sessionId, ipAddress]);
        
        // Return the view_id to the client
        res.status(201).json({ 
            view_id: result.rows[0].view_id,
            message: 'View tracking started'
        });
    } catch (error) {
        console.error('Error starting view tracking:', error);
        res.status(500).json({ error: 'Failed to start view tracking' });
    }
});

// POST - Complete a view (after 10+ seconds of viewing)
router.post('/completeview/:view_id', async (req, res) => {
    const { view_id } = req.params;
    const { duration } = req.body; // Duration in seconds
    
    if (!duration || duration < 10) {
        return res.status(400).json({ 
            error: 'Invalid view duration', 
            message: 'View must be at least 10 seconds to count' 
        });
    }
    
    try {
        // First, check if this view has already been marked as valid
        const checkViewQuery = `
            SELECT is_valid, project_id 
            FROM project_views 
            WHERE view_id = $1
        `;
        const checkResult = await pool.query(checkViewQuery, [view_id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'View record not found' });
        }
        
        // If view is already valid, don't count it again
        if (checkResult.rows[0].is_valid) {
            return res.status(200).json({ 
                success: true, 
                message: 'View already counted previously',
                alreadyCounted: true
            });
        }
        
        const projectId = checkResult.rows[0].project_id;
        
        // Update the view as valid and record the duration
        const updateViewQuery = `
            UPDATE project_views 
            SET is_valid = TRUE, view_duration = $1
            WHERE view_id = $2
            RETURNING project_id
        `;
        await pool.query(updateViewQuery, [duration, view_id]);
        
        // Increment the view_count in the projects table
        const updateProjectQuery = `
            UPDATE projects
            SET view_count = view_count + 1
            WHERE project_id = $1
        `;
        await pool.query(updateProjectQuery, [projectId]);
        
        // Clear the cache after updating the view count
        cache.del('allProjectsCache');
        cache.del('topViewedCache');
        
        res.status(200).json({ 
            success: true, 
            message: 'View completed and counted successfully' 
        });
    } catch (error) {
        console.error('Error completing view:', error);
        res.status(500).json({ error: 'Failed to complete view' });
    }
});

// GET - Get project view statistics
router.get('/viewstats/:project_id', async (req, res) => {
    const { project_id } = req.params;
    
    try {
        // Get total valid views for the project
        const viewsQuery = `
            SELECT COUNT(*) as total_views
            FROM project_views
            WHERE project_id = $1 AND is_valid = TRUE
        `;
        const viewsResult = await pool.query(viewsQuery, [project_id]);
        
        // Get daily view counts for the last 30 days
        const dailyViewsQuery = `
            SELECT 
                DATE_TRUNC('day', view_timestamp) as view_date,
                COUNT(*) as count
            FROM project_views
            WHERE project_id = $1 
              AND is_valid = TRUE
              AND view_timestamp > NOW() - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', view_timestamp)
            ORDER BY view_date DESC
        `;
        const dailyViewsResult = await pool.query(dailyViewsQuery, [project_id]);
        
        res.status(200).json({
            total_views: parseInt(viewsResult.rows[0].total_views),
            daily_views: dailyViewsResult.rows
        });
    } catch (error) {
        console.error('Error fetching view statistics:', error);
        res.status(500).json({ error: 'Failed to fetch view statistics' });
    }
});

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
        ORDER BY p.view_count DESC
        LIMIT 10;
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

        res.json(result.rows);
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
        research_type_id,
        authors // Add authors to the request body
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

        // Update authors
        if (authors && Array.isArray(authors) && authors.length > 0) {
            // Delete existing authors
            await pool.query('DELETE FROM project_authors WHERE project_id = $1', [project_id]);

            // Insert new authors
            const insertProjectAuthorsQuery = `
                INSERT INTO project_authors (project_id, author_id) 
                VALUES ($1, (SELECT author_id FROM authors WHERE name = $2))
            `;
            const projectAuthorInsertPromises = authors.map((authorName) => 
                pool.query(insertProjectAuthorsQuery, [project_id, authorName])
            );
            await Promise.all(projectAuthorInsertPromises);
        }

        // Update keywords
        if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            // Delete existing keywords
            await pool.query('DELETE FROM project_keywords WHERE project_id = $1', [project_id]);

            // Insert new keywords
            const insertProjectKeywordsQuery = `
                INSERT INTO project_keywords (project_id, keyword_id) 
                VALUES ($1, (SELECT keyword_id FROM keywords WHERE keyword = $2))
            `;
            const projectKeywordInsertPromises = keywords.map((keywordName) => 
                pool.query(insertProjectKeywordsQuery, [project_id, keywordName])
            );
            await Promise.all(projectKeywordInsertPromises);
        }

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

// GET - Fetch projects by category (excluding archived projects) with featured projects at the top
router.get('/departments/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const searchQuery = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT a.name, ', ') AS authors, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
            FROM projects p
            JOIN projects_category pc ON p.project_id = pc.project_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
            LEFT JOIN authors a ON pa.author_id = a.author_id 
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id 
            WHERE pc.category_id = $1 AND p.is_archived = false
            GROUP BY p.project_id 
            ORDER BY p.publication_date DESC;
        `;

        const result = await pool.query(searchQuery, [categoryId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No projects found for this category' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching projects by category', error.stack);
        res.status(500).json({ error: 'Server error' });
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
