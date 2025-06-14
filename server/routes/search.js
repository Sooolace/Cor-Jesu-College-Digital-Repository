const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();
const logActivity = require('../middlewares/logActivity'); // Import log activity middleware

// Apply logActivity middleware to all search routes
router.use(logActivity);

// GET - Fetch all projects without any search conditions, with total count and pagination
router.get('/allprojs', async (req, res, next) => {
    const { page = 1, itemsPerPage = 5, query = '', categories = [], researchAreas = [], topics = [], authors = [], fromYear, toYear, advancedSearchInputs = [], yearRange = [] } = req.query;
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
    if (query.trim() !== '') {
        queryParams.push(`%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`);
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

    // Handle advanced search inputs
    if (advancedSearchInputs.length > 0) {
        advancedSearchInputs.forEach((input, index) => {
            const { query, option, condition } = input;
            const searchCondition = condition === 'AND' ? 'AND' : 'OR';
            queryParams.push(`%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`);
            if (option === 'allfields') {
                searchQuery += ` ${searchCondition} (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length} OR p.abstract ILIKE $${queryParams.length})`;
                countQuery += ` ${searchCondition} (p.title ILIKE $${queryParams.length} OR a.name ILIKE $${queryParams.length} OR k.keyword ILIKE $${queryParams.length} OR p.abstract ILIKE $${queryParams.length})`;
            } else {
                searchQuery += ` ${searchCondition} p.${option} ILIKE $${queryParams.length}`;
                countQuery += ` ${searchCondition} p.${option} ILIKE $${queryParams.length}`;
            }
        });
    }

    // Handle year range filter
    if (yearRange.length === 2) {
        queryParams.push(yearRange[0]);
        searchQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        countQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        
        queryParams.push(yearRange[1]);
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
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query;
    const offset = (page - 1) * itemsPerPage;

    const searchQuery = query.trim() === '' ? '%' : `%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`;  // Handle empty query

    let sqlQuery = `
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
    `;

    let countQuery = `
        SELECT COUNT(DISTINCT p.project_id) AS total_count
        FROM projects p
        LEFT JOIN project_authors pa ON p.project_id = pa.project_id
        LEFT JOIN authors a ON pa.author_id = a.author_id
        LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
        LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
        WHERE (p.title ILIKE $1 OR p.abstract ILIKE $1 OR a.name ILIKE $1 OR k.keyword ILIKE $1)
        AND p.is_archived = false
    `;

    const queryParams = [searchQuery];

    if (fromYear) {
        queryParams.push(fromYear);
        sqlQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        countQuery += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
    }

    if (toYear) {
        queryParams.push(toYear);
        sqlQuery += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
        countQuery += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
    }

    sqlQuery += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(itemsPerPage, offset);

    try {
        // Run the COUNT query to get the total count of matching projects
        const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the matching projects
        const result = await pool.query(sqlQuery, queryParams);

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
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query;
    const offset = (page - 1) * itemsPerPage;

    try {
        const searchQuery = `%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`;  // Prepare the search query

        let searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.title) LIKE LOWER($1) AND p.is_archived = false
        `;

        let countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.title) LIKE LOWER($1) AND p.is_archived = false
        `;

        const queryParams = [searchQuery];

        if (fromYear) {
            queryParams.push(fromYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        }

        if (toYear) {
            queryParams.push(toYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
        }

        searchQuerySQL += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(itemsPerPage, offset);

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search title
        const result = await pool.query(searchQuerySQL, queryParams);

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
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query; // Pagination params
    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    try {
        const searchQuery = `%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`;  // Prepare the search query

        let searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT a.name, ', ') AS authors, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords
            FROM projects p
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            WHERE LOWER(a.name) LIKE LOWER($1) AND p.is_archived = false
        `;

        let countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(a.name) LIKE LOWER($1) AND p.is_archived = false
        `;

        const queryParams = [searchQuery];

        if (fromYear) {
            queryParams.push(fromYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        }

        if (toYear) {
            queryParams.push(toYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
        }

        searchQuerySQL += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(itemsPerPage, offset);

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search author
        const result = await pool.query(searchQuerySQL, queryParams);

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
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(itemsPerPage);

    try {
        // Simple query pattern
        const searchPattern = `%${query}%`;
        
        // Build query
        let sql = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE p.is_archived = false
            AND k.keyword ILIKE $1
        `;
        
        // Add parameters array
        const params = [searchPattern];
        
        // Add year filters if provided
        if (fromYear) {
            params.push(fromYear);
            sql += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${params.length}`;
        }
        
        if (toYear) {
            params.push(toYear);
            sql += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${params.length}`;
        }
        
        // Add GROUP BY, ORDER BY, LIMIT, and OFFSET
        sql += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(itemsPerPage), offset);
        
        // Execute query
        const result = await pool.query(sql, params);
        
        // Count total projects matching this search (without limit/offset)
        let countSql = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            WHERE p.is_archived = false
            AND k.keyword ILIKE $1
        `;
        
        const countParams = [searchPattern];
        
        if (fromYear) {
            countParams.push(fromYear);
            countSql += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${countParams.length}`;
        }
        
        if (toYear) {
            countParams.push(toYear);
            countSql += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${countParams.length}`;
        }
        
        const countResult = await pool.query(countSql, countParams);
        const totalCount = parseInt(countResult.rows[0]?.total_count || 0, 10);
        
        // Log activity data but return response directly
        req.activity = 'User searched by keywords';
        req.additionalInfo = JSON.stringify({ searchQuery: query });
        
        return res.json({
            totalCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Error in keyword search:', error);
        return res.status(500).json({
            error: 'Failed to search projects by keywords',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


// GET - Search projects by abstract with pagination and total count
// GET - Advanced search with AND/OR operators
router.get('/advanced', async (req, res) => {
  console.log('Advanced search request received');
  
  // Parse inputs from the query string
  let searchFields = [];
  
  try {
    if (req.query.searchFields) {
      try {
        // First try to parse as JSON
        searchFields = JSON.parse(req.query.searchFields);
        console.log('Successfully parsed searchFields as JSON:', searchFields);
      } catch (jsonError) {
        console.error('Error parsing searchFields as JSON:', jsonError);
        
        // If JSON parsing fails, try to extract the fields directly
        if (typeof req.query.searchFields === 'object') {
          searchFields = req.query.searchFields;
        } else {
          // If all else fails, look for parameters like searchFields[0][query]
          searchFields = [];
          Object.keys(req.query).forEach(key => {
            if (key.startsWith('searchFields[') || key.startsWith('advancedSearchInputs[')) {
              const matches = key.match(/\[(\d+)\]\[([^\]]+)\]/);
              if (matches) {
                const index = parseInt(matches[1]);
                const field = matches[2];
                const value = req.query[key];
                
                if (!searchFields[index]) {
                  searchFields[index] = {};
                }
                
                searchFields[index][field] = value;
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing searchFields:', error);
    searchFields = [];
  }
  
  // Extract other parameters with defaults
  const page = parseInt(req.query.page || 1);
  const itemsPerPage = parseInt(req.query.itemsPerPage || 5);
  
  // Extract date range with defaults
  let dateRange = {};
  
  try {
    if (req.query.dateRange) {
      try {
        // Try to parse as JSON
        dateRange = JSON.parse(req.query.dateRange);
      } catch (jsonError) {
        console.error('Error parsing dateRange as JSON:', jsonError);
        
        // If JSON parsing fails, check if it's already an object
        if (typeof req.query.dateRange === 'object') {
          dateRange = req.query.dateRange;
        }
      }
    }
  } catch (error) {
    console.error('Error processing dateRange:', error);
    dateRange = {};
  }
  
  // Fallback to fromYear/toYear if dateRange is not present
  if (!dateRange.startDate && req.query.fromYear) {
    dateRange.startDate = req.query.fromYear;
  }
  if (!dateRange.endDate && req.query.toYear) {
    dateRange.endDate = req.query.toYear;
  }
  
  // Calculate offset
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
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_archived = false
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT p.project_id) AS total_count
      FROM projects p
      LEFT JOIN project_authors pa ON p.project_id = pa.project_id
      LEFT JOIN authors a ON pa.author_id = a.author_id
      LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
      LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_archived = false
    `;

    const queryParams = [];
    let conditions = [];

    // Process each search field
    if (Array.isArray(searchFields)) {
      searchFields.forEach((field, index) => {
        if (field && field.query && field.query.trim()) {
          // Use simple pattern for better keyword matches
          queryParams.push(`%${field.query}%`);
          let condition = '';
          
          console.log(`Processing field: ${field.option} with query: ${field.query}`);
          
          switch (field.option) {
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
            case 'allfields':
            default:
              condition = `(p.title ILIKE $${queryParams.length} OR 
                         a.name ILIKE $${queryParams.length} OR 
                         k.keyword ILIKE $${queryParams.length} OR 
                         p.abstract ILIKE $${queryParams.length})`;
              break;
          }

          if (index === 0) {
            conditions.push(condition);
          } else {
            conditions.push(`${field.condition || 'AND'} ${condition}`);
          }
        }
      });
    }

    // Add date range conditions if provided
    if (dateRange.startDate) {
      queryParams.push(dateRange.startDate);
      conditions.push(`AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`);
    }
    if (dateRange.endDate) {
      queryParams.push(dateRange.endDate);
      conditions.push(`AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`);
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
    queryParams.push(parseInt(itemsPerPage), offset);

    console.log('Advanced search query:', searchQuery);
    console.log('Parameters:', queryParams);

    // Execute queries
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const result = await pool.query(searchQuery, queryParams);

    // Return results directly to avoid middleware issues
    return res.status(200).json({
      totalCount: parseInt(countResult.rows[0]?.total_count || 0, 10),
      data: result.rows || []
    });

  } catch (error) {
    console.error('Error performing advanced search:', error);
    return res.status(500).json({
      error: 'Failed to perform advanced search',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/search/abstract', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query; // Pagination params
    const offset = (page - 1) * itemsPerPage; // Calculate offset for pagination

    try {
        const searchQuery = `%${query.replace(/[^a-zA-Z0-9]/g, '%')}%`;  // Prepare the search query

        let searchQuerySQL = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.abstract) LIKE LOWER($1) AND p.is_archived = false
        `;

        let countQuerySQL = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE LOWER(p.abstract) LIKE LOWER($1) AND p.is_archived = false
        `;

        const queryParams = [searchQuery];

        if (fromYear) {
            queryParams.push(fromYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${queryParams.length}`;
        }

        if (toYear) {
            queryParams.push(toYear);
            searchQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
            countQuerySQL += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${queryParams.length}`;
        }

        searchQuerySQL += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(itemsPerPage, offset);

        // Run the COUNT query to get the total count of projects matching the search
        const countResult = await pool.query(countQuerySQL, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        // Run the SEARCH query to fetch the projects that match the search abstract
        const result = await pool.query(searchQuerySQL, queryParams);

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

// New simplified route for keyword search - less complex to eliminate possible error sources
router.get('/keyword-simple', async (req, res) => {
    const { query, page = 1, itemsPerPage = 5, fromYear, toYear } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(itemsPerPage);

    try {
        // Simple query pattern
        const searchPattern = `%${query}%`;
        
        // Build query
        let sql = `
            SELECT p.*, 
                   STRING_AGG(DISTINCT k.keyword, ', ') AS keywords,
                   STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            LEFT JOIN project_authors pa ON p.project_id = pa.project_id
            LEFT JOIN authors a ON pa.author_id = a.author_id
            WHERE p.is_archived = false
            AND k.keyword ILIKE $1
        `;
        
        // Add parameters array
        const params = [searchPattern];
        
        // Add year filters if provided
        if (fromYear) {
            params.push(fromYear);
            sql += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${params.length}`;
        }
        
        if (toYear) {
            params.push(toYear);
            sql += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${params.length}`;
        }
        
        // Add GROUP BY, ORDER BY, LIMIT, and OFFSET
        sql += ` GROUP BY p.project_id ORDER BY p.publication_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(itemsPerPage), offset);
        
        // Execute query
        const result = await pool.query(sql, params);
        
        // Count total projects matching this search (without limit/offset)
        let countSql = `
            SELECT COUNT(DISTINCT p.project_id) AS total_count
            FROM projects p
            LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
            LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
            WHERE p.is_archived = false
            AND k.keyword ILIKE $1
        `;
        
        const countParams = [searchPattern];
        
        if (fromYear) {
            countParams.push(fromYear);
            countSql += ` AND EXTRACT(YEAR FROM p.publication_date) >= $${countParams.length}`;
        }
        
        if (toYear) {
            countParams.push(toYear);
            countSql += ` AND EXTRACT(YEAR FROM p.publication_date) <= $${countParams.length}`;
        }
        
        const countResult = await pool.query(countSql, countParams);
        const totalCount = parseInt(countResult.rows[0]?.total_count || 0, 10);
        
        // Simple response
        return res.json({
            totalCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Error in simplified keyword search:', error);
        return res.status(500).json({
            error: 'Failed to search projects by keywords',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;