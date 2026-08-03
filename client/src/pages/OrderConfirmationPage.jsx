import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Truck, Clock, ArrowRight, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import ProductTrackingModal from '../components/ProductTrackingModal';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const getEstimatedDeliveryStr = (createdAt) => {
    const d = new Date(createdAt || Date.now());
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading order receipt...</div>;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Order Confirmation Receipt</h2>
        <p style={{ color: 'var(--text-muted)' }}>Thank you for your order!</p>
        <Link to="/profile" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>View Order History</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', maxWidth: '850px' }}>
      {/* Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}
        >
          <CheckCircle size={42} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Thank you for shopping with VizHop. Order reference: <strong style={{ color: 'var(--primary)' }}>#{order._id}</strong>
        </p>
      </div>

      {/* Estimated Delivery & Live Tracking Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(168, 85, 247, 0.06))',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', color: '#ffffff', padding: '10px', borderRadius: '12px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Expected Delivery Date
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              {getEstimatedDeliveryStr(order.createdAt)}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowTrackingModal(true)}
          className="btn btn-primary btn-md"
          style={{ gap: '8px', borderRadius: '9999px' }}
        >
          <Truck size={18} />
          <span>Track Product Status</span>
        </button>
      </div>

      {/* Delivery Progress Bar */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Delivery Status Tracker
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Clock size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Order Placed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'var(--primary)' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Truck size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? '#0f172a' : 'var(--text-muted)' }}>Shipped</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: order.orderStatus === 'Delivered' ? 'var(--success)' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Package size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: order.orderStatus === 'Delivered' ? '#0f172a' : 'var(--text-muted)' }}>Delivered</span>
          </div>
        </div>
      </div>

      {/* Order Details Receipt */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          Order Items Receipt
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {order.orderItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', color: '#0f172a' }}>{item.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} x ₹{item.price.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Shipping & Payment Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div>
            <h5 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shipping Address</h5>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.shippingAddress.fullName}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Phone: {order.shippingAddress.phone}</div>
          </div>

          <div>
            <h5 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment Info</h5>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>Method: {order.paymentMethod}</div>
            <div style={{ marginTop: '6px' }}>
              <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                Payment {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', fontSize: '1.3rem', fontWeight: '800' }}>
          <span>Total Charged</span>
          <span className="gradient-text">₹{order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Navigation buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/profile" className="btn btn-secondary btn-lg" style={{ borderRadius: '9999px' }}>
          View Order History
        </Link>
        <Link to="/shop" className="btn btn-primary btn-lg" style={{ borderRadius: '9999px', gap: '8px' }}>
          <span>Continue Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Product Tracking Modal */}
      {showTrackingModal && (
        <ProductTrackingModal
          order={order}
          onClose={() => setShowTrackingModal(false)}
        />
      )}
    </div>
  );
};

export default OrderConfirmationPage;
