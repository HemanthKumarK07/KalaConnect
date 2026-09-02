import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmb9pporx',
  api_key: process.env.CLOUDINARY_API_KEY || '161914912327119',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
