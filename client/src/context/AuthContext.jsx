import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vizhop_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('vizhop_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('vizhop_user', JSON.stringify(res.data.user));
        localStorage.setItem('vizhop_token', res.data.token);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      if (error.response?.data?.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          userId: error.response.data.userId,
          email: error.response.data.email,
          phone: error.response.data.phone,
          isEmailVerified: error.response.data.isEmailVerified,
          isMobileVerified: error.response.data.isMobileVerified,
          demoEmailOTP: error.response.data.demoEmailOTP,
          demoMobileOTP: error.response.data.demoMobileOTP,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('vizhop_user', JSON.stringify(res.data.user));
        localStorage.setItem('vizhop_token', res.data.token);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vizhop_user');
    localStorage.removeItem('vizhop_token');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('vizhop_user', JSON.stringify(res.data.user));
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    } finally {
      setLoading(false);
    }
  };

  const setAuthSession = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser) localStorage.setItem('vizhop_user', JSON.stringify(newUser));
    if (newToken) {
      localStorage.setItem('vizhop_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/auth/profile');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('vizhop_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const isFullyVerified = !!user && (user.isVerified || (user.isEmailVerified && user.isMobileVerified) || !!token);
  
  // Exclusive SuperAdmin guard: strictly sakthivijayarajkrv@gmail.com
  const userEmail = user?.email ? user.email.toLowerCase().trim() : '';
  const isSuperAdminEmail = userEmail === 'sakthivijayarajkrv@gmail.com' || userEmail === 'sakthivijayarjkrv@gmail.com';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdminEmail;
  
  const isSeller = user?.role === 'SELLER' || isAdmin;
  const sellerStatus = user?.sellerStatus || (isAdmin ? 'VERIFIED' : 'NONE');
  const isVerifiedSeller = sellerStatus === 'VERIFIED' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user && isFullyVerified,
        isFullyVerified,
        isAdmin,
        isSeller,
        sellerStatus,
        isVerifiedSeller,
        login,
        register,
        logout,
        updateProfile,
        setAuthSession,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
