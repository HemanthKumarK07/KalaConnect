import express from 'express';
import {
  calculateFairPrice,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/products.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Artisan / Admin routes
router.post('/fair-price', protect, authorizeRoles('artisan', 'admin'), calculateFairPrice);
router.post('/', protect, authorizeRoles('artisan', 'admin'), createProduct);
router.put('/:id', protect, authorizeRoles('artisan', 'admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('artisan', 'admin'), deleteProduct);

export default router;
