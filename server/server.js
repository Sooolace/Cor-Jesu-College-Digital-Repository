const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db'); 
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
const searchRouter = require('./routes/search');
const projectsCategoryRouter = require('./routes/project_category'); 
const activityLogRouter = require('./routes/activitylog');
const uploadRouter = require('./routes/upload'); // Import the upload route

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// **Ensure downloads folder is served correctly**
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.get("/downloads/:filename", (req, res) => {
    const decodedFilename = decodeURIComponent(req.params.filename);

    // Fix the file path (Remove 'server' from the path)
    const filePath = path.join(__dirname, "..", "downloads", decodedFilename);

    console.log("Decoded Filename:", decodedFilename);
    console.log("Full Path:", filePath);

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(500).send("File not found or server error.");
        }
    });
});
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
app.use('/api/activitylog', activityLogRouter);
app.use('/api/project_category', projectsCategoryRouter);
app.use('/api/featured-documents', featuredDocumentsRouter);
app.use('/api/search', searchRouter);
app.use('/api', uploadRouter);

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
        const query = 'SELECT * FROM admin WHERE username = $1';
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your_default_secret', // Ensure the secret is available
            { expiresIn: '1h' }
        );

        req.user = {
            id: user.id,
            username: user.username,
            role: user.role // Assuming you have a role field in your user table
        };

        req.activity = 'User logged in';
        req.additionalInfo = { username: user.username };

        return res.json({ token });

    } catch (err) {
        console.error('Error during login:', err.message);
        console.error(err.stack);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Serve static files from the React app's build folder in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));

    // Catch-all route to serve the React app for any non-API requests
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
