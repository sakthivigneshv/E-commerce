import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, ArrowRight, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const productId = product._id || product.id;

  const handleShopNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/product/${productId}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-glass)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Product Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          loading="lazy"
        />

        {/* Badge Overlay */}
        {product.badge && (
          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <span className={`badge ${product.badge === 'Hot Deal' ? 'badge-danger' : product.badge === 'Best Seller' ? 'badge-warning' : 'badge-primary'}`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount Tag */}
        {product.discountPercentage > 0 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
            -{product.discountPercentage}%
          </div>
        )}
      </div>

      {/* Product Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          {product.category}
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.title}
        </h3>

        {/* Rating & Reviews */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', color: '#f59e0b' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(product.rating || 4.5) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {product.rating || 4.5} ({product.numReviews || 0})
          </span>
        </div>

        {/* Price & Original Price */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{product.price ? product.price.toFixed(2) : '0.00'}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={handleShopNow}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', gap: '4px' }}
          >
            <span>Shop Now</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={handleAddToCart}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', gap: '4px' }}
          >
            <ShoppingCart size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
