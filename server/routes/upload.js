import express from 'express';
import multer from 'multer';
import { protect, authorizeRoles } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'));
    }
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedFormats.includes(file.mimetype)) {
      return cb(new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP.'));
    }
    cb(null, true);
  }
});

/**
 * @desc    Upload product images to Cloudinary
 * @route   POST /api/upload/image
 * @access  Private (Artisan, Admin)
 */
router.post('/image', protect, authorizeRoles('artisan', 'admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Cloudinary API Secret is missing. Cannot perform secure upload.' 
      });
    }

    // Wrap Cloudinary upload in a promise
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'kalaconnect/products',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });

  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Image upload failed. Please retry.' 
    });
  }
});

/**
 * @desc    Generate Cloudinary upload signature for direct frontend uploads (e.g. large videos)
 * @route   GET /api/upload/signature
 * @access  Private (Artisan, Admin)
 */
router.get('/signature', protect, authorizeRoles('artisan', 'admin'), (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: 'Cloudinary API Secret is missing.' });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    const folder = 'kalaconnect/academy';
    
    // Cloudinary signature requires alphabetically sorting parameters
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder
    }, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      data: {
        timestamp,
        signature,
        folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      }
    });
  } catch (error) {
    console.error('Signature Generation Error:', error);
    res.status(500).json({ success: false, message: 'Could not generate upload signature.' });
  }
});

export default router;
