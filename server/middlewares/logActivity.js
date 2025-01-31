const { Pool } = require('pg');
const pool = require('../db'); // Use your existing database connection

// Define a threshold for logging (in milliseconds, e.g., 10 minutes)
const LOG_THRESHOLD = 10 * 60 * 1000; // 10 minutes

// Function to log activity
async function logActivity(req, res, next) {
  // Skip logging if activity has already been logged (check req.activityLogged)
  if (req.activityLogged) {
    return next();
  }

  const userRole = req.user?.role || 'normal';  // Default to 'normal' if no user
  const userId = req.user?.id || 0;            // Default to 0 if no user
  const activity = req.activity || `${req.method} ${req.originalUrl}`; // Custom activity message
  const additionalInfo = req.additionalInfo || JSON.stringify(req.query || req.body || {}); // Log query or body content
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();

  // 1. Check the last activity for this user and activity type
  const query = `
    SELECT timestamp FROM activity_log
    WHERE user_id = $1 AND activity = $2
    ORDER BY timestamp DESC LIMIT 1
  `;
  const values = [userId, activity];

  try {
    const result = await pool.query(query, values);
    const lastActivity = result.rows[0];

    // 2. If there's a previous activity, check if it's within the threshold time
    if (lastActivity) {
      const lastActivityTimestamp = new Date(lastActivity.timestamp).getTime();
      const currentTimestamp = new Date().getTime();
      
      console.log('Last Activity Timestamp:', lastActivityTimestamp);
      console.log('Current Timestamp:', currentTimestamp);
      console.log('Time Difference:', currentTimestamp - lastActivityTimestamp);

      // If the last activity was logged too recently, skip logging
      if (currentTimestamp - lastActivityTimestamp < LOG_THRESHOLD) {
        console.log('Skipping log due to recent activity.');
        return next();  // Skip logging, proceed to next middleware
      }
    }

    // 3. If no recent activity or activity is different, log the new activity
    const insertQuery = `
      INSERT INTO activity_log (user_role, user_id, ip_address, activity, additional_info, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const insertValues = [userRole, userId, ipAddress, activity, additionalInfo, timestamp];

    await pool.query(insertQuery, insertValues);
    req.activityLogged = true;  // Mark that activity has been logged
    next();  // Proceed to the next middleware
  } catch (err) {
    console.error('Error logging activity:', err);
    next();  // Proceed even if logging fails
  }
}

module.exports = logActivity;
