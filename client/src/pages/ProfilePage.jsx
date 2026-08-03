import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, Package, MapPin, Phone, Mail, ShieldCheck, Clock, ExternalLink, Truck, Calendar } from 'lucide-react';
import ProductTrackingModal from '../components/ProductTrackingModal';
import CountryPhoneInput from '../components/CountryPhoneInput';

const ProfilePage = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { showToast } = useCart();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zip, setZip] = useState(user?.address?.zip || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching my orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const result = await updateProfile({
      name,
      phone,
      address: { street, city, state, zip }
    });
    setUpdating(false);
    if (result.success) {
      showToast('Profile updated successfully!');
    } else {
      showToast(result.message, 'error');
    }
  };

  const getEstimatedDeliveryStr = (createdAt) => {
    const d = new Date(createdAt || Date.now());
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Account Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        Manage your account settings, track product deliveries, and view your order history.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: User Profile Card & Edit Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{user?.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`}>
                {isAdmin ? 'Creator Admin' : 'Verified Customer'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Edit Profile Information</h4>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <CountryPhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} label="Phone Number" />
            </div>

            <div className="input-group">
              <label className="input-label">Street Address</label>
              <input type="text" className="input-field" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">City</label>
                <input type="text" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input type="text" className="input-field" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={updating} className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
              {updating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Order History & Tracking */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={22} color="var(--primary)" />
              <span>My Order History & Live Tracking ({orders.length})</span>
            </h3>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders history...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={40} style={{ marginBottom: '0.75rem' }} />
                <p>No previous orders found. Start exploring products in our shop catalog!</p>
                <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Shop</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((ord) => (
                  <div key={ord._id} style={{ background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.25rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>Order #{ord._id}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${ord.orderStatus === 'Delivered' ? 'badge-success' : 'badge-warning'}`}>
                          {ord.orderStatus}
                        </span>
                        <button
                          onClick={() => setSelectedTrackingOrder(ord)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                          <Truck size={14} /> Track Delivery
                        </button>
                        <Link to={`/order-confirmation/${ord._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                          <ExternalLink size={14} /> Receipt
                        </Link>
                      </div>
                    </div>

                    {/* Delivery Date Highlight */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(79,70,229,0.06)', padding: '8px 12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span style={{ color: '#0f172a', fontWeight: '600' }}>
                        Estimated Delivery Date: <strong style={{ color: 'var(--primary)' }}>{getEstimatedDeliveryStr(ord.createdAt)}</strong>
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '6px' }}>
                      {ord.orderItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', flexShrink: 0 }}>
                          <img src={item.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>{item.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total Amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Total: ₹{ord.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Tracking Modal */}
      {selectedTrackingOrder && (
        <ProductTrackingModal
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
