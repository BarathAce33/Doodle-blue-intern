const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bannerRoutes = require('./routes/bannerRoutes');

/**
 * 1. Environment Configuration
 * Load environment variables from .env file
 */
dotenv.config();

/**
 * 2. Database Connection
 * Initialize MongoDB connection using Mongoose
 */
connectDB();

const app = express();

/**
 * 3. Global Middleware
 */
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

/**
 * 4. API Routes
 */
app.use('/api/banners', bannerRoutes);

/**
 * 5. Root Entry Point
 * Provides basic API information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Banner CRUD API (S3 Powered)',
    version: '1.0.0',
    status: 'Ready'
  });
});

/**
 * 6. Global Error Handling Middleware
 * Centralized error handling for multer, S3, and application-level errors
 */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);

  // Specific Multer/Image validation errors
  if (err.message.includes('Only image files') || err.message.includes('Not an image')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Please upload an image.'
    });
  }

  // Multer File size limit error
  if (err.message.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size should not exceed 5MB'
    });
  }

  // Fallback for generic server errors
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

/**
 * 7. 404 Route Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route not found'
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
