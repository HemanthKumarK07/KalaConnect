import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/Product.js';
import connectDB from '../config/db.js';

const run = async () => {
  await connectDB();
  const products = await Product.find({}).sort({ price: -1 }).select('shortTitle title price artisanName category');
  console.log(`\nAll ${products.length} products sorted by price (highest first):\n`);
  products.forEach(p => {
    console.log(`  Rs.${p.price.toLocaleString().padStart(8)} | ${(p.artisanName || '').padEnd(16)} | ${(p.category || '').padEnd(12)} | ${p.shortTitle || p.title}`);
  });
  mongoose.disconnect();
};
run().catch(e => { console.error(e.message); process.exit(1); });
