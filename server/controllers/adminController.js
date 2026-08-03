const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const AdminConfig = require('../models/Admin');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

// Get Dashboard Analytics & Overview Stats
const getDashboardStats = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const totalRevenue = store.orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalPrice : 0), 0);
      const totalOrders = store.orders.length;
      const totalProducts = store.products.length;
      const totalUsers = store.users.length;
      const recentOrders = store.orders.slice(0, 5);

      const categoryDistribution = store.products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      return res.json({
        success: true,
        stats: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          totalProducts,
          totalUsers,
          recentOrders,
          categoryDistribution,
          announcement: store.announcement
        }
      });
    }

    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalPrice : 0), 0);
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');

    let adminConfig = await AdminConfig.findOne({});
    if (!adminConfig) {
      adminConfig = await AdminConfig.create({
        banners: store.banners,
        categories: store.categories,
        announcement: store.announcement
      });
    }

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        announcement: adminConfig.announcement
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Banners
const getBanners = async (req, res) => {
  try {
    if (getIsMockMode()) {
      return res.json({ success: true, banners: store.banners });
    }

    let config = await AdminConfig.findOne({});
    if (!config) {
      config = await AdminConfig.create({ banners: store.banners, categories: store.categories });
    }
    res.json({ success: true, banners: config.banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Banner
const addBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and Image URL are required for banner' });
    }

    if (getIsMockMode()) {
      const newBanner = {
        _id: 'banner_' + Date.now(),
        title,
        subtitle: subtitle || '',
        imageUrl,
        linkUrl: linkUrl || '/shop',
        active: true
      };
      store.banners.unshift(newBanner);
      return res.status(201).json({ success: true, message: 'Banner added successfully', banner: newBanner });
    }

    let config = await AdminConfig.findOne({});
    if (!config) {
      config = new AdminConfig({});
    }

    const banner = { title, subtitle: subtitle || '', imageUrl, linkUrl: linkUrl || '/shop', active: true };
    config.banners.unshift(banner);
    await config.save();

    res.status(201).json({ success: true, message: 'Banner added successfully', banners: config.banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      store.banners = store.banners.filter(b => b._id !== id);
      return res.json({ success: true, message: 'Banner deleted' });
    }

    let config = await AdminConfig.findOne({});
    if (config) {
      config.banners = config.banners.filter(b => b._id.toString() !== id);
      await config.save();
    }
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Categories
const getCategories = async (req, res) => {
  try {
    if (getIsMockMode()) {
      return res.json({ success: true, categories: store.categories });
    }

    let config = await AdminConfig.findOne({});
    if (!config || !config.categories || config.categories.length === 0) {
      return res.json({ success: true, categories: store.categories });
    }
    res.json({ success: true, categories: config.categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Category
const addCategory = async (req, res) => {
  try {
    const { name, description, icon, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    if (getIsMockMode()) {
      const newCat = {
        _id: 'cat_' + Date.now(),
        name,
        description: description || '',
        icon: icon || 'Package',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=400&q=80'
      };
      store.categories.push(newCat);
      return res.status(201).json({ success: true, message: 'Category added', category: newCat });
    }

    let config = await AdminConfig.findOne({});
    if (!config) config = new AdminConfig({});

    const newCat = { name, description: description || '', icon: icon || 'Package', imageUrl: imageUrl || '' };
    config.categories.push(newCat);
    await config.save();

    res.status(201).json({ success: true, message: 'Category added', categories: config.categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get List of All Sellers and Applications
const getSellersList = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const sellers = store.users.filter(u => u.role === 'SELLER' || u.sellerStatus !== 'NONE');
      return res.json({ success: true, count: sellers.length, sellers });
    }

    const sellers = await User.find({
      $or: [{ role: 'SELLER' }, { sellerStatus: { $ne: 'NONE' } }]
    }).select('-password -emailOTP -mobileOTP').sort({ createdAt: -1 });

    res.json({ success: true, count: sellers.length, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Verify or Reject Seller Account (Admin Only)
const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'VERIFIED' or 'REJECTED'" });
    }

    if (getIsMockMode()) {
      const sellerUser = store.users.find(u => u._id === id);
      if (!sellerUser) return res.status(404).json({ success: false, message: 'Seller account not found' });

      sellerUser.sellerStatus = status;
      if (status === 'VERIFIED') {
        sellerUser.role = 'SELLER';
        sellerUser.rejectionReason = '';
      } else {
        sellerUser.rejectionReason = rejectionReason || 'Application rejected by admin';
      }

      return res.json({
        success: true,
        message: `Seller status updated to ${status} successfully!`,
        seller: sellerUser
      });
    }

    const sellerUser = await User.findById(id);
    if (!sellerUser) return res.status(404).json({ success: false, message: 'Seller account not found' });

    sellerUser.sellerStatus = status;
    if (status === 'VERIFIED') {
      sellerUser.role = 'SELLER';
      sellerUser.rejectionReason = '';
    } else {
      sellerUser.rejectionReason = rejectionReason || 'Application rejected by admin';
    }

    await sellerUser.save();

    res.json({
      success: true,
      message: `Seller status updated to ${status} successfully!`,
      seller: sellerUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get List of All Registered Users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    if (getIsMockMode()) {
      return res.json({ success: true, count: store.users.length, users: store.users });
    }

    const users = await User.find({}).select('-password -emailOTP -mobileOTP').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getBanners,
  addBanner,
  deleteBanner,
  getCategories,
  addCategory,
  getSellersList,
  verifySeller,
  getAllUsers
};
