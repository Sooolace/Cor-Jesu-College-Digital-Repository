// server.js

const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path module
const pool = require('./db'); 
const authorsRouter = require('./routes/authors');
const projectsRouter = require('./routes/projects');
const projectAuthorsRouter = require('./routes/project_authors'); 
const categoriesRouter = require('./routes/categories'); 
const researchAreasRouter = require('./routes/researchAreas'); 
const topicsRouter = require('./routes/topics'); 
const researchTypesRouter = require('./routes/researchTypes');
const keywordsRouter = require('./routes/keywords');
const projectKeywordsRouter = require('./routes/project_keywords'); // Import your new route

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/projects', projectsRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/project_authors', projectAuthorsRouter); 
app.use('/api/categories', categoriesRouter);
app.use('/api/researchAreas', researchAreasRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/researchTypes', researchTypesRouter);
app.use('/api/keywords', keywordsRouter); 
app.use('/api/project_keywords', projectKeywordsRouter);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).send('API is running smoothly!');
});

// Serve static files from the React app's build folder in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));

    // Catch-all route to serve the React app for any non-API requests
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
