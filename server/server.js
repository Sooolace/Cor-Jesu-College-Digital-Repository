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
const usersRouter = require('./routes/users'); // Import the users route
const bookmarksRouter = require('./routes/bookmark'); // Import the bookmarks route (note the singular filename)
const { OAuth2Client } = require('google-auth-library');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Google OAuth Configuration
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/users', usersRouter); // Add the users routes
app.use('/api/bookmarks', bookmarksRouter); // Add the bookmarks routes

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
            { userId: user.id, username: user.username, role: user.role },
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

        // Return the token and user data (including ID)
        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Error during login:', err.message);
        console.error(err.stack);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Google OAuth Route
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      console.error('No token provided in request');
      return res.status(400).json({ message: 'No token provided' });
    }
    
    console.log('Received Google token, attempting to verify...');
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      // Don't strictly verify audience during development
      // audience: process.env.GOOGLE_CLIENT_ID
    }).catch(error => {
      console.error('Token verification failed:', error.message);
      throw new Error(`Token verification failed: ${error.message}`);
    });
    
    if (!ticket) {
      console.error('Failed to verify token but no error was thrown');
      return res.status(401).json({ message: 'Token verification failed' });
    }
    
    console.log('Token successfully verified');
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    console.log(`User authenticated: ${email}`);
    
    // Determine role based on email pattern
    // You can customize this logic based on your requirements
    let role = 'user'; // Default role is user
    
    // Example: Set specific emails as admin or check for specific domain
    const adminEmails = ['your.admin@gmail.com', 'admin@yourdomain.com'];
    if (adminEmails.includes(email) || email.endsWith('@admin.yourdomain.com')) {
      role = 'admin';
    }
    
    console.log(`Assigned role: ${role} for user ${email}`);
    
    // Check if the user exists in your database
    const userQuery = 'SELECT * FROM admin WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);
    
    let userId;
    
    if (userResult.rows.length === 0) {
      console.log(`User ${email} not found in database, creating new account with role: ${role}`);
      // User doesn't exist, create them with determined role
      const insertQuery = 'INSERT INTO admin (username, email, role, picture_url) VALUES ($1, $2, $3, $4) RETURNING id';
      const insertResult = await pool.query(insertQuery, [name, email, role, picture]);
      userId = insertResult.rows[0].id;
      console.log(`New user created with ID: ${userId} and role: ${role}`);
    } else {
      // User exists, maintain their existing role unless updating is desired
      userId = userResult.rows[0].id;
      role = userResult.rows[0].role || role; // Keep existing role if present
      console.log(`Existing user found with ID: ${userId} and role: ${role}`);
    }
    
    // Generate JWT token with role included
    const jwtToken = jwt.sign(
      { userId, email, name, role },
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: '1h' }
    );
    
    console.log(`Authentication successful, returning token with role: ${role}`);
    
    return res.json({
      token: jwtToken,
      user: {
        id: userId,
        name,
        email,
        picture,
        role  // Include actual role in the response
      }
    });
    
  } catch (error) {
    console.error('Google authentication error details:', error);
    console.error('Stack trace:', error.stack);
    return res.status(401).json({ 
      message: 'Google authentication failed', 
      details: error.message 
    });
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
