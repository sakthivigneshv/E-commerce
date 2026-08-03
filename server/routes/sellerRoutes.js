const express = require('express');
const router = express.Router();
const {
  applySeller,
  getSellerProfile,
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  updateProductPrice,
  deleteSellerProduct
} = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');
const { sellerOnly, verifiedSellerOnly } = require('../middleware/sellerMiddleware');

// Seller Application & Profile (Protected User Endpoints)
router.post('/apply', protect, applySeller);
router.get('/profile', protect, getSellerProfile);

// Seller Products Management
router.get('/products', protect, sellerOnly, getSellerProducts);
router.post('/products', protect, sellerOnly, verifiedSellerOnly, addSellerProduct);
router.put('/products/:id', protect, sellerOnly, verifiedSellerOnly, updateSellerProduct);
router.patch('/products/:id/price', protect, sellerOnly, verifiedSellerOnly, updateProductPrice);
router.delete('/products/:id', protect, sellerOnly, verifiedSellerOnly, deleteSellerProduct);

module.exports = router;
