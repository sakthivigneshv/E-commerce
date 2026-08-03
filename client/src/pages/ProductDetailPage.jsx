import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, ArrowRight, ShieldCheck, Truck, RefreshCw, Check, MessageSquare, ThumbsUp } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { isLoggedIn, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setSelectedImage(res.data.product.image);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleShopNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await axios.post(`/api/products/${id}/reviews`, {
        rating: newRating,
        comment: newComment
      });

      if (res.data.success) {
        showToast('Review submitted successfully!');
        setProduct((prev) => ({
          ...prev,
          reviews: res.data.reviews,
          numReviews: res.data.reviews.length
        }));
        setNewComment('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading product details...</div>;
  }

  if (!product) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Product not found.</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
        {/* Left Column: Product Gallery */}
        <div>
          <div className="glass-panel" style={{ width: '100%', height: '440px', overflow: 'hidden', position: 'relative', marginBottom: '1rem', background: '#0b1120' }}>
            <img
              src={selectedImage || product.image}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {product.badge && (
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Sub-Images Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === imgUrl ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    opacity: selectedImage === imgUrl ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Options */}
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {product.category}
          </div>

          <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '0.75rem' }}>
            {product.title}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating || 4.5) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{product.rating || 4.5}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({product.numReviews || 0} customer reviews)</span>
          </div>

          {/* Price Box */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-glass)', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff' }}>
              ₹{product.price ? product.price.toFixed(2) : '0.00'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice.toFixed(2)}
                </span>
                <span className="badge badge-danger" style={{ padding: '6px 10px' }}>
                  Save ₹{(product.originalPrice - product.price).toFixed(2)} ({product.discountPercentage}%)
                </span>
              </>
            )}
          </div>

          <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            {product.description}
          </p>

          {/* Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.75rem' }}>
            <Check size={18} color="var(--success)" />
            <span style={{ fontWeight: '600', color: 'var(--success)' }}>
              In Stock ({product.stock} units available)
            </span>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.75rem 1.1rem', background: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}
              >
                -
              </button>
              <span style={{ padding: '0 1rem', fontWeight: '700', fontSize: '1.1rem' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ padding: '0.75rem 1.1rem', background: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}
              >
                +
              </button>
            </div>

            {/* Shop Now (Direct Checkout) */}
            <button
              onClick={handleShopNow}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, borderRadius: '12px', gap: '8px' }}
            >
              <span>Shop Now</span>
              <ArrowRight size={20} />
            </button>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="btn btn-secondary btn-lg"
              style={{ flex: 1, borderRadius: '12px', gap: '8px' }}
            >
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <Truck size={18} color="var(--primary)" />
              <span>Fast 2-3 Day Express Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span>1 Year Official Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={24} color="var(--primary)" />
          <span>Customer Reviews & Ratings ({product.reviews ? product.reviews.length : 0})</span>
        </h2>

        {/* Write a Review Box */}
        {isLoggedIn ? (
          <form onSubmit={handleAddReview} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Write a Customer Review</h4>
            <div className="input-group">
              <label className="input-label">Your Rating</label>
              <select
                className="input-field"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                style={{ width: '180px' }}
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Poor</option>
                <option value={1}>1 Star - Terrible</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Comment / Feedback</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Share your experience with this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Please <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>log in</span> to submit a customer review.
          </div>
        )}

        {/* Reviews List */}
        {product.reviews && product.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {product.reviews.map((rev, index) => (
              <div key={rev._id || index} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-glass)', borderRadius: '12px', background: 'rgba(255,255,255,0.015)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{rev.userName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.5rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                </div>

                <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.5' }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to review this product!</p>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
