const Product = require('../models/Product');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

// Helper function to safely escape regular expression characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// Get all products with search, filter, and sorting
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, badge } = req.query;

    if (getIsMockMode()) {
      let filtered = [...store.products];

      if (search && search.trim() !== '') {
        const rawTerms = search.trim().toLowerCase().split(/\s+/);
        filtered = filtered.filter(p => {
          const searchableText = `${p.title} ${p.description} ${p.category} ${p.badge || ''}`.toLowerCase();
          return rawTerms.every(term => searchableText.includes(term));
        });
      }

      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (badge) {
        filtered = filtered.filter(p => p.badge && p.badge.toLowerCase() === badge.toLowerCase());
      }

      if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
      }

      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
      }

      // Sorting
      if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'newest') {
        filtered.reverse();
      }

      return res.json({ success: true, count: filtered.length, products: filtered });
    }

    let query = {};

    if (search && search.trim() !== '') {
      const cleanSearch = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { category: { $regex: cleanSearch, $options: 'i' } },
        { badge: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = new RegExp(escapeRegex(category), 'i');
    }

    if (badge) {
      query.badge = new RegExp(escapeRegex(badge), 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = {};
    if (sort === 'price-low') sortOptions.price = 1;
    else if (sort === 'price-high') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else sortOptions.createdAt = -1;

    const products = await Product.find(query).sort(sortOptions);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      const product = store.products.find(p => p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Product (Admin Creator)
const createProduct = async (req, res) => {
  try {
    const { title, description, price, originalPrice, discountPercentage, category, image, stock, badge } = req.body;

    if (!title || !description || !price || !category || !image) {
      return res.status(400).json({ success: false, message: 'Please fill in all required product fields' });
    }

    const calculatedOriginal = originalPrice || price;
    const calculatedDiscount = discountPercentage || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    if (getIsMockMode()) {
      const newProduct = {
        _id: 'prod_' + Date.now(),
        title,
        description,
        price: Number(price),
        originalPrice: Number(calculatedOriginal),
        discountPercentage: Number(calculatedDiscount),
        category,
        image,
        images: [image],
        stock: Number(stock) || 10,
        rating: 5.0,
        numReviews: 0,
        badge: badge || 'New',
        reviews: []
      };

      store.products.unshift(newProduct);
      return res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      originalPrice: Number(calculatedOriginal),
      discountPercentage: Number(calculatedDiscount),
      category,
      image,
      images: [image],
      stock: Number(stock) || 10,
      badge: badge || 'New'
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product (Admin Creator)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      const index = store.products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      store.products[index] = {
        ...store.products[index],
        ...req.body,
        price: req.body.price ? Number(req.body.price) : store.products[index].price,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : store.products[index].stock
      };

      return res.json({ success: true, message: 'Product updated successfully', product: store.products[index] });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product (Admin Creator)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      const index = store.products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      store.products.splice(index, 1);
      return res.json({ success: true, message: 'Product deleted successfully' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Customer Review
const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    if (getIsMockMode()) {
      const product = store.products.find(p => p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const newReview = {
        _id: 'rev_' + Date.now(),
        userId: req.user.id,
        userName: req.user.name || 'Anonymous',
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };

      product.reviews.unshift(newReview);
      product.numReviews = product.reviews.length;
      product.rating = parseFloat(
        (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1)
      );

      return res.status(201).json({ success: true, message: 'Review added successfully', reviews: product.reviews });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = {
      userId: req.user.id,
      userName: req.user.name || 'Anonymous',
      rating: Number(rating),
      comment
    };

    product.reviews.unshift(review);
    product.numReviews = product.reviews.length;
    product.rating = parseFloat(
      (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1)
    );

    await product.save();
    res.status(201).json({ success: true, message: 'Review added successfully', reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview
};
