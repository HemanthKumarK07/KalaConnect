import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Course from './models/Course.js';
import CommunityPost from './models/CommunityPost.js';

export const runSeed = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    console.log('Database empty. Seeding data...');
    
    // Find users
    let artisanUser = await User.findOne({ role: 'artisan' });
    let customerUser = await User.findOne({ role: 'customer' });
    let adminUser = await User.findOne({ role: 'admin' });

    // Ensure we have users to link to
    if (!artisanUser) {
        artisanUser = await User.create({ name: 'Lakshmi Devi', email: 'artisan@test.com', password: 'password123', role: 'artisan' });
    }
    if (!customerUser) {
        customerUser = await User.create({ name: 'Priya Menon', email: 'customer@test.com', password: 'password123', role: 'customer' });
    }
    if (!adminUser) {
        adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
    }

    // 1. Create Products
    const products = await Product.insertMany([
      { title: 'Azure Bloom Vase - Jaipur Blue Pottery', shortTitle: 'Azure Bloom Vase', price: 3200, originalPrice: 4500, artisanId: artisanUser._id, artisanName: artisanUser.name, category: 'pottery', sold: 234, inStock: true, rating: 4.9 },
      { title: 'Kani Pashmina Shawl', shortTitle: 'Kani Pashmina', price: 28000, artisanId: artisanUser._id, artisanName: artisanUser.name, category: 'textiles', sold: 45, inStock: true, rating: 5.0 },
      { title: 'Dhokra Owl Earrings', shortTitle: 'Dhokra Earrings', price: 980, artisanId: artisanUser._id, artisanName: artisanUser.name, category: 'jewelry', sold: 432, inStock: false, rating: 4.7 }
    ]);

    // 2. Create Orders
    await Order.insertMany([
      { orderNumber: '#ORD-7841', customerId: customerUser._id, customerName: customerUser.name, artisanId: artisanUser._id, productName: products[0].shortTitle, amount: 3200, status: 'Shipped' },
      { orderNumber: '#ORD-7840', customerId: customerUser._id, customerName: customerUser.name, artisanId: artisanUser._id, productName: products[1].shortTitle, amount: 28000, status: 'Processing' },
      { orderNumber: '#ORD-7839', customerId: customerUser._id, customerName: customerUser.name, artisanId: artisanUser._id, productName: products[2].shortTitle, amount: 4800, status: 'Delivered' },
      { orderNumber: '#ORD-7838', customerId: adminUser._id, customerName: adminUser.name, artisanId: artisanUser._id, productName: 'Warli Coaster Set', amount: 850, status: 'Delivered' }
    ]);

    // 3. Create Courses
    await Course.insertMany([
      { title: 'Mastering Jaipur Blue Pottery', instructorId: artisanUser._id, instructorName: artisanUser.name, enrolledStudents: 1240, rating: 4.9 },
      { title: 'Introduction to Warli Art', instructorId: adminUser._id, instructorName: 'Suresh Sir', enrolledStudents: 3400, rating: 4.8 }
    ]);

    // 4. Create Community Posts
    await CommunityPost.insertMany([
      { authorId: artisanUser._id, authorName: artisanUser.name, authorRole: 'Verified Artisan', title: 'Tips for perfect turquoise glaze', content: 'The secret lies in the firing temperature...', topicId: 'topic-02', topic: 'Pottery & Ceramics', likes: 312, comments: 67 },
      { authorId: customerUser._id, authorName: customerUser.name, authorRole: 'Learner', title: 'My first Warli painting', content: 'After 3 weeks with the course, I finished my first piece!', topicId: 'topic-07', topic: 'Student Showcase', likes: 189, comments: 32 }
    ]);

    console.log('✅ Data Seeded Successfully!');
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
  }
};
