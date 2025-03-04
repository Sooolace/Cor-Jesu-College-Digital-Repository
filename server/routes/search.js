const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();
const logActivity = require('../middlewares/logActivity'); // Import log activity middleware


// GET - Fetch all projects without any search conditions, with total count and pagination
router.get('/allprojs', async (req, res, next) => {
    const { page = 1, itemsPerPage = 5, query = '', categories = [], researchAreas = [], topics = [], authors = [], fromYear, toYear } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(itemsPerPage);

    let searchQuery = `SELECT p.*, 
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
                       WHERE 1=1 AND p.is_archived = false`;

    let countQuery = `SELECT COUNT(DISTINCT p.project_id) AS total_count
                      FROM projects p
                      LEFT JOIN project_authors pa ON p.project_id = pa.project_id
                      LEFT JOIN authors a ON pa.author_id = a.author_id
                      LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
                      LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
                      LEFT JOIN categories c ON p.category_id = c.category_id
                      LEFT JOIN research_areas r ON p.research_area_id = r.research_area_id
                      LEFT JOIN topics t ON p.topic_id = t.topic_id
                      WHERE 1=1 AND p.is_archived = false`;

    const queryParams = [];
    const categoriesParams = [];
    const researchAreasParams = [];
    const topicsParams = [];
    const authorsParams = [];

    // Handle text search
    if (query) {
        queryParams.push(`%${query}%`);
        searchQuery += ` AND (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length})`;
        countQuery += ` AND (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length})`;
    }

    if (categories.length > 0) {
        categories.forEach((category, index) => {
            queryParams.push(category);
            categoriesParams.push(`$${queryParams.length}`);
        });
        searchQuery += ` AND p.category_id IN (${categoriesParams.join(', ')})`;
        countQuery += ` AND p.category_id IN (${categoriesParams.join(', ')})`;
    }

    if (researchAreas.length > 0) {
        researchAreas.forEach((area, index) => {
            queryParams.push(area);
            researchAreasParams.push(`$${queryParams.length}`);
        });
        searchQuery += ` AND p.research_area_id IN (${researchAreasParams.join(', ')})`;
        countQuery += ` AND p.research_area_id IN (${researchAreasParams.join(', ')})`;
    }

    if (topics.length > 0) {
        topics.forEach((topic, index) => {
            queryParams.push(topic);
            topicsParams.push(`$${queryParams.length}`);
        });
        searchQuery += ` AND p.topic_id IN (${topicsParams.join(', ')})`;
        countQuery += ` AND p.topic_id IN (${topicsParams.join(', ')})`;
    }

    if (authors.length > 0) {
        authors.forEach((author, index) => {
            queryParams.push(author);
            authorsParams.push(`$${queryParams.length}`);
        });
        searchQuery += ` AND a.author_id IN (${authorsParams.join(', ')})`;
        countQuery += ` AND a.author_id IN (${authorsParams.join(', ')})`;
    }

    if (fromYear) {
        queryParams.push(fromYear);
        searchQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        countQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
    }

    if (toYear) {
        queryParams.push(toYear);
        searchQuery += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
        countQuery += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
    }

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

// GET - Search projects across all fields (title, abstract, authors, keywords) with pagination and total count
router.get('/allfields', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query;
    const offset = (page - 1) * itemsPerPage;

    const searchQuery = query.trim() === '' ? '%' : `%${query}%`;  // Handle empty query

    const sqlQuery = `
        SELECT p.*, 
               STRING_AGG(DISTINCT a.name, ', ') AS authors, 
               STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        WHERE (p.title ILIKE $1 OR p.abstract ILIKE $1 OR a.name ILIKE $1 OR k.keyword ILIKE $1)
        AND p.is_archived = false
        GROUP BY p.project_id
        ORDER BY p.publication_date DESC
        LIMIT $2 OFFSET $3;
    `;

    const countQuery = `
        SELECT COUNT(DISTINCT p.project_id) AS total_count
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        WHERE (p.title ILIKE $1 OR p.abstract ILIKE $1 OR a.name ILIKE $1 OR k.keyword ILIKE $1)
        AND p.is_archived = false;
    `;

    try {
        // Run the COUNT query to get the total count of matching projects
        const countResult = await pool.query(countQuery, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the matching projects
        const result = await pool.query(sqlQuery, [searchQuery, itemsPerPage, offset]);

        // Log the activity (User searched across all fields)
        req.activity = 'User searched across all fields';
        
        // Capture the search query as additional info
        req.additionalInfo = JSON.stringify({ searchQuery: query });

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json({
                totalCount,
                data: result.rows
            });
        });

    } catch (error) {
        console.error('Error searching projects across all fields:', error);
        res.status(500).json({ error: 'Failed to search projects across all fields' });
    }
});

// GET - Search projects by title
router.get('/search/title', async (req, res, next) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query;
    const offset = (page - 1) * itemsPerPage;

    try {
        const searchQuery = `%${query}%`;  // Prepare the search query

        const searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.title) LIKE LOWER($1) AND p.is_archived = false
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC
            LIMIT $2 OFFSET $3;
        `;

        const countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.title) LIKE LOWER($1) AND p.is_archived = false;
        `;

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search title
        const result = await pool.query(searchQuerySQL, [searchQuery, itemsPerPage, offset]);

        // Log the activity (User searched by title)
        req.activity = 'User searched by title';
        
        // Capture the search query as additional info
        req.additionalInfo = JSON.stringify({ searchQuery: query });

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json({
                totalCount,
                data: result.rows
            });
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

    try {
        const searchQuery = `%${query}%`;  // Prepare the search query

        const searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT a.name, ', ') AS authors, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
            FROM projects p
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            WHERE LOWER(a.name) LIKE LOWER($1) AND p.is_archived = false
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC
            LIMIT $2 OFFSET $3;
        `;

        const countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(a.name) LIKE LOWER($1) AND p.is_archived = false;
        `;

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search author
        const result = await pool.query(searchQuerySQL, [searchQuery, itemsPerPage, offset]);

        // Log the activity (User searched by author)
        req.activity = 'User searched by author';
        
        // Capture the search query as additional info
        req.additionalInfo = JSON.stringify({ searchQuery: query });

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json({
                totalCount,
                data: result.rows
            });
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

    try {
        const searchQuery = `%${query}%`;  // Prepare the search query

        const searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(k.keyword) LIKE LOWER($1) AND p.is_archived = false
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC
            LIMIT $2 OFFSET $3;
        `;

        const countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            WHERE LOWER(k.keyword) LIKE LOWER($1) AND p.is_archived = false;
        `;

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search keyword
        const result = await pool.query(searchQuerySQL, [searchQuery, itemsPerPage, offset]);

        // Log the activity (User searched by keywords)
        req.activity = 'User searched by keywords';
        
        // Capture the search query as additional info
        req.additionalInfo = JSON.stringify({ searchQuery: query });

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json({
                totalCount,
                data: result.rows
            });
        });

    } catch (error) {
        console.error('Error searching projects by keywords:', error);
        res.status(500).json({ error: 'Failed to search projects by keywords' });
    }
});


// GET - Search projects by abstract with pagination and total count
// GET - Advanced search with AND/OR operators
router.get('/advanced', async (req, res) => {
  const { page = 1, itemsPerPage = 5, searchFields = [], dateRange = {} } = req.query;
  const offset = (page - 1) * itemsPerPage;

  try {
    let searchQuery = `
      SELECT p.*, 
             STRING_AGG(DISTINCT a.name, ', ') AS authors, 
             STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
      FROM projects p
      LEFT JOIN project_authors pa ON p.project_id = pa.project_id
      LEFT JOIN authors a ON pa.author_id = a.author_id
      LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
      LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
      WHERE p.is_archived = false
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT p.project_id) AS total_count
      FROM projects p
      LEFT JOIN project_authors pa ON p.project_id = pa.project_id
      LEFT JOIN authors a ON pa.author_id = a.author_id
      LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
      LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
      WHERE p.is_archived = false
    `;

    const queryParams = [];
    let conditions = [];

    // Process each search field
    searchFields.forEach((field, index) => {
      if (field.value.trim()) {
        queryParams.push(`%${field.value}%`);
        let condition = '';
        
        switch (field.field) {
          case 'title':
            condition = `p.title ILIKE $${queryParams.length}`;
            break;
          case 'author':
            condition = `a.name ILIKE $${queryParams.length}`;
            break;
          case 'keywords':
            condition = `k.keyword ILIKE $${queryParams.length}`;
            break;
          case 'abstract':
            condition = `p.abstract ILIKE $${queryParams.length}`;
            break;
          case 'category':
            condition = `c.name ILIKE $${queryParams.length}`;
            break;
        }

        if (index === 0) {
          conditions.push(condition);
        } else {
          conditions.push(`${field.operator} ${condition}`);
        }
      }
    });

    // Add date range conditions if provided
    if (dateRange.startDate) {
      queryParams.push(dateRange.startDate);
      conditions.push(`AND p.publication_date >= $${queryParams.length}`);
    }
    if (dateRange.endDate) {
      queryParams.push(dateRange.endDate);
      conditions.push(`AND p.publication_date <= $${queryParams.length}`);
    }

    // Add conditions to queries
    if (conditions.length > 0) {
      const whereClause = ` AND (${conditions.join(' ')})`;
      searchQuery += whereClause;
      countQuery += whereClause;
    }

    // Add group by, order by, limit and offset
    searchQuery += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    // Add limit and offset params
    queryParams.push(itemsPerPage, offset);

    // Execute queries
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const result = await pool.query(searchQuery, queryParams);

    // Log the activity
    req.activity = 'User performed advanced search';
    req.additionalInfo = JSON.stringify({ searchFields, dateRange });
    req.user = req.user || { id: 0, role: 'normal' };

    logActivity(req, res, () => {
      res.status(200).json({
        totalCount: parseInt(countResult.rows[0].total_count, 10),
        data: result.rows
      });
    });

  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({ error: 'Failed to perform advanced search', details: error.message });
  }
});

router.get('/search/abstract', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5 } = req.query; // Pagination params
    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    try {
        const searchQuery = `%${query}%`;  // Prepare the search query

        const searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.abstract) LIKE LOWER($1) AND p.is_archived = false
            GROUP BY p.project_id
            ORDER BY p.publication_date DESC
            LIMIT $2 OFFSET $3;
        `;

        const countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.abstract) LIKE LOWER($1) AND p.is_archived = false;
        `;

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, [searchQuery]);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search abstract
        const result = await pool.query(searchQuerySQL, [searchQuery, itemsPerPage, offset]);

        // Log the activity (User searched by abstract)
        req.activity = 'User searched by abstract';
        
        // Capture the search query as additional info
        req.additionalInfo = JSON.stringify({ searchQuery: query });

        // Ensure req.user is set for logging
        req.user = req.user || { id: 0, role: 'normal' };

        // Proceed with the logActivity middleware
        logActivity(req, res, () => {
            // Send response after logging the activity
            res.status(200).json({
                totalCount,
                data: result.rows
            });
        });

    } catch (error) {
        console.error('Error searching projects by abstract:', error);
        res.status(500).json({ error: 'Failed to search projects by abstract' });
    }
});





module.exports = router;