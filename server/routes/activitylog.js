const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import your database connection

// Route to fetch activity logs
router.get('/activity-log', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activity_log ORDER BY timestamp DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching activity log:', err.message);
        res.status(500).json({ error: 'Failed to fetch activity log' });
    }
});

// Route to remove duplicates from the activity log
router.post('/remove-duplicates', async (req, res) => {
    const thresholdInMillis = 500;  // 500 milliseconds threshold

    const sql = `
    WITH CTE AS (
        SELECT 
            ROW_NUMBER() OVER (
                PARTITION BY user_id, additional_info, ip_address  -- Change 'activity' to 'additional_info'
                ORDER BY timestamp DESC
            ) AS row_num,
            id, 
            timestamp,
            ip_address
        FROM activity_log
    )
    DELETE FROM activity_log
    WHERE id IN (
        SELECT id
        FROM CTE
        WHERE row_num > 1
          AND ABS(EXTRACT(EPOCH FROM (timestamp - (SELECT timestamp FROM activity_log WHERE id = CTE.id))) * 1000) < ${thresholdInMillis}
          AND ip_address = (SELECT ip_address FROM activity_log WHERE id = CTE.id)
    );
    `;

    try {
        await pool.query(sql);
        res.status(200).send('Duplicates removed successfully');
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Error removing duplicates');
    }
});




// Route to truncate the activity_log table
router.post('/truncate', async (req, res) => {
    const sql = 'TRUNCATE TABLE activity_log';

    try {
        await pool.query(sql);
        res.status(200).send('Activity log truncated successfully');
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Error truncating activity log');
    }
});

module.exports = router;
