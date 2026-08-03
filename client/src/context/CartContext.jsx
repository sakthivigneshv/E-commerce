import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCart = async () => {
    if (!isLoggedIn) {
      // Local storage fallback for guest users
      const guestCart = localStorage.getItem('vizhop_guest_cart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          setCart(parsed);
        } catch (e) {
          setCart({ items: [], totalAmount: 0 });
        }
      } else {
        setCart({ items: [], totalAmount: 0 });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('/api/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]);

  const addToCart = async (product, quantity = 1) => {
    const prodId = product._id || product.id;

    if (!isLoggedIn) {
      const existingCart = { ...cart };
      const index = existingCart.items.findIndex(item => item.product._id === prodId || item.product.id === prodId);

      if (index > -1) {
        existingCart.items[index].quantity += Number(quantity);
      } else {
        existingCart.items.push({
          _id: 'guest_' + Date.now(),
          product: product,
          quantity: Number(quantity),
          price: product.price
        });
      }

      existingCart.totalAmount = parseFloat(
        existingCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
      );

      setCart(existingCart);
      localStorage.setItem('vizhop_guest_cart', JSON.stringify(existingCart));
      showToast(`Added ${product.title} to cart!`);
      return;
    }

    try {
      const res = await axios.post('/api/cart/add', { productId: prodId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        showToast(`Added ${product.title} to cart!`);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not add item to cart', 'error');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isLoggedIn) {
      const existingCart = { ...cart };
      const index = existingCart.items.findIndex(item => item.product._id === productId || item.product.id === productId);

      if (index > -1) {
        if (quantity <= 0) {
          existingCart.items.splice(index, 1);
        } else {
          existingCart.items[index].quantity = Number(quantity);
        }
        existingCart.totalAmount = parseFloat(
          existingCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
        );
        setCart(existingCart);
        localStorage.setItem('vizhop_guest_cart', JSON.stringify(existingCart));
      }
      return;
    }

    try {
      const res = await axios.put('/api/cart/update', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) {
      const existingCart = { ...cart };
      existingCart.items = existingCart.items.filter(
        item => item.product._id !== productId && item.product.id !== productId
      );
      existingCart.totalAmount = parseFloat(
        existingCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
      );
      setCart(existingCart);
      localStorage.setItem('vizhop_guest_cart', JSON.stringify(existingCart));
      showToast('Item removed from cart');
      return;
    }

    try {
      const res = await axios.delete(`/api/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        showToast('Item removed from cart');
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) {
      const emptyCart = { items: [], totalAmount: 0 };
      setCart(emptyCart);
      localStorage.removeItem('vizhop_guest_cart');
      return;
    }

    try {
      const res = await axios.delete('/api/cart/clear');
      if (res.data.success) {
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalCount,
        loading,
        toast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
