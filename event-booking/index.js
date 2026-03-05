require('dotenv').config(); // Load environment variables
const express = require('express'); // Web framework
const { connectDB } = require('./config/db'); // Database connection
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();
app.use(express.json()); // Parse JSON bodies

// Connect to Database
connectDB();

// Routes
// Health check endpoint
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the Event Booking API!', status: 'Running' });
});
app.use('/api/auth', authRoutes); // Auth endpoints
app.use('/api/events', eventRoutes); // Event endpoints

// Fallback error handler for JSON errors
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        statusCode,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
