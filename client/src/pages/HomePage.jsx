import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Laptop, Headphones, Watch, ShoppingBag, Coffee, ChevronRight } from 'lucide-react';

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, prodRes, catRes] = await Promise.all([
          axios.get('/api/admin/banners'),
          axios.get('/api/products?limit=6'),
          axios.get('/api/admin/categories')
        ]);

        if (bannersRes.data.success) setBanners(bannersRes.data.banners || []);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products || []);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const categoryIcons = {
    Electronics: <Laptop size={28} />,
    Audio: <Headphones size={28} />,
    Wearables: <Watch size={28} />,
    Fashion: <ShoppingBag size={28} />,
    'Home & Kitchen': <Coffee size={28} />
  };

  const currentBanner = banners[activeBannerIndex] || {
    title: "Effortless Online Shopping Experience",
    subtitle: "Discover high-performance electronics, audio gear, and luxury lifestyle products.",
    imageUrl: "https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=1400&q=80",
    linkUrl: "/shop"
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Hero Banner Section */}
      <section style={{ position: 'relative', width: '100%', minHeight: '520px', display: 'flex', alignItems: 'center', margin: '1.5rem 0 3rem 0', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(90deg, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.6) 60%, rgba(9, 13, 22, 0.2) 100%), url(${currentBanner.imageUrl}) center/cover no-repeat`, zIndex: 1, transition: 'background 1s ease' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem', padding: '6px 14px', fontSize: '0.85rem' }}>
              <Sparkles size={14} /> Featured Deal of the Week
            </div>
            
            <h1 style={{ fontSize: '3.2rem', lineHeight: '1.15', fontWeight: '800', marginBottom: '1.25rem' }}>
              {currentBanner.title}
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: '#d1d5db', marginBottom: '2rem', lineHeight: '1.6' }}>
              {currentBanner.subtitle}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={currentBanner.linkUrl || '/shop'} className="btn btn-primary btn-lg" style={{ borderRadius: '9999px', gap: '8px' }}>
                <span>Explore Catalog</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/shop?badge=Hot+Deal" className="btn btn-secondary btn-lg" style={{ borderRadius: '9999px' }}>
                Hot Deals
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        {banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: '24px', right: '36px', zIndex: 3, display: 'flex', gap: '8px' }}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIndex(idx)}
                style={{
                  width: idx === activeBannerIndex ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: idx === activeBannerIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Categories */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Browse Categories</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Curated collections for all your daily needs</p>
          </div>
          <Link to="/shop" style={{ color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ChevronRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <div
              key={cat._id || cat.name}
              className="glass-panel"
              style={{
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                {categoryIcons[cat.name] || <ShoppingBag size={28} />}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.description || 'Explore collection'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
              <TrendingUp size={12} /> Top Trending Items
            </div>
            <h2 style={{ fontSize: '1.8rem' }}>Featured Products</h2>
          </div>
          <Link to="/shop" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product._id || product.title} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner Card */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #4a044e 100%)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div style={{ maxWidth: '550px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: '#fff' }}>
              Experience the Future of Shopping
            </h2>
            <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Join thousands of happy shoppers enjoying secure instant checkouts, real-time tracking, and priority support on VizHop.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ borderRadius: '9999px' }}>
              Create Free Account
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--teal)' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secure Checkout</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', minWidth: '130px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>24/7</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
