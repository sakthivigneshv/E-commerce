import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { UserPlus, Mail, Smartphone, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import CountryPhoneInput, { COUNTRIES } from '../components/CountryPhoneInput';

const RegisterPage = () => {
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/Hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Extract country dial code and phone digits validation
    const matchedCountry = COUNTRIES.find(c => phone.startsWith(c.dialCode));
    const phoneDigits = matchedCountry
      ? phone.slice(matchedCountry.dialCode.length).replace(/\D/g, '')
      : phone.replace(/\D/g, '');

    const expectedDigits = matchedCountry ? matchedCountry.digits : 10;
    if (phoneDigits.length !== expectedDigits) {
      showToast(`Invalid phone number! Please enter a valid ${expectedDigits}-digit mobile number for ${matchedCountry?.name || 'your country'}.`, 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify and try again.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Public signup strictly registers as Customer ('USER')
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        phone,
        password,
        role: 'USER'
      });

      if (res.data.success) {
        showToast('Account created! Please verify your Email & Mobile Phone number.');
        navigate('/verify-otp', {
          state: {
            userId: res.data.userId,
            email: res.data.email,
            phone: res.data.phone,
            demoEmailOTP: res.data.demoEmailOTP,
            demoMobileOTP: res.data.demoMobileOTP
          }
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          <h2 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Create Customer Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign up to experience 2-step verification & fast checkout on VizHop.
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" autoCapitalize="none">
          {/* Decoy hidden inputs to prevent Chrome/Edge aggressive browser autofill */}
          <input type="text" name="prevent_autofill_reg" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="prevent_autofill_reg_pass" style={{ display: 'none' }} tabIndex="-1" />

          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              className="input-field"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>

          <CountryPhoneInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            label="Mobile Phone Number"
          />

          {/* Password Field with Right-Side Eye Toggle */}
          <div className="input-group">
            <label className="input-label">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Confirm Password Field with Right-Side Eye Toggle */}
          <div className="input-group">
            <label className="input-label">Confirm Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '2px', fontWeight: '600' }}>
                ⚠️ Passwords do not match
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '12px', marginTop: '0.5rem', gap: '8px' }}
          >
            <span>{submitting ? 'Creating Account...' : 'Continue to Verification'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
