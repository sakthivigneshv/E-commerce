const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmailOTP,
  verifyMobileOTP,
  resendOTP,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOTP);
router.post('/verify-mobile', verifyMobileOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
