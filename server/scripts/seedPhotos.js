import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const run = async () => {
  try {
    await connectDB();
    
    let artisan = await User.findOne({ role: 'artisan' });
    if (!artisan) {
        artisan = await User.create({ name: 'Lakshmi Devi', email: 'artisan@test.com', password: 'password123', role: 'artisan' });
    }
    
    const photosDir = path.join(__dirname, '../../public/images/products');
    const files = fs.readdirSync(photosDir);
    
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    const products = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png')).map(f => {
       const title = f.replace(/\.[^/.]+$/, ""); // strip extension
       
       // Try to guess a category based on the filename
       let category = 'textiles';
       const lowerTitle = title.toLowerCase();
       if (lowerTitle.includes('pottery') || lowerTitle.includes('vase')) category = 'pottery';
       else if (lowerTitle.includes('earrings') || lowerTitle.includes('jewelry')) category = 'jewelry';
       else if (lowerTitle.includes('painting') || lowerTitle.includes('canvas') || lowerTitle.includes('art')) category = 'paintings';
       else if (lowerTitle.includes('wood') || lowerTitle.includes('sandalwood') || lowerTitle.includes('bamboo')) category = 'woodwork';
       else if (lowerTitle.includes('bronze') || lowerTitle.includes('brass') || lowerTitle.includes('panchaloha') || lowerTitle.includes('silver')) category = 'brass_metal';
       else if (lowerTitle.includes('leather')) category = 'leather';
       
    // Realistic price lookup by product keywords (Indian market rates)
       const PRICE_MAP = [
         { keys: ['coaster', 'keychain', 'bookmark'], price: [80, 200] },
         { keys: ['earrings', 'pendant', 'small', 'toy'], price: [120, 350] },
         { keys: ['puppet', 'figurine', 'owl'], price: [150, 400] },
         { keys: ['cushion', 'tray', 'box', 'goblet', 'mat'], price: [200, 550] },
         { keys: ['vase', 'pot', 'idol', 'ganesha', 'horse', 'elephant', 'nataraja'], price: [250, 800] },
         { keys: ['lamp', 'panel', 'wall'], price: [300, 900] },
         { keys: ['stole', 'dupatta', 'scarf'], price: [350, 900] },
         { keys: ['kurta', 'canvas', 'painting', 'art'], price: [400, 1200] },
         { keys: ['saree', 'shawl', 'pashmina', 'dinner set'], price: [800, 2500] },
       ];
       const getPrice = (name) => {
         const lower = name.toLowerCase();
         for (const { keys, price } of PRICE_MAP) {
           if (keys.some(k => lower.includes(k))) {
             return Math.floor(Math.random() * (price[1] - price[0])) + price[0];
           }
         }
         // fallback based on category
         const fallbacks = { jewelry: [150, 500], paintings: [300, 900], pottery: [150, 600], woodwork: [200, 700], brass_metal: [250, 900], leather: [180, 600], textiles: [250, 1200] };
         const range = fallbacks[category] || [150, 500];
         return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
       };
       const price = getPrice(title);

       return {
          title: title,
          shortTitle: title.slice(0, 30),
          price,
          originalPrice: Math.round(price * 1.2),
          artisanId: artisan._id,
          artisanName: artisan.name,
          category: category,
          inStock: true,
          sold: Math.floor(Math.random() * 100),
          rating: 4.0 + (Math.random()),
          images: [{
            url: `/images/products/${encodeURIComponent(f)}`,
            publicId: f,
            isPrimary: true,
            order: 0
          }]
       };
    });
    
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully!`);
    process.exit();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

run();
