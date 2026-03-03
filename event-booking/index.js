require('dotenv').config(); // Load environment variables
const express = require('express'); // Web framework
const connectDB = require('./config/db'); // Database connection
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

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
