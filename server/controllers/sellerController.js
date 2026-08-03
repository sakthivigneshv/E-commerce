const Product = require('../models/Product');
const User = require('../models/User');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

// Submit Seller Verification Application
const applySeller = async (req, res) => {
  try {
    const { storeName, storeDescription, businessEmail, businessPhone, verificationDoc } = req.body;

    if (!storeName || !businessEmail || !businessPhone) {
      return res.status(400).json({
        success: false,
        message: 'Store Name, Business Email, and Business Phone are required'
      });
    }

    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

      user.role = 'SELLER';
      user.sellerStatus = 'PENDING';
      user.storeName = storeName;
      user.storeDescription = storeDescription || '';
      user.businessEmail = businessEmail;
      user.businessPhone = businessPhone;
      user.verificationDoc = verificationDoc || '';
      user.rejectionReason = '';

      return res.json({
        success: true,
        message: 'Seller application submitted successfully! Pending Admin verification.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          sellerStatus: user.sellerStatus,
          storeName: user.storeName,
          storeDescription: user.storeDescription,
          businessEmail: user.businessEmail,
          businessPhone: user.businessPhone,
          verificationDoc: user.verificationDoc
        }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

    user.role = 'SELLER';
    user.sellerStatus = 'PENDING';
    user.storeName = storeName;
    user.storeDescription = storeDescription || '';
    user.businessEmail = businessEmail;
    user.businessPhone = businessPhone;
    user.verificationDoc = verificationDoc || '';
    user.rejectionReason = '';

    await user.save();

    res.json({
      success: true,
      message: 'Seller application submitted successfully! Pending Admin verification.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sellerStatus: user.sellerStatus,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        businessEmail: user.businessEmail,
        businessPhone: user.businessPhone,
        verificationDoc: user.verificationDoc
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Seller Profile & Status
const getSellerProfile = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const user = store.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

      return res.json({
        success: true,
        seller: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus || 'NONE',
          storeName: user.storeName || '',
          storeDescription: user.storeDescription || '',
          businessEmail: user.businessEmail || '',
          businessPhone: user.businessPhone || '',
          taxId: user.taxId || '',
          verificationDoc: user.verificationDoc || '',
          rejectionReason: user.rejectionReason || ''
        }
      });
    }

    const user = await User.findById(req.user.id).select('-password -emailOTP -mobileOTP');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, seller: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Products Listed By Seller
const getSellerProducts = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const products = store.products.filter(p => p.sellerId === req.user.id || req.user.role === 'ADMIN');
      return res.json({ success: true, count: products.length, products });
    }

    const query = req.user.role === 'ADMIN' ? {} : { sellerId: req.user.id };
    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add New Product in Seller Panel (Verified Sellers Only)
const addSellerProduct = async (req, res) => {
  try {
    const { title, description, price, originalPrice, category, image, stock, badge } = req.body;

    if (!title || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, price, category, and main image URL'
      });
    }

    const numericPrice = parseFloat(price);
    const numericOrigPrice = originalPrice ? parseFloat(originalPrice) : numericPrice;
    const discountPercentage = numericOrigPrice > numericPrice
      ? Math.round(((numericOrigPrice - numericPrice) / numericOrigPrice) * 100)
      : 0;

    if (getIsMockMode()) {
      const sellerUser = store.users.find(u => u._id === req.user.id) || req.user;
      const sellerName = sellerUser.storeName || sellerUser.name || 'Seller Store';

      const newProduct = {
        _id: 'prod_seller_' + Date.now(),
        title,
        description,
        price: numericPrice,
        originalPrice: numericOrigPrice,
        discountPercentage,
        category,
        image,
        images: [image],
        stock: parseInt(stock) || 10,
        rating: 4.5,
        numReviews: 0,
        badge: badge || 'New',
        sellerId: req.user.id,
        sellerName,
        isSellerProduct: true,
        reviews: []
      };

      store.products.unshift(newProduct);

      return res.status(201).json({
        success: true,
        message: 'New product listed successfully in seller catalog!',
        product: newProduct
      });
    }

    const sellerUser = await User.findById(req.user.id);
    const sellerName = sellerUser ? (sellerUser.storeName || sellerUser.name) : 'Seller Store';

    const product = await Product.create({
      title,
      description,
      price: numericPrice,
      originalPrice: numericOrigPrice,
      discountPercentage,
      category,
      image,
      images: [image],
      stock: parseInt(stock) || 10,
      badge: badge || '',
      sellerId: req.user.id,
      sellerName,
      isSellerProduct: true
    });

    res.status(201).json({
      success: true,
      message: 'New product listed successfully in seller catalog!',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit Seller Product
const updateSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, originalPrice, category, image, stock, badge } = req.body;

    if (getIsMockMode()) {
      const index = store.products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      // Ensure seller owns the product (unless admin)
      if (req.user.role !== 'ADMIN' && store.products[index].sellerId && store.products[index].sellerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to edit this product' });
      }

      const prod = store.products[index];
      if (title) prod.title = title;
      if (description) prod.description = description;
      if (price !== undefined) {
        prod.price = parseFloat(price);
        if (originalPrice) prod.originalPrice = parseFloat(originalPrice);
        if (prod.originalPrice > prod.price) {
          prod.discountPercentage = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
        }
      }
      if (category) prod.category = category;
      if (image) prod.image = image;
      if (stock !== undefined) prod.stock = parseInt(stock);
      if (badge !== undefined) prod.badge = badge;

      return res.json({
        success: true,
        message: 'Product details updated successfully',
        product: prod
      });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role !== 'ADMIN' && product.sellerId && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this product' });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) {
      product.price = parseFloat(price);
      if (originalPrice) product.originalPrice = parseFloat(originalPrice);
      if (product.originalPrice > product.price) {
        product.discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }
    }
    if (category) product.category = category;
    if (image) product.image = image;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (badge !== undefined) product.badge = badge;

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Product details updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fast Price Change Endpoint (Seller Panel feature)
const updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, originalPrice } = req.body;

    if (price === undefined || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    const newPrice = parseFloat(price);
    const newOrigPrice = originalPrice !== undefined ? parseFloat(originalPrice) : newPrice;
    const discountPercentage = newOrigPrice > newPrice
      ? Math.round(((newOrigPrice - newPrice) / newOrigPrice) * 100)
      : 0;

    if (getIsMockMode()) {
      const prod = store.products.find(p => p._id === id);
      if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

      if (req.user.role !== 'ADMIN' && prod.sellerId && prod.sellerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify price of this product' });
      }

      prod.price = newPrice;
      prod.originalPrice = newOrigPrice;
      prod.discountPercentage = discountPercentage;

      return res.json({
        success: true,
        message: `Product price updated to $${newPrice.toFixed(2)} successfully!`,
        product: prod
      });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role !== 'ADMIN' && product.sellerId && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify price of this product' });
    }

    product.price = newPrice;
    product.originalPrice = newOrigPrice;
    product.discountPercentage = discountPercentage;

    await product.save();

    res.json({
      success: true,
      message: `Product price updated to $${newPrice.toFixed(2)} successfully!`,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Seller Product
const deleteSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      const index = store.products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      if (req.user.role !== 'ADMIN' && store.products[index].sellerId && store.products[index].sellerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this product' });
      }

      store.products.splice(index, 1);
      return res.json({ success: true, message: 'Product deleted from seller catalog' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role !== 'ADMIN' && product.sellerId && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted from seller catalog' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applySeller,
  getSellerProfile,
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  updateProductPrice,
  deleteSellerProduct
};
