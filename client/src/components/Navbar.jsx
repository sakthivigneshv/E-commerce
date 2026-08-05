import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, User, LogOut, ShieldCheck, ShoppingCart, Sparkles, X, ChevronRight, Store, Award } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, isVerifiedSeller, logout } = useAuth();
  const { totalCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Instant live search autocomplete
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(searchTerm.trim())}`);
        if (res.data.success) {
          setSearchResults(res.data.products.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleProductSelect = (productId) => {
    setShowDropdown(false);
    setSearchTerm('');
    navigate(`/product/${productId}`);
  };

  return (
    <header className="navbar">
      {/* Top Announcement Bar */}
      <div style={{ background: 'var(--gradient-primary, linear-gradient(90deg, #2563eb, #7c3aed))', padding: '5px 0', fontSize: '0.8rem', textAlign: 'center', color: '#fff', fontWeight: '600' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> Free Express Shipping on orders over ₹499 | Code: <b>VIZHOP2026</b>
        </span>
      </div>

      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.png"
            alt="VizHop Logo"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <span style={{ color: 'var(--text-main, #111827)', fontSize: '1.45rem', fontWeight: '800' }}>
            Viz<span className="gradient-text">Hop</span>
          </span>
        </Link>

        {/* Search Bar with Instant Autocomplete Dropdown */}
        {isLoggedIn ? (
          <div ref={dropdownRef} className="search-bar-container">
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search specific product (e.g. Headphones, Watch, Drone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setShowDropdown(false); }}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--primary)' }}
                >
                  <Search size={18} />
                </button>
              )}
            </form>

            {/* Floating Autocomplete Dropdown */}
            {showDropdown && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '115%',
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  padding: '0.75rem',
                  boxShadow: '0 20px 30px rgba(0,0,0,0.15)',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: '#ffffff'
                }}
              >
                {isSearching ? (
                  <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Searching products...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No matching products found for "{searchTerm}"
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', padding: '0 0.5rem 0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                      Matching Products ({searchResults.length})
                    </div>
                    {searchResults.map((prod) => (
                      <div
                        key={prod._id || prod.title}
                        onClick={() => handleProductSelect(prod._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          background: '#f8fafc'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                      >
                        <img src={prod.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {prod.category} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{prod.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        marginTop: '0.25rem',
                        textAlign: 'center'
                      }}
                    >
                      See all results for "{searchTerm}" →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary" style={{ padding: '6px 12px' }}>
              <ShieldCheck size={14} /> 2-Step Verified Sign-up Required
            </span>
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <ThemeSelector />

          <Link to="/project-review" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
            <Award size={16} /> Project Review
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/" style={{ fontWeight: '600', fontSize: '0.95rem' }}>Home</Link>
              <Link to="/shop" style={{ fontWeight: '600', fontSize: '0.95rem' }}>Shop Catalog</Link>

              {/* Seller Portal Button */}
              <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.95rem', color: isVerifiedSeller ? '#10b981' : 'inherit' }}>
                <Store size={16} /> Seller Portal
              </Link>

              {isAdmin && (
                <Link to="/admin" className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                  <ShieldCheck size={14} /> Admin Panel
                </Link>
              )}

              {/* Cart Icon */}
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
                <ShoppingCart size={18} />
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Cart</span>
                {totalCount > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '9999px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>
                    {totalCount}
                  </span>
                )}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/profile" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                  <User size={16} />
                  <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button onClick={logout} className="btn btn-danger btn-sm" title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
