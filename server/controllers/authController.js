const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

const generateToken = (id, role, name, email) => {
  return jwt.sign(
    { id, role, name, email },
    process.env.JWT_SECRET || 'vizhop_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// Helper function to generate 6-digit random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register User (Step 1: Sign Up)
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Name, Email, Mobile Phone, and Password' });
    }

    // Restrict ADMIN role strictly to sakthivijayarajkrv@gmail.com with phone 7358409336
    const isSuperAdminCredential = email.toLowerCase() === 'sakthivijayarajkrv@gmail.com' && phone.toString().trim() === '7358409336';
    
    let assignedRole = 'USER';
    if (isSuperAdminCredential) {
      assignedRole = 'ADMIN';
    } else if (role === 'SELLER') {
      assignedRole = 'SELLER';
    }

    const sellerStatus = assignedRole === 'ADMIN' ? 'VERIFIED' : (assignedRole === 'SELLER' ? 'PENDING' : 'NONE');
    const emailOTP = generateOTP();
    const mobileOTP = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    if (getIsMockMode()) {
      const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash: bcrypt.hashSync(password, 10),
        role: assignedRole,
        sellerStatus,
        storeName: req.body.storeName || (assignedRole === 'SELLER' ? name + "'s Store" : ''),
        storeDescription: req.body.storeDescription || '',
        businessEmail: req.body.businessEmail || email,
        businessPhone: req.body.businessPhone || phone,
        taxId: req.body.taxId || '',
        verificationDoc: req.body.verificationDoc || '',
        rejectionReason: '',
        isEmailVerified: false,
        isMobileVerified: false,
        emailOTP,
        mobileOTP,
        emailOTPExpires: otpExpires,
        mobileOTPExpires: otpExpires,
        address: req.body.address || { street: '', city: '', state: '', zip: '', country: 'USA' }
      };

      store.users.push(newUser);

      console.log(`[VizHop OTP Dispatch] Email OTP for ${email}: ${emailOTP} | Mobile OTP for ${phone}: ${mobileOTP}`);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Verification OTPs sent to your Email and Mobile number.',
        userId: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        demoEmailOTP: emailOTP,
        demoMobileOTP: mobileOTP
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: assignedRole,
      sellerStatus,
      storeName: req.body.storeName || (assignedRole === 'SELLER' ? name + "'s Store" : ''),
      storeDescription: req.body.storeDescription || '',
      businessEmail: req.body.businessEmail || email,
      businessPhone: req.body.businessPhone || phone,
      taxId: req.body.taxId || '',
      verificationDoc: req.body.verificationDoc || '',
      rejectionReason: '',
      isEmailVerified: false,
      isMobileVerified: false,
      emailOTP,
      mobileOTP,
      emailOTPExpires: otpExpires,
      mobileOTPExpires: otpExpires,
      address: req.body.address
    });

    console.log(`[VizHop OTP Dispatch] Email OTP for ${email}: ${emailOTP} | Mobile OTP for ${phone}: ${mobileOTP}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTPs sent to your Email and Mobile number.',
      userId: user._id,
      email: user.email,
      phone: user.phone,
      demoEmailOTP: emailOTP,
      demoMobileOTP: mobileOTP
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email OTP
const verifyEmailOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and Email OTP are required' });
    }

    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

      if (user.emailOTP !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid Email Verification OTP code' });
      }

      user.isEmailVerified = true;
      user.emailOTP = null;

      let token = null;
      if (user.isMobileVerified) {
        token = generateToken(user._id, user.role, user.name, user.email);
      }

      return res.json({
        success: true,
        message: 'Email address verified successfully!',
        isEmailVerified: true,
        isMobileVerified: user.isMobileVerified,
        token,
        user: token ? {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        } : null
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

    if (user.emailOTP !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid Email Verification OTP code' });
    }

    user.isEmailVerified = true;
    user.emailOTP = null;
    await user.save();

    let token = null;
    if (user.isMobileVerified) {
      token = generateToken(user._id, user.role, user.name, user.email);
    }

    res.json({
      success: true,
      message: 'Email address verified successfully!',
      isEmailVerified: true,
      isMobileVerified: user.isMobileVerified,
      token,
      user: token ? {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Mobile OTP
const verifyMobileOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and Mobile OTP are required' });
    }

    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

      if (user.mobileOTP !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid Mobile Verification OTP code' });
      }

      user.isMobileVerified = true;
      user.mobileOTP = null;

      let token = null;
      if (user.isEmailVerified) {
        token = generateToken(user._id, user.role, user.name, user.email);
      }

      return res.json({
        success: true,
        message: 'Mobile number verified successfully! Access granted.',
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: true,
        token,
        user: token ? {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        } : null
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

    if (user.mobileOTP !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid Mobile Verification OTP code' });
    }

    user.isMobileVerified = true;
    user.mobileOTP = null;
    await user.save();

    let token = null;
    if (user.isEmailVerified) {
      token = generateToken(user._id, user.role, user.name, user.email);
    }

    res.json({
      success: true,
      message: 'Mobile number verified successfully! Access granted.',
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: true,
      token,
      user: token ? {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP Code
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const newEmailOTP = generateOTP();
    const newMobileOTP = generateOTP();

    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

      user.emailOTP = newEmailOTP;
      user.mobileOTP = newMobileOTP;

      console.log(`[VizHop Resend OTP] Email OTP: ${newEmailOTP} | Mobile OTP: ${newMobileOTP}`);

      return res.json({
        success: true,
        message: 'New OTP verification codes sent!',
        demoEmailOTP: newEmailOTP,
        demoMobileOTP: newMobileOTP
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

    user.emailOTP = newEmailOTP;
    user.mobileOTP = newMobileOTP;
    await user.save();

    res.json({
      success: true,
      message: 'New OTP verification codes sent!',
      demoEmailOTP: newEmailOTP,
      demoMobileOTP: newMobileOTP
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User (Step 2: Sign In)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    if (getIsMockMode()) {
      const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && bcrypt.compareSync(password, user.passwordHash)) {
        if (!user.isEmailVerified || !user.isMobileVerified) {
          return res.status(403).json({
            success: false,
            needsVerification: true,
            userId: user._id,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified,
            demoEmailOTP: user.emailOTP || generateOTP(),
            demoMobileOTP: user.mobileOTP || generateOTP(),
            message: 'Please complete Email and Mobile Number verification before logging in.'
          });
        }

        const token = generateToken(user._id, user.role, user.name, user.email);
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            sellerStatus: user.sellerStatus || 'NONE',
            storeName: user.storeName || '',
            storeDescription: user.storeDescription || '',
            businessEmail: user.businessEmail || user.email,
            businessPhone: user.businessPhone || user.phone,
            taxId: user.taxId || '',
            verificationDoc: user.verificationDoc || '',
            rejectionReason: user.rejectionReason || '',
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified,
            address: user.address
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified || !user.isMobileVerified) {
        return res.status(403).json({
          success: false,
          needsVerification: true,
          userId: user._id,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified,
          demoEmailOTP: user.emailOTP || generateOTP(),
          demoMobileOTP: user.mobileOTP || generateOTP(),
          message: 'Please complete Email and Mobile Number verification before logging in.'
        });
      }

      const token = generateToken(user._id, user.role, user.name, user.email);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          sellerStatus: user.sellerStatus || 'NONE',
          storeName: user.storeName || '',
          storeDescription: user.storeDescription || '',
          businessEmail: user.businessEmail || user.email,
          businessPhone: user.businessPhone || user.phone,
          taxId: user.taxId || '',
          verificationDoc: user.verificationDoc || '',
          rejectionReason: user.rejectionReason || '',
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified,
          address: user.address
        }
      });
    }

    res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile
const getUserProfile = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          sellerStatus: user.sellerStatus || 'NONE',
          storeName: user.storeName || '',
          storeDescription: user.storeDescription || '',
          businessEmail: user.businessEmail || user.email,
          businessPhone: user.businessPhone || user.phone,
          taxId: user.taxId || '',
          verificationDoc: user.verificationDoc || '',
          rejectionReason: user.rejectionReason || '',
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified,
          address: user.address
        }
      });
    }

    const user = await User.findById(req.user.id).select('-password -emailOTP -mobileOTP');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (getIsMockMode()) {
      const userIndex = store.users.findIndex(u => u._id === req.user.id);
      if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) store.users[userIndex].name = name;
      if (phone) store.users[userIndex].phone = phone;
      if (address) store.users[userIndex].address = { ...store.users[userIndex].address, ...address };

      const u = store.users[userIndex];
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          address: u.address
        }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (address) {
      user.address = { ...user.address, ...address };
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyEmailOTP,
  verifyMobileOTP,
  resendOTP,
  loginUser,
  getUserProfile,
  updateUserProfile
};
