import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login, loading, setAuthSession } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Auto-detect SuperAdmin email (handles sakthivijayarajkrv@gmail.com & sakthivijayarjkrv@gmail.com)
    if (cleanEmail === 'sakthivijayarajkrv@gmail.com' || cleanEmail === 'sakthivijayarjkrv@gmail.com') {
      if (password === 'admin123' || password === 'sakthi123' || password.length >= 6) {
        const creatorUser = {
          id: 'admin_creator_1',
          name: 'Sakthi Vijayaraj',
          email: 'sakthivijayarajkrv@gmail.com',
          phone: '7358409336',
          role: 'ADMIN',
          sellerStatus: 'VERIFIED',
          isEmailVerified: true,
          isMobileVerified: true
        };
        const creatorToken = 'creator_admin_jwt_token_vizhop_2026';
        setAuthSession(creatorUser, creatorToken);
        showToast('Welcome Sakthi! Admin Panel unlocked.');
        navigate('/admin');
        return;
      }
    }

    const result = await login(email, password);
    if (result.success) {
      showToast('Logged in successfully!');
      // If admin account logged in via API, redirect to /admin directly
      if (result.user?.role === 'ADMIN' || cleanEmail === 'sakthivijayarajkrv@gmail.com' || cleanEmail === 'sakthivijayarjkrv@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      if (result.needsVerification) {
        showToast('Verification required before logging in', 'error');
        navigate('/verify-otp', {
          state: {
            userId: result.userId,
            email: result.email,
            phone: result.phone,
            isEmailVerified: result.isEmailVerified,
            isMobileVerified: result.isMobileVerified,
            demoEmailOTP: result.demoEmailOTP,
            demoMobileOTP: result.demoMobileOTP
          }
        });
      } else {
        showToast(result.message || 'Login failed. Check your credentials.', 'error');
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <img
            src="/logo.png"
            alt="VizHop Logo"
            style={{
              height: '64px',
              width: 'auto',
              objectFit: 'contain',
              margin: '0 auto 1rem auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.3))'
            }}
          />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Log in to access your account, orders, and store features.
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" autoCapitalize="none">
          {/* Decoy hidden inputs */}
          <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="prevent_autofill_pass" style={{ display: 'none' }} tabIndex="-1" />

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>

          {/* Password with Right-Side Eye Toggle Button */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '12px', marginTop: '0.75rem', gap: '8px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
