import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Shield, Truck, RefreshCw, Lock, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid #cbd5e1', marginTop: '4rem', padding: '3.5rem 0 1.5rem 0' }}>
      <div className="container">
        {/* Value Proposition Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(99,102,241,0.12)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem' }}>Fast Global Shipping</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free delivery on orders over ₹499</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.12)', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
              <Lock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem' }}>100% Secure Checkout</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Encrypted payments via SSL</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(168,85,247,0.12)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem' }}>30 Days Easy Returns</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hassle-free refund policy</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(236,72,153,0.12)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem' }}>24/7 Priority Support</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dedicated customer care team</p>
            </div>
          </div>
        </div>

        {/* Footer Links & Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '800' }}>
              <img
                src="/logo.png"
                alt="VizHop Logo"
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              />
              <span style={{ color: 'var(--text-main, #111827)' }}>Viz<span className="gradient-text">Hop</span></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '320px', marginBottom: '1rem' }}>
              VizHop is your one-stop destination for effortless online shopping. Explore detailed reviews, top discounts, and enjoy instant order confirmations.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/project-review" style={{ fontWeight: '700', color: 'var(--primary)' }}>★ System Project Review</Link></li>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Electronics">Electronics</Link></li>
              <li><Link to="/shop?category=Audio">Audio Gear</Link></li>
              <li><Link to="/shop?category=Wearables">Smart Wearables</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Account</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/cart">My Shopping Cart</Link></li>
              <li><Link to="/profile">Order History</Link></li>
              <li><Link to="/login">User Login</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact Details - Single Line Layout */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Contact Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Mail size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Email: <strong style={{ color: 'var(--primary)' }}>sakthivijayarajkrv@gmail.com</strong></span>
              </p>
              <p style={{ fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Phone size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Phone: <strong>+91 7358409336</strong></span>
              </p>
              <p style={{ fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Location: <strong>Salem, Tamilnadu, India</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} VizHop Inc. All rights reserved. Created for effortless cross-platform shopping.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
