const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { getIsMockMode } = require('../config/db');
const store = require('../utils/mockStore');

// Place Order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method are required' });
    }

    if (getIsMockMode()) {
      const newOrder = {
        _id: 'ord_' + Date.now(),
        userId,
        orderItems: orderItems.map(item => ({
          product: item.productId || item.product._id || item.product,
          title: item.title || item.product.title,
          image: item.image || item.product.image,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        itemsPrice: Number(itemsPrice),
        taxPrice: Number(taxPrice || 0),
        shippingPrice: Number(shippingPrice || 0),
        totalPrice: Number(totalPrice),
        orderStatus: 'Processing',
        isDelivered: false,
        createdAt: new Date()
      };

      store.orders.unshift(newOrder);
      // Clear user cart
      store.carts[userId] = { items: [], totalAmount: 0 };

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: newOrder
      });
    }

    const order = new Order({
      userId,
      orderItems: orderItems.map(item => ({
        product: item.productId || item.product._id || item.product,
        title: item.title || item.product.title,
        image: item.image || item.product.image,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      itemsPrice: Number(itemsPrice),
      taxPrice: Number(taxPrice || 0),
      shippingPrice: Number(shippingPrice || 0),
      totalPrice: Number(totalPrice),
      orderStatus: 'Processing'
    });

    const createdOrder = await order.save();

    // Clear cart in MongoDB
    await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: createdOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (getIsMockMode()) {
      const userOrders = store.orders.filter(o => o.userId === userId);
      return res.json({ success: true, count: userOrders.length, orders: userOrders });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Order By ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMockMode()) {
      const order = store.orders.find(o => o._id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    }

    const order = await Order.findById(id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    if (getIsMockMode()) {
      return res.json({ success: true, count: store.orders.length, orders: store.orders });
    }

    const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value' });
    }

    if (getIsMockMode()) {
      const order = store.orders.find(o => o._id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        order.paymentStatus = 'Paid';
      }

      return res.json({ success: true, message: `Order status updated to ${orderStatus}`, order });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.paymentStatus = 'Paid';
    }

    const updatedOrder = await order.save();
    res.json({ success: true, message: `Order status updated to ${orderStatus}`, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
