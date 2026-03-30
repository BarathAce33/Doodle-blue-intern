import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friend.routes';
import errorHandler from './middlewares/error.middleware';
import { encryptionMiddleware } from './middlewares/encryption.middleware';

// config
dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(encryptionMiddleware);

// db
connectDB();

// routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 200, message: 'Server is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);

// fallback
app.use((req, res) => {
  return res.status(404).json({ status: 404, message: 'Endpoint not found' });
});

// error
app.use(errorHandler);

// listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`port ${PORT}`));
