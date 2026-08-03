import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, ShieldCheck, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import CountryPhoneInput, { COUNTRIES } from '../components/CountryPhoneInput';

const CheckoutPage = () => {
  const { cart, showToast, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || 'USA',
    phone: user?.phone || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [placingOrder, setPlacingOrder] = useState(false);

  const items = cart.items || [];
  const itemsPrice = cart.totalAmount || 0;
  const shippingPrice = itemsPrice >= 50 || itemsPrice === 0 ? 0 : 10.0;
  const taxPrice = parseFloat((itemsPrice * 0.08).toFixed(2));
  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      showToast('Please fill in all required shipping address fields', 'error');
      return;
    }

    const matchedCountry = COUNTRIES.find(c => shippingAddress.phone.startsWith(c.dialCode));
    const phoneDigits = matchedCountry
      ? shippingAddress.phone.slice(matchedCountry.dialCode.length).replace(/\D/g, '')
      : shippingAddress.phone.replace(/\D/g, '');

    const expectedDigits = matchedCountry ? matchedCountry.digits : 10;
    if (phoneDigits.length !== expectedDigits) {
      showToast(`Please enter a valid ${expectedDigits}-digit shipping phone number for ${matchedCountry?.name || 'your country'}`, 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/shop');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        orderItems: items.map(i => ({
          productId: i.product._id || i.product.id,
          title: i.product.title,
          image: i.product.image,
          quantity: i.quantity,
          price: i.price
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const res = await axios.post('/api/orders', orderPayload);
      if (res.data.success) {
        showToast('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${res.data.order._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order. Try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Checkout & Order Details</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Provide shipping details and select your preferred payment method.</p>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Shipping & Payment Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Address Box */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={22} color="var(--primary)" />
              <span>Shipping Address</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="input-field"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  className="input-field"
                  placeholder="123 Shopping St, Apt 4B"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="input-field"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">State / Province *</label>
                <input
                  type="text"
                  name="state"
                  className="input-field"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">ZIP / Postal Code *</label>
                <input
                  type="text"
                  name="zip"
                  className="input-field"
                  value={shippingAddress.zip}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <CountryPhoneInput
                name="phone"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                required
                label="Phone Number"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={22} color="var(--primary)" />
              <span>Select Payment Method</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { id: 'Credit Card', name: 'Credit Card', icon: <CreditCard size={20} /> },
                { id: 'Debit Card', name: 'Debit Card', icon: <CreditCard size={20} /> },
                { id: 'UPI / NetBanking', name: 'UPI / NetBanking', icon: <Smartphone size={20} /> },
                { id: 'Cash on Delivery', name: 'Cash on Delivery', icon: <Banknote size={20} /> }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: paymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: paymentMethod === pm.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ color: paymentMethod === pm.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {pm.icon}
                  </div>
                  <div style={{ fontWeight: paymentMethod === pm.id ? '700' : '500', fontSize: '0.95rem' }}>
                    {pm.name}
                  </div>
                  {paymentMethod === pm.id && (
                    <CheckCircle size={16} color="var(--primary)" style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Total Summary Box */}
        <aside className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            Items in Order ({items.length})
          </h3>

          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', paddingRight: '4px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <img src={item.product.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{item.product.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} x ₹{item.price}</div>
                </div>
                <div style={{ fontWeight: '700', color: '#fff' }}>₹{(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Total</span>
              <span>₹{itemsPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: shippingPrice === 0 ? 'var(--success)' : '#fff' }}>
                {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Tax</span>
              <span>₹{taxPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem', fontSize: '1.25rem', fontWeight: '800' }}>
              <span>Order Total</span>
              <span className="gradient-text">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placingOrder}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '12px' }}
          >
            {placingOrder ? 'Processing Order...' : 'Confirm & Pay Now'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Instant order confirmation & tracking email will be issued upon placement.
          </div>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
