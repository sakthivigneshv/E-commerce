import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

const ThemeSelector = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(37, 99, 235, 0.1)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: '700',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          transition: 'all 0.2s ease'
        }}
      >
        <Palette size={16} />
        <span>Theme</span>
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            width: '240px',
            zIndex: 1000,
            padding: '0.65rem',
            background: 'var(--bg-surface)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.4rem' }}>
            Select Color Theme
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {Object.keys(themes).map((key) => {
              const theme = themes[key];
              const isActive = currentTheme === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    changeTheme(key);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'background 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: theme.gradient,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        flexShrink: 0
                      }}
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isActive && <Check size={16} color="var(--primary)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
