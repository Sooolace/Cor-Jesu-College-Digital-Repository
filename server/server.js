const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');  // Import your PostgreSQL connection
const authorsRouter = require('./routes/authors');
const projectsRouter = require('./routes/projects');
const projectAuthorsRouter = require('./routes/project_authors');
const categoriesRouter = require('./routes/categories');
const researchAreasRouter = require('./routes/researchAreas');
const topicsRouter = require('./routes/topics');
const researchTypesRouter = require('./routes/researchTypes');
const keywordsRouter = require('./routes/keywords');
const projectKeywordsRouter = require('./routes/project_keywords');
const featuredDocumentsRouter = require('./routes/featureddocuments');
const searchRouter = require('./routes/search');  // Import search route
const projectsCategoryRouter = require('./routes/project_category'); // Import the new projects_category route

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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

// New route for projects_category
app.use('/api/project_category', projectsCategoryRouter);

// Featured documents route
app.use('/api/featured-documents', featuredDocumentsRouter);

// Search route
app.use('/api/search', searchRouter);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).send('API is running smoothly!');
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Query the database for the user by username
        const query = 'SELECT * FROM admin WHERE username = $1'; // Modify 'admin' to your actual table name
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0]; // User data from the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);  // Compare hashed password

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },  // Include relevant user data
            process.env.JWT_SECRET || 'your_secret_key',  // Secret key for JWT (use environment variables for security)
            { expiresIn: '1h' }
        );

        // Send the token back to the client
        return res.json({ token });

    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
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
