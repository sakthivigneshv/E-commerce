import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';
import LogoSplashScreen from './components/LogoSplashScreen';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';

// Protected Route Wrapper - Requires Login & Dual Verification
const RequireVerifiedAuth = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/register" replace />;
};

// Admin Route Wrapper - Strictly for Creator Admin
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const { isLoggedIn } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('vizhop_splash_seen');
  });

  const handleEnterStore = () => {
    setShowSplash(false);
    sessionStorage.setItem('vizhop_splash_seen', 'true');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showSplash && <LogoSplashScreen onEnter={handleEnterStore} />}

      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Main Store Pages */}
          <Route path="/" element={<RequireVerifiedAuth><HomePage /></RequireVerifiedAuth>} />
          <Route path="/shop" element={<RequireVerifiedAuth><ShopPage /></RequireVerifiedAuth>} />
          <Route path="/product/:id" element={<RequireVerifiedAuth><ProductDetailPage /></RequireVerifiedAuth>} />
          <Route path="/cart" element={<RequireVerifiedAuth><CartPage /></RequireVerifiedAuth>} />
          <Route path="/checkout" element={<RequireVerifiedAuth><CheckoutPage /></RequireVerifiedAuth>} />
          <Route path="/order-confirmation/:orderId" element={<RequireVerifiedAuth><OrderConfirmationPage /></RequireVerifiedAuth>} />
          <Route path="/profile" element={<RequireVerifiedAuth><ProfilePage /></RequireVerifiedAuth>} />

          {/* Seller Portal Route */}
          <Route path="/seller" element={<RequireVerifiedAuth><SellerDashboard /></RequireVerifiedAuth>} />

          {/* Admin Route - Protected Creator Only */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Authentication & Verification Onboarding Routes */}
          <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/register"} replace />} />
        </Routes>
      </main>
      <Footer />
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

