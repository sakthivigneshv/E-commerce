import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

const LogoSplashScreen = ({ onEnter }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Exactly 5 seconds automatic transition
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        onEnter();
      }, 450);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-dark, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        opacity: fade ? 0 : 1,
        transform: fade ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        textAlign: 'center'
      }}
    >
      {/* Centered Logo & Company Name Only */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/logo.png"
          alt="VizHop Logo"
          style={{
            width: '260px',
            maxHeight: '260px',
            objectFit: 'contain',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 15px 30px rgba(37, 99, 235, 0.25))',
            animation: 'pulseLogo 2.5s ease-in-out infinite alternate'
          }}
        />

        <h1
          style={{
            fontSize: '3.8rem',
            fontWeight: '800',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.03em',
            margin: 0,
            color: 'var(--text-main, #111827)'
          }}
        >
          Viz<span className="gradient-text">Hop</span>
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Shop Smart. Live Better.
        </p>
      </div>

      <style>{`
        @keyframes pulseLogo {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
};

export default LogoSplashScreen;
