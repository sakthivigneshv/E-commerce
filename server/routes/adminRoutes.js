const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getBanners,
  addBanner,
  deleteBanner,
  getCategories,
  addCategory,
  getSellersList,
  verifySeller,
  getAllUsers
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public or User accessible categories & banners
router.get('/banners', getBanners);
router.get('/categories', getCategories);

// Admin Protected Routes (Strictly Restricted to Creator SuperAdmin sakthivijayarajkrv@gmail.com & 7358409336)
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/banners', protect, adminOnly, addBanner);
router.delete('/banners/:id', protect, adminOnly, deleteBanner);
router.post('/categories', protect, adminOnly, addCategory);

// Seller Verification Management Routes
router.get('/sellers', protect, adminOnly, getSellersList);
router.put('/sellers/:id/verify', protect, adminOnly, verifySeller);

module.exports = router;
