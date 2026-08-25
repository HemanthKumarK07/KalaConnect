import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import productRoutes from '../routes/products.js';
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
app.use('/api/products', productRoutes);
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

  it('2. Should successfully Signup a new user', async () => {
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
    expect(res.body.message).toBeDefined();
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

  it('9. Should deny fair-price recommendations without authentication', async () => {
    const res = await request(app).post('/api/products/fair-price').send({ materialCost: 100 });
    expect(res.statusCode).toEqual(401);
  });

  it('10. Should calculate a fair price for an authenticated artisan', async () => {
    const res = await request(app)
      .post('/api/products/fair-price')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productName: 'Handwoven Stole', category: 'textiles', materialCost: 300,
        labourCost: 700, packagingCost: 100, otherCost: 100, craftingHours: 8,
        quantity: 1, qualityLevel: 'Standard'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.costBreakdown.estimatedProductionCost).toBe(1200);
    expect(res.body.data.recommendation.recommendedMinPrice).toBeGreaterThan(1200);
  });

  it('11. Should reject negative fair-price inputs', async () => {
    const res = await request(app)
      .post('/api/products/fair-price')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ materialCost: -1, labourCost: 100, packagingCost: 0, otherCost: 0, craftingHours: 1, quantity: 1 });

    expect(res.statusCode).toEqual(400);
  });

  it('12. Should save pricing data but hide it from public catalog responses', async () => {
    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Handwoven Stole', shortTitle: 'Handwoven Stole', price: 1600, category: 'textiles',
        materialCost: 300, labourCost: 700, packagingCost: 100, otherCost: 100,
        craftingHours: 8, quantityProduced: 1, estimatedProductionCost: 1200,
        recommendedMinPrice: 1500, recommendedMaxPrice: 1740, finalSellingPrice: 1600
      });

    expect(created.statusCode).toEqual(201);
    expect(created.body.data.finalSellingPrice).toBe(1600);

    const publicProduct = await request(app).get(`/api/products/${created.body.data._id}`);
    expect(publicProduct.statusCode).toEqual(200);
    expect(publicProduct.body.data.price).toBe(1600);
    expect(publicProduct.body.data.materialCost).toBeUndefined();
    expect(publicProduct.body.data.estimatedProductionCost).toBeUndefined();
  });
});
