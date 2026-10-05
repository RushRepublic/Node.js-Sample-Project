require('dotenv').config(); // Load values from .env into process.env

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { uploadsDir } = require('./middleware/upload');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Only allow our own website to call this API from another address.
// If CORS_ORIGIN is not set, cross-site requests are blocked (origin: false).
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));

// Lets us read JSON sent in request bodies (req.body).
app.use(express.json());

// Simple test route to check the server is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test route to check Express can talk to MySQL.
// Express 5 passes errors from async functions to errorHandler automatically.
app.get('/api/health/db', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

// All /api/users/... URLs are handled in routes/userRoutes.js
app.use('/api/users', userRoutes);

// Uploaded photos and videos are served from /uploads/<file name>.
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Production: serve the built React site (frontend/dist) from this same server.
// If the dist folder does not exist (normal during development), this is skipped.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // React Router pages (like /users) must also return index.html on refresh.
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// Must be last: handle unknown URLs, then errors.
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads folder: ${uploadsDir}`);

  // Check the database once at startup so problems show up immediately.
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected');
  } catch (error) {
    console.error('MySQL connection FAILED:', error.message);
  }
});
