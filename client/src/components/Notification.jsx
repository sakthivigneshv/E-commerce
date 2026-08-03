import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Notification = () => {
  const { toast } = useCart();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        fontWeight: '600',
        fontSize: '0.95rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span>{toast.message}</span>
    </div>
  );
};

export default Notification;
