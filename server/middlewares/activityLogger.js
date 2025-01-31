// activityLogger.js
const setActivity = (req) => {
    const { query, page, itemsPerPage } = req.query; // Get search parameters from the request
    const route = req.originalUrl; // Get the original URL path

    let activity = 'Unknown Activity';
    let additionalInfo = {};

    // Define activity for different routes dynamically based on query parameters
    if (route.includes('/search')) {
        if (route.includes('title')) {
            activity = `User searched by title: ${query}`;
            additionalInfo = { searchField: 'title', searchValue: query };
        } else if (route.includes('author')) {
            activity = `User searched by author: ${query}`;
            additionalInfo = { searchField: 'author', searchValue: query };
        } else if (route.includes('allfields')) {
            activity = `User searched across all fields: ${query}`;
            additionalInfo = { searchField: 'all', searchValue: query };
        }
    }

    // Set activity and additional info to req object
    req.activity = activity;
    req.additionalInfo = additionalInfo;
};

module.exports = { setActivity };
