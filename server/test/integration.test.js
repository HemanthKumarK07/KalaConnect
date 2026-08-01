import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import { notFound, errorHandler } from '../middleware/error.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
// Set a dummy JWT secret for testing
process.env.JWT_SECRET = 'testsecret123';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('KalaConnect Backend Integration Tests', () => {
  let userToken = '';

  it('1. Should successfully connect to MongoDB (Memory Server)', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('2. Should successfully Signup a new user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Artisan',
        email: 'artisan@test.com',
        password: 'securepassword',
        role: 'artisan'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Test Artisan');
    expect(res.body.user.password).toBeUndefined(); // Password should not be returned
  });

  it('3. Should fail Signup with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Duplicate Artisan',
        email: 'artisan@test.com',
        password: 'securepassword',
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Email already exists');
  });

  it('4. Should Login successfully and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'artisan@test.com',
        password: 'securepassword',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    
    // Save token for protected route tests
    userToken = res.body.token;
  });

  it('5. Should fail Login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'artisan@test.com',
        password: 'wrongpassword',
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('6. Should access protected route /api/auth/me with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('artisan@test.com');
  });

  it('7. Should deny access to protected route without JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('8. Should successfully update profile (Protected Route)', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        phone: '1234567890',
        state: 'Rajasthan',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.phone).toBe('1234567890');
    expect(res.body.user.state).toBe('Rajasthan');
  });
});
