const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '/shop' },
  active: { type: Boolean, default: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Package' },
  imageUrl: { type: String, default: '' }
});

const adminSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'VizHop' },
    banners: [bannerSchema],
    categories: [categorySchema],
    announcement: { type: String, default: '🚀 Free shipping on all orders over $50! Use code VIZHOP2026' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminConfig', adminSchema);
