import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Smartphone, CheckCircle, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useCart();
  const { setAuthSession } = useAuth();

  const stateData = location.state || {};
  const [userId, setUserId] = useState(stateData.userId || '');
  const [email, setEmail] = useState(stateData.email || '');
  const [phone, setPhone] = useState(stateData.phone || '');

  // OTP inputs (start blank so user enters manually)
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');

  // Verification step flags
  const [isEmailVerified, setIsEmailVerified] = useState(stateData.isEmailVerified || false);
  const [isMobileVerified, setIsMobileVerified] = useState(stateData.isMobileVerified || false);

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [resending, setResending] = useState(false);

  // Demo notification hints for seamless local testing
  const [demoHint, setDemoHint] = useState({
    emailOTP: stateData.demoEmailOTP || '123456',
    mobileOTP: stateData.demoMobileOTP || '654321'
  });

  if (!userId) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
          <KeyRound size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2>Verification Required</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            Please sign up or log in first to complete your Email & Mobile Number OTP verification.
          </p>
          <Link to="/register" className="btn btn-primary btn-sm">Sign Up Now</Link>
        </div>
      </div>
    );
  }

  // Handle Verify Email OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOTP || emailOTP.length < 6) {
      showToast('Please enter a valid 6-digit Email OTP code', 'error');
      return;
    }

    setVerifyingEmail(true);
    try {
      const res = await axios.post('/api/auth/verify-email', { userId, otp: emailOTP });
      if (res.data.success) {
        setIsEmailVerified(true);
        showToast('Email address verified successfully!');
        if (res.data.token && res.data.user) {
          setAuthSession(res.data.user, res.data.token);
          showToast('Verification complete! Access granted to VizHop application.');
          setTimeout(() => navigate('/'), 1000);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid Email OTP code', 'error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    if (!mobileOTP || mobileOTP.length < 6) {
      showToast('Please enter a valid 6-digit Mobile OTP code', 'error');
      return;
    }

    setVerifyingMobile(true);
    try {
      const res = await axios.post('/api/auth/verify-mobile', { userId, otp: mobileOTP });
      if (res.data.success) {
        setIsMobileVerified(true);
        showToast('Mobile phone number verified successfully!');
        if (res.data.token && res.data.user) {
          setAuthSession(res.data.user, res.data.token);
          showToast('Verification complete! Access granted to VizHop application.');
          setTimeout(() => navigate('/'), 1000);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid Mobile OTP code', 'error');
    } finally {
      setVerifyingMobile(false);
    }
  };

  // Handle Resend OTPs
  const handleResendOTP = async () => {
    setResending(true);
    try {
      const res = await axios.post('/api/auth/resend-otp', { userId });
      if (res.data.success) {
        showToast('New OTP verification codes sent!');
        setEmailOTP('');
        setMobileOTP('');
        if (res.data.demoEmailOTP) {
          setDemoHint({ emailOTP: res.data.demoEmailOTP, mobileOTP: res.data.demoMobileOTP });
        }
      }
    } catch (err) {
      showToast('Failed to resend OTPs', 'error');
    } finally {
      setResending(false);
    }
  };

  const bothVerified = isEmailVerified && isMobileVerified;

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem' }}>
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
          <h2 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Account Verification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Complete 2-step verification for Email (<strong style={{ color: '#0f172a' }}>{email}</strong>) and Mobile (<strong style={{ color: '#0f172a' }}>{phone}</strong>).
          </p>
        </div>

        {/* Demo OTP Helper Banner */}
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', color: '#0f172a' }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={16} /> OTP Code Dispatch Simulation
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span>Email OTP: <strong style={{ color: 'var(--teal)', fontSize: '1.05rem', letterSpacing: '0.1em' }}>{demoHint.emailOTP}</strong></span>
            <span>Mobile OTP: <strong style={{ color: 'var(--secondary)', fontSize: '1.05rem', letterSpacing: '0.1em' }}>{demoHint.mobileOTP}</strong></span>
          </div>
        </div>

        {/* STEP 1: Email OTP Form */}
        <div style={{ background: isEmailVerified ? '#ecfdf5' : '#f8fafc', border: isEmailVerified ? '1px solid #a7f3d0' : '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '1.05rem', color: '#0f172a' }}>
              <Mail size={20} color="var(--primary)" />
              <span>Step 1: Email Verification</span>
            </div>
            {isEmailVerified && (
              <span className="badge badge-success" style={{ gap: '4px' }}>
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>

          {!isEmailVerified ? (
            <form onSubmit={handleVerifyEmail} autoComplete="off">
              <input type="text" name="prevent_autofill_otp" style={{ display: 'none' }} tabIndex="-1" />
              <div className="input-group">
                <label className="input-label">Enter 6-digit Email OTP</label>
                <input
                  type="text"
                  name="email_otp_pin"
                  maxLength={6}
                  className="input-field"
                  placeholder="123456"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value)}
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textAlign: 'center', fontWeight: '700' }}
                  required
                />
              </div>
              <button type="submit" disabled={verifyingEmail} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                {verifyingEmail ? 'Verifying...' : 'Verify Email OTP'}
              </button>
            </form>
          ) : (
            <div style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Email verified successfully
            </div>
          )}
        </div>

        {/* STEP 2: Mobile OTP Form */}
        <div style={{ background: isMobileVerified ? '#ecfdf5' : '#f8fafc', border: isMobileVerified ? '1px solid #a7f3d0' : '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '14px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '1.05rem', color: '#0f172a' }}>
              <Smartphone size={20} color="var(--secondary)" />
              <span>Step 2: Mobile Phone Verification</span>
            </div>
            {isMobileVerified && (
              <span className="badge badge-success" style={{ gap: '4px' }}>
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>

          {!isMobileVerified ? (
            <form onSubmit={handleVerifyMobile} autoComplete="off">
              <input type="text" name="prevent_autofill_mob" style={{ display: 'none' }} tabIndex="-1" />
              <div className="input-group">
                <label className="input-label">Enter 6-digit Mobile OTP</label>
                <input
                  type="text"
                  name="mobile_otp_pin"
                  maxLength={6}
                  className="input-field"
                  placeholder="654321"
                  value={mobileOTP}
                  onChange={(e) => setMobileOTP(e.target.value)}
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textAlign: 'center', fontWeight: '700' }}
                  required
                />
              </div>
              <button type="submit" disabled={verifyingMobile} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                {verifyingMobile ? 'Verifying...' : 'Verify Mobile OTP'}
              </button>
            </form>
          ) : (
            <div style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Mobile number verified successfully
            </div>
          )}
        </div>

        {/* Action Controls */}
        {bothVerified ? (
          <button onClick={() => navigate('/')} className="btn btn-primary btn-lg" style={{ width: '100%', gap: '8px', borderRadius: '12px' }}>
            <span>Proceed to Home Page</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Resend OTP Codes
            </button>
            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOTPPage;
