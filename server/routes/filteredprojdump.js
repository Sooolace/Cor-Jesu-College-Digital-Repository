router.get('/filteredprojs', async (req, res) => {
    const { page = 1, itemsPerPage = 5, query = '', categories = [] } = req.query;
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
    LEFT JOIN research_areas ra ON p.category_id = ra.category_id
    LEFT JOIN topics t ON ra.research_area_id = t.research_area_id
    WHERE 1=1
    `;

    let countQuery = `
    SELECT COUNT(DISTINCT p.project_id) AS total_count
    FROM projects p
    LEFT JOIN project_authors pa ON p.project_id = pa.project_id
    LEFT JOIN authors a ON pa.author_id = a.author_id
    LEFT JOIN project_keywords pk ON p.project_id = pk.project_id
    LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
    LEFT JOIN research_areas ra ON p.category_id = ra.category_id
    LEFT JOIN topics t ON ra.research_area_id = t.research_area_id
    WHERE 1=1
    `;

    const queryParams = [];
    const categoriesParams = [];

    // Apply search query filter (search by title, authors, or keywords)
    if (query) {
        queryParams.push(`%${query}%`);
        searchQuery += ` AND (p.title ILIKE $${queryParams.length} 
                           OR a.name ILIKE $${queryParams.length} 
                           OR k.keyword ILIKE $${queryParams.length})`;
        countQuery += ` AND (p.title ILIKE $${queryParams.length} 
                            OR a.name ILIKE $${queryParams.length} 
                            OR k.keyword ILIKE $${queryParams.length})`;
    }

    // Categories Filtering (use category_id)
    if (categories.length > 0) {
        categories.forEach((_, index) => categoriesParams.push(`$${queryParams.length + index + 1}`));
        searchQuery += ` AND (p.category_id IN (${categoriesParams.join(', ')}) 
                            OR ra.research_area_id IN (${categoriesParams.join(', ')}) 
                            OR t.topic_id IN (${categoriesParams.join(', ')}) )`;
        countQuery += ` AND (p.category_id IN (${categoriesParams.join(', ')}) 
                            OR ra.research_area_id IN (${categoriesParams.join(', ')}) 
                            OR t.topic_id IN (${categoriesParams.join(', ')}) )`;
    }

    // Pagination and finalizing the query
    searchQuery += `
    GROUP BY p.project_id
    ORDER BY p.publication_date DESC
    LIMIT $${queryParams.length + categories.length + 1} OFFSET $${queryParams.length + categories.length + 2}
    `;

    const finalParams = [...queryParams, ...categories, itemsPerPage, offset];

    try {
        const countResult = await pool.query(countQuery, queryParams.concat(categories));
        const result = await pool.query(searchQuery, finalParams);

        res.status(200).json({
            totalCount: parseInt(countResult.rows[0].total_count, 10),
            data: result.rows,
        });
    } catch (error) {
        console.error('Error retrieving filtered projects:', error);
        res.status(500).json({ error: 'Failed to retrieve projects', details: error.message });
    }
})