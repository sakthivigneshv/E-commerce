const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Image URL is required']
    },
    images: [{ type: String }],
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 10
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: '' // 'Trending', 'Best Seller', 'Hot Deal', 'New'
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sellerName: {
      type: String,
      default: 'VizHop Official'
    },
    isSellerProduct: {
      type: Boolean,
      default: false
    },
    reviews: [reviewSchema],
    specifications: {
      type: Map,
      of: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
