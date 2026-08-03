const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

// Get User Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (getIsMockMode()) {
      if (!store.carts[userId]) {
        store.carts[userId] = { items: [], totalAmount: 0 };
      }
      return res.json({ success: true, cart: store.carts[userId] });
    }

    let cart = await Cart.findOne({ userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (getIsMockMode()) {
      const product = store.products.find(p => p._id === productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      if (!store.carts[userId]) {
        store.carts[userId] = { items: [], totalAmount: 0 };
      }

      const cart = store.carts[userId];
      const existingItemIndex = cart.items.findIndex(item => item.product._id === productId);

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += Number(quantity);
      } else {
        cart.items.push({
          _id: 'cart_item_' + Date.now(),
          product: product,
          quantity: Number(quantity),
          price: product.price
        });
      }

      cart.totalAmount = parseFloat(
        cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );

      return res.json({ success: true, message: 'Item added to cart', cart });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: product.price
      });
    }

    cart.totalAmount = parseFloat(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ userId }).populate('items.product');

    res.json({ success: true, message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }

    if (getIsMockMode()) {
      const cart = store.carts[userId];
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      const index = cart.items.findIndex(item => item.product._id === productId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

      if (Number(quantity) <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = Number(quantity);
      }

      cart.totalAmount = parseFloat(
        cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );

      return res.json({ success: true, message: 'Cart updated', cart });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const index = cart.items.findIndex(item => item.product.toString() === productId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (Number(quantity) <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = Number(quantity);
    }

    cart.totalAmount = parseFloat(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ userId }).populate('items.product');

    res.json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (getIsMockMode()) {
      const cart = store.carts[userId];
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      cart.items = cart.items.filter(item => item.product._id !== productId);
      cart.totalAmount = parseFloat(
        cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );

      return res.json({ success: true, message: 'Item removed from cart', cart });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.totalAmount = parseFloat(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ userId }).populate('items.product');

    res.json({ success: true, message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (getIsMockMode()) {
      store.carts[userId] = { items: [], totalAmount: 0 };
      return res.json({ success: true, message: 'Cart cleared', cart: store.carts[userId] });
    }

    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    res.json({ success: true, message: 'Cart cleared', cart: { items: [], totalAmount: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};
