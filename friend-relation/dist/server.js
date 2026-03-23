"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const friendRoutes = require('./routes/friend.routes');
const errorHandler = require('./middlewares/error.middleware');
dotenv.config();
const app = express();
// middleware
app.use(cors());
app.use(express.json());
// db
connectDB();
// health
app.get('/health', (req, res) => {
    res.status(200).json({ status: 200, message: 'Server is healthy' });
});
// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
// 404
app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Endpoint not found' });
});
// error handle
app.use(errorHandler);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`port ${PORT}`));
