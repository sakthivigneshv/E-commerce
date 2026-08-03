const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['USER', 'SELLER', 'ADMIN'],
      default: 'USER'
    },
    sellerStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NONE'
    },
    storeName: { type: String, default: '' },
    storeDescription: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    verificationDoc: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isMobileVerified: {
      type: Boolean,
      default: false
    },
    emailOTP: {
      type: String,
      default: null
    },
    mobileOTP: {
      type: String,
      default: null
    },
    emailOTPExpires: {
      type: Date,
      default: null
    },
    mobileOTPExpires: {
      type: Date,
      default: null
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'USA' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
