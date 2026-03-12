// Imports
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/database.js');
const authRoutes = require('./src/routes/auth.routes.js');
const todoRoutes = require('./src/routes/todo.routes.js');
const memoRoutes = require('./src/routes/memo.routes.js');
const { errorHandler, notFoundHandler } = require('./src/utils/errorHandler.js');

// Init
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/health', (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: 'Memo-Todo API is running'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/memos', memoRoutes);

// Errors
app.use('*', notFoundHandler);

// Global handler
app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Run
startServer();
