import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'customer') {
      // Customer Dashboard
      const recentOrders = await Order.find({ customerId: userId }).sort({ createdAt: -1 }).limit(5);
      const totalOrders = await Order.countDocuments({ customerId: userId });
      const coursesEnrolled = 3; // Placeholder for now
      const wishlistCount = 8; // Placeholder for now

      return res.status(200).json({
        success: true,
        data: {
          recentOrders,
          stats: {
            ordersPlaced: totalOrders,
            wishlistItems: wishlistCount,
            coursesEnrolled,
            certificates: 1,
          }
        }
      });
    } 
    
    else if (role === 'artisan') {
      // Artisan Dashboard
      const recentOrders = await Order.find({ artisanId: userId }).sort({ createdAt: -1 }).limit(5);
      const products = await Product.find({ artisanId: userId }).sort({ createdAt: -1 }).limit(12);
      
      const totalOrders = await Order.countDocuments({ artisanId: userId });
      const totalProducts = await Product.countDocuments({ artisanId: userId });
      
      // Calculate total revenue
      const orders = await Order.find({ artisanId: userId });
      const totalRevenue = orders.reduce((acc, order) => acc + order.amount, 0);

      // Dummy revenue history for chart
      const revenueHistory = [
        { month: 'Jan', revenue: 42000 }, { month: 'Feb', revenue: 53000 }, 
        { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 67000 }, 
        { month: 'May', revenue: 59000 }, { month: 'Jun', revenue: 82000 },
        { month: 'Jul', revenue: totalRevenue > 0 ? totalRevenue : 95000 },
      ];

      return res.status(200).json({
        success: true,
        data: {
          recentOrders,
          products,
          revenueHistory,
          stats: {
            totalRevenue,
            activeOrders: totalOrders,
            totalProducts,
            courseStudents: 1240, // Mock
          }
        }
      });
    }

    else if (role === 'admin') {
      // Admin Dashboard
      const totalUsers = await User.countDocuments();
      const totalArtisans = await User.countDocuments({ role: 'artisan' });
      const totalCourses = await Course.countDocuments();
      
      // Platform GMV
      const allOrders = await Order.find();
      const totalGMV = allOrders.reduce((acc, order) => acc + order.amount, 0);

      const revenueHistory = [
        { month: 'Jan', revenue: 420000 }, { month: 'Feb', revenue: 530000 }, 
        { month: 'Mar', revenue: 480000 }, { month: 'Apr', revenue: 670000 }, 
        { month: 'May', revenue: 590000 }, { month: 'Jun', revenue: 820000 },
        { month: 'Jul', revenue: totalGMV > 0 ? totalGMV : 950000 },
      ];

      return res.status(200).json({
        success: true,
        data: {
          revenueHistory,
          stats: {
            totalVolume: totalGMV,
            activeArtisans: totalArtisans,
            pendingApprovals: 34,
            activeCourses: totalCourses,
            totalUsers
          }
        }
      });
    }

    return res.status(403).json({ success: false, message: 'Invalid role' });
    
  } catch (error) {
    next(error);
  }
};
