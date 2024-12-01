const express = require('express');
const pool = require('../db'); // Database connection

const router = express.Router();

// GET - Fetch all projects without any search conditions, with total count and pagination
router.get('/allprojs', async (req, res) => {
    const { page = 1, itemsPerPage = 5, query = '', categories = [], researchAreas = [], topics = [] } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(itemsPerPage);

    let searchQuery = `
    SELECT p.*, 
           STRING_AGG(DISTINCT a.name, ', ') AS authors, 
           STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
    FROM projects p
    LEFT JOIN project_authors pa ON p.project_id = pa.project_id 
    LEFT JOIN authors a ON pa.author_id = a.author_id 
    LEFT JOIN project_keywords pk ON p.project_id = pk.project_id 
    LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN research_areas r ON p.research_area_id = r.research_area_id
    LEFT JOIN topics t ON p.topic_id = t.topic_id
    WHERE 1=1
    `;

    let countQuery = `
        SELECT COUNT(DISTINCT p.project_id) AS total_count
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN research_areas r ON p.research_area_id = r.research_area_id
        LEFT JOIN topics t ON p.topic_id = t.topic_id
        WHERE 1=1
    `;

    const queryParams = [];
    const categoriesParams = [];
    const researchAreasParams = [];
    const topicsParams = [];

    // Handle text search
    if (query) {
        queryParams.push(`%${query}%`);
        searchQuery += ` AND (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length})`;
        countQuery += ` AND (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length})`;
    }

    // Handle category filtering
    if (categories.length > 0) {
        categories.forEach((category, index) => {
            categoriesParams.push(`$${queryParams.length + index + 1}`);
            queryParams.push(category);
        });
        searchQuery += ` AND p.category_id IN (${categoriesParams.join(', ')})`;
        countQuery += ` AND p.category_id IN (${categoriesParams.join(', ')})`;
    }

    // Handle research area filtering
    if (researchAreas.length > 0) {
        researchAreas.forEach((area, index) => {
            researchAreasParams.push(`$${queryParams.length + index + 1}`);
            queryParams.push(area);
        });
        searchQuery += ` AND p.research_area_id IN (${researchAreasParams.join(', ')})`;
        countQuery += ` AND p.research_area_id IN (${researchAreasParams.join(', ')})`;
    }

// Handle topic filtering
if (researchAreas.length > 0 && topics.length === 0) {
    // Add topics dynamically for selected research areas
    const associatedTopics = await getTopicsForResearchAreas(researchAreas);
    topics.push(...associatedTopics);  // Add the associated topics for the research areas
}

if (topics.length > 0) {
    topics.forEach((topic, index) => {
        topicsParams.push(`$${queryParams.length + index + 1}`);
        queryParams.push(topic);
    });
    searchQuery += ` AND p.topic_id IN (${topicsParams.join(', ')})`;
    countQuery += ` AND p.topic_id IN (${topicsParams.join(', ')})`;
}


    // Pagination
    searchQuery += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    const finalParams = [...queryParams, itemsPerPage, offset];

    try {
        const countResult = await pool.query(countQuery, queryParams);
        const result = await pool.query(searchQuery, finalParams);

        res.status(200).json({
            totalCount: parseInt(countResult.rows[0].total_count, 10),
            data: result.rows,
        });
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects', details: error.message });
    }
});




// GET - Search projects by title, author, keywords, and abstract
router.get('/allfields', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query;
    const offset = (page - 1) * itemsPerPage;

    // Default to empty string or wildcard if query is empty
    const searchQuery = query.trim() === '' ? '%' : `%${query}%`;

const sqlQuery = `
    SELECT p.*, 
           STRING_AGG(DISTINCT a.name, ', ') AS authors, 
           STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
    FROM projects p
    LEFT JOIN project_authors pa ON p.project_id = pa.project_id
    LEFT JOIN authors a ON pa.author_id = a.author_id
    LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
    LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
    WHERE ${condition}
    GROUP BY p.project_id
    ORDER BY p.publication_date DESC
    LIMIT $2 OFFSET $3
`;

const countQuery = `
    SELECT COUNT(DISTINCT p.project_id) AS total_count
    FROM projects p
    LEFT JOIN project_authors pa ON p.project_id = pa.project_id
    LEFT JOIN authors a ON pa.author_id = a.author_id
    LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
    LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
    WHERE ${condition}
`;


    try {
        const countResult = await pool.query(countQuery, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        const result = await pool.query(sqlQuery, [searchQuery, itemsPerPage, offset]);

        res.status(200).json({
            totalCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Error searching projects across all fields:', error);
        res.status(500).json({ error: 'Failed to search projects across all fields' });
    }
});


// GET - Search projects by title with pagination and total count
router.get('/search/title', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query; // Pagination params

    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(k.keyword, ', ') AS keywords,
               STRING_AGG(DISTINCT a.name, ', ') AS authors
        FROM projects p
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        WHERE LOWER(p.title) LIKE LOWER($1)
        GROUP BY p.project_id
        ORDER BY p.publication_date DESC
        LIMIT $2 OFFSET $3
    `;

    const countQuery = `
        SELECT COUNT(*) 
        FROM projects p
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        WHERE LOWER(p.title) LIKE LOWER($1)
    `;

    try {
        const result = await pool.query(searchQuery, [`%${query}%`, itemsPerPage, offset]);
        const countResult = await pool.query(countQuery, [`%${query}%`]);

        res.status(200).json({
            data: result.rows,
            totalCount: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error searching projects by title:', error);
        res.status(500).json({ error: 'Failed to search projects by title' });
    }
});


// GET - Search projects by author with pagination and total count
router.get('/search/author', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query; // Pagination params

    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        WHERE LOWER(a.name) LIKE LOWER($1)
        GROUP BY p.project_id
        ORDER BY p.publication_date DESC
        LIMIT $2 OFFSET $3
    `;

    const countQuery = `
        SELECT COUNT(DISTINCT p.project_id) 
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        WHERE LOWER(a.name) LIKE LOWER($1)
    `;

    try {
        const result = await pool.query(searchQuery, [`%${query}%`, itemsPerPage, offset]);
        const countResult = await pool.query(countQuery, [`%${query}%`]);

        res.status(200).json({
            data: result.rows,
            totalCount: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error searching projects by author:', error);
        res.status(500).json({ error: 'Failed to search projects by author' });
    }
});


// GET - Search projects by keywords with pagination and total count
router.get('/search/keywords', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query; // Pagination params

    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    const searchQuery = `
SELECT p.*, 
       STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
       STRING_AGG(DISTINCT a.name, ', ') AS authors -- Join authors here
FROM projects p
LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
LEFT JOIN project_authors pa ON p.project_id = pa.project_id -- Assuming a join to an authors table
LEFT JOIN authors a ON pa.author_id = a.author_id
WHERE LOWER(k.keyword) LIKE LOWER($1)
GROUP BY p.project_id
ORDER BY p.publication_date DESC
LIMIT $2 OFFSET $3

    `;

    const countQuery = `
        SELECT COUNT(DISTINCT p.project_id) 
        FROM projects p
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        WHERE LOWER(k.keyword) LIKE LOWER($1)
    `;

    try {
        const result = await pool.query(searchQuery, [`%${query}%`, itemsPerPage, offset]);
        const countResult = await pool.query(countQuery, [`%${query}%`]);

        res.status(200).json({
            data: result.rows,
            totalCount: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error searching projects by keywords:', error);
        res.status(500).json({ error: 'Failed to search projects by keywords' });
    }
});


router.get('/search/abstract', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query; // Pagination params

    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    const searchQuery = `
        SELECT p.*, 
               STRING_AGG(k.keyword, ', ') AS keywords,
               STRING_AGG(DISTINCT a.name, ', ') AS authors
        FROM projects p
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        WHERE LOWER(p.abstract) LIKE LOWER($1)
        GROUP BY p.project_id
        ORDER BY p.publication_date DESC
        LIMIT $2 OFFSET $3
    `;

    const countQuery = `
        SELECT COUNT(*) 
        FROM projects p
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        WHERE LOWER(p.abstract) LIKE LOWER($1)
    `;

    try {
        const result = await pool.query(searchQuery, [`%${query}%`, itemsPerPage, offset]);
        const countResult = await pool.query(countQuery, [`%${query}%`]);

        res.status(200).json({
            data: result.rows,
            totalCount: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error searching projects by abstract:', error);
        res.status(500).json({ error: 'Failed to search projects by abstract' });
    }
});


module.exports = router;
