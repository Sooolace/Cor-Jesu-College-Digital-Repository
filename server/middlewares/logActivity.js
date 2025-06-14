const { Pool } = require('pg');
const pool = require('../db');
const axios = require('axios'); // Make sure axios is installed

// Define a threshold for logging (in milliseconds, e.g., 10 minutes)
const LOG_THRESHOLD = 10 * 60 * 1000; // 10 minutes

// Function to get user ID from session or token
const getUserId = async (req) => {
    try {
        // Check if user is authenticated via Google OAuth
        if (req.user && req.user.email) {
            // Query the admin table to get the user ID
            const result = await pool.query(
                'SELECT id FROM admin WHERE email = $1',
                [req.user.email]
            );
            if (result.rows.length > 0) {
                return result.rows[0].id;
            }
        }
        return null;
    } catch (err) {
        console.error('Error getting user ID:', err);
        return null;
    }
};

const setActivity = (req) => {
    const { query, page, itemsPerPage } = req.query;
    const route = req.originalUrl;
    let action = null;
    let additionalInfo = '';

    if (route.includes('/projects/') && req.method === 'GET') {
        action = 'VIEW_DOCUMENT';
        additionalInfo = `Viewed document ID: ${route.split('/').pop()}`;
    }

    // ✅ Only log search if query exists and isn't blank
    else if (route.includes('/search') && query && query.trim() !== '') {
        if (route.includes('title')) {
            action = 'SEARCH_TITLE';
            additionalInfo = `Searched by title: ${query}`;
        } else if (route.includes('author')) {
            action = 'SEARCH_AUTHOR';
            additionalInfo = `Searched by author: ${query}`;
        } else if (route.includes('keywords')) {
            action = 'SEARCH_KEYWORDS';
            additionalInfo = `Searched by keywords: ${query}`;
        } else if (route.includes('abstract')) {
            action = 'SEARCH_ABSTRACT';
            additionalInfo = `Searched in abstract: ${query}`;
        } else if (route.includes('allfields')) {
            action = 'SEARCH_ALL';
            additionalInfo = `Searched all fields: ${query}`;
        } else if (route.includes('advanced')) {
            action = 'ADVANCED_SEARCH';
            additionalInfo = `Advanced search with filters: ${JSON.stringify(req.query)}`;
        }
    }

    // ✅ Only log list fetching if page is loaded (implies interaction)
    else if (route.includes('/keywords') && req.query.page) {
        action = 'FETCH_KEYWORDS';
        additionalInfo = 'Retrieved keywords list';
    }
    else if (route.includes('/authors') && req.query.page) {
        action = 'FETCH_AUTHORS';
        additionalInfo = 'Retrieved authors list';
    }
    else if (route.includes('/allprojs') && req.query.page) {
        action = 'FETCH_ALL_PROJECTS';
        additionalInfo = 'Retrieved all projects';
    }

    // Set if any valid action found
    if (action) {
        req.action = action;
        req.additionalInfo = additionalInfo;
    }
};


// // Function to get location data from IP using ipapi.co
// const getLocationData = async (ip) => {
//     try {
//       const response = await axios.get(`https://ipapi.co/175.176.92.244/json/`);
//       if (response.data) {
//             return {
//                 country: response.data.country_name,
//                 city: response.data.city,
//                 latitude: response.data.latitude,
//                 longitude: response.data.longitude
//             };
//         }
//     } catch (err) {
//         console.error('Error getting location data from ipapi.co:', err);
//     }
//     return {
//         country: null,
//         city: null,
//         latitude: null,
//         longitude: null
//     };
// };

// Function to log activity
async function logActivity(req, res, next) {
    console.log('Activity logging middleware triggered for:', req.originalUrl);
    
    // Skip logging if activity has already been logged
    if (req.activityLogged) {
        console.log('Activity already logged, skipping');
        return next();
    }

    // Set activity based on route and query parameters
    setActivity(req);
    console.log('Activity set:', req.action);

    // Get user ID from session or token
    const userId = await getUserId(req);
    console.log('User ID from session:', userId);

    const action = req.action || `${req.method} ${req.originalUrl}`;
    const additionalInfo = req.additionalInfo || '';
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipHash = require('crypto').createHash('sha256').update(ipAddress).digest('hex');
    
    console.log('Logging activity:', {
        userId,
        action,
        additionalInfo,
        ipAddress,
        ipHash
    });

    try {
        // Get location data
        const locationData = await getLocationData(ipAddress);
        console.log('Location data:', locationData);

        // 1. Check the last activity for this user and action
        const query = `
            SELECT timestamp FROM activity_log
            WHERE user_id = $1 AND action = $2
            ORDER BY timestamp DESC LIMIT 1
        `;
        const values = [userId, action];

        const result = await pool.query(query, values);
        const lastActivity = result.rows[0];

        // 2. If there's a previous activity, check if it's within the threshold time
        if (lastActivity) {
            const lastActivityTimestamp = new Date(lastActivity.timestamp).getTime();
            const currentTimestamp = new Date().getTime();
            
            if (currentTimestamp - lastActivityTimestamp < LOG_THRESHOLD) {
                console.log('Activity logged too recently, skipping');
                return next();
            }
        }

        // 3. If no recent activity or activity is different, log the new activity
        const insertQuery = `
            INSERT INTO activity_log (
                user_id, 
                action, 
                additional_info, 
                country, 
                city, 
                latitude, 
                longitude, 
                ip_hash
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        const insertValues = [
            userId,
            action,
            additionalInfo,
            locationData.country,
            locationData.city,
            locationData.latitude,
            locationData.longitude,
            ipHash
        ];

        console.log('Executing insert query with values:', insertValues);
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log('Activity logged successfully with ID:', insertResult.rows[0].id);
        
        req.activityLogged = true;
        next();
    } catch (err) {
        console.error('Error logging activity:', err);
        next();
    }
}

module.exports = logActivity;
