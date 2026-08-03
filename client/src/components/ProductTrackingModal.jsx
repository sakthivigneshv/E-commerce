import React from 'react';
import { X, Package, Truck, CheckCircle2, Clock, MapPin, Calendar, ExternalLink } from 'lucide-react';

const ProductTrackingModal = ({ order, onClose }) => {
  if (!order) return null;

  // Calculate estimated delivery date: Order creation date + 4 days
  const orderDate = new Date(order.createdAt || Date.now());
  const deliveryDateMin = new Date(orderDate);
  deliveryDateMin.setDate(deliveryDateMin.getDate() + 3);

  const deliveryDateMax = new Date(orderDate);
  deliveryDateMax.setDate(deliveryDateMax.getDate() + 5);

  const formatDateStr = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusList = [
    { label: 'Order Confirmed', desc: 'Payment verified & order placed', done: true, icon: CheckCircle2 },
    { label: 'Processing & Quality Check', desc: 'Items packed & prepared at hub', done: true, icon: Clock },
    { label: 'In Transit', desc: 'Handed over to VizHop Express Courier', done: order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered', icon: Truck },
    { label: 'Out for Delivery / Delivered', desc: 'Estimated arrival at your shipping address', done: order.orderStatus === 'Delivered', icon: Package }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '640px', padding: '2rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Product Tracking</div>
            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '2px 0 0 0' }}>Order #{order._id}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: '#64748b', borderRadius: '50%', padding: '6px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Estimated Delivery Highlight Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '14px', color: '#ffffff' }}>
            <Calendar size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Estimated Delivery Window
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {formatDateStr(deliveryDateMin)} – {formatDateStr(deliveryDateMax)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: '700', marginTop: '2px' }}>
              🚚 On Track for Fast Delivery
            </div>
          </div>
        </div>

        {/* Tracking Logistics Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tracking Number</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>TRK-894291834</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Logistics Partner</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>VizHop Express Courier</div>
          </div>
        </div>

        {/* Step-by-Step Progress Timeline */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', color: '#0f172a' }}>Shipment Journey Progress</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {statusList.map((st, idx) => {
              const IconComp = st.icon;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: st.done ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e2e8f0',
                      color: st.done ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      flexShrink: 0,
                      boxShadow: st.done ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: st.done ? '#0f172a' : '#64748b' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Brief */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Package Contents ({order.orderItems?.length || 0} items)
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {order.orderItems?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                <img src={item.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{item.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%', borderRadius: '12px' }}>
          Close Tracking Details
        </button>
      </div>
    </div>
  );
};

export default ProductTrackingModal;
