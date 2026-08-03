import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const subtotal = cart.totalAmount || 0;
  const shippingPrice = subtotal >= 50 || subtotal === 0 ? 0 : 10.0;
  const taxPrice = parseFloat((subtotal * 0.08).toFixed(2));
  const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <ShoppingCart size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Shopping Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg" style={{ borderRadius: '9999px', gap: '8px' }}>
            <ArrowLeft size={18} /> Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Shopping Cart</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Review your selected items before proceeding to secure checkout.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Cart Items List */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Cart Items ({items.length})</h3>
              <button onClick={clearCart} style={{ background: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {items.map((item) => {
                const prod = item.product;
                const prodId = prod._id || prod.id;
                const price = item.price || prod.price;

                return (
                  <div key={item._id || prodId} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: '1.25rem', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Thumbnail */}
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#0b1120', border: '1px solid var(--border-glass)' }}>
                      <img src={prod.image} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Info */}
                    <div>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                        <Link to={`/product/${prodId}`} style={{ color: '#fff' }}>{prod.title}</Link>
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category: {prod.category}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>
                        ₹{price.toFixed(2)} each
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <button
                        onClick={() => updateQuantity(prodId, item.quantity - 1)}
                        style={{ padding: '0.4rem 0.75rem', background: 'none', color: '#fff', fontWeight: '700' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 0.6rem', fontWeight: '700', fontSize: '0.95rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(prodId, item.quantity + 1)}
                        style={{ padding: '0.4rem 0.75rem', background: 'none', color: '#fff', fontWeight: '700' }}
                      >
                        +
                      </button>
                    </div>

                    {/* Total item price & Remove */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                        ₹{(price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(prodId)}
                        style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Right Column: Summary Card */}
        <aside className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal ({items.length} items)</span>
              <span style={{ color: '#fff', fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Shipping</span>
              <span style={{ color: shippingPrice === 0 ? 'var(--success)' : '#fff', fontWeight: '600' }}>
                {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ color: '#fff', fontWeight: '600' }}>₹{taxPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem', fontSize: '1.2rem', fontWeight: '800' }}>
              <span>Total Price</span>
              <span className="gradient-text">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '12px', gap: '8px', marginBottom: '1rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>Encrypted SSL 256-Bit Payment Protection</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
