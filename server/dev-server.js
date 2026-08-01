import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { notFound, errorHandler } from './middleware/error.js';
import { runSeed } from './seeder.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('KalaConnect API is running (Sandbox Mode with Local In-Memory DB)...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

const startDevServer = async () => {
  console.log('Starting Local In-Memory MongoDB for Sandbox Testing...');
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  console.log('✅ Local Sandbox MongoDB Connected!');

  await runSeed();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Backend API is running on http://localhost:${PORT}`);
    console.log(`⚠️ Note: Data is saved to memory and will be lost on restart.`);
  });
};

startDevServer();
