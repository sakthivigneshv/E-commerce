import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  'royal-violet': {
    name: 'Electric Violet (Default)',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    secondary: '#7C3AED',
    accent: '#7C3AED',
    background: '#F8FAFC',
    bgSurface: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#475569',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    gradientHover: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
    glassBg: 'rgba(255, 255, 255, 0.94)',
    borderGlass: '#CBD5E1',
    shadowGlow: 'rgba(37, 99, 235, 0.25)',
    cardHover: '#F8FAFC'
  },
  'ocean-cyan': {
    name: 'Ocean Blue & Cyan',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    secondary: '#2563EB',
    accent: '#2563EB',
    background: '#F0F9FF',
    bgSurface: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#475569',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
    gradientHover: 'linear-gradient(135deg, #0369A1 0%, #1D4ED8 100%)',
    glassBg: 'rgba(255, 255, 255, 0.94)',
    borderGlass: '#BAE6FD',
    shadowGlow: 'rgba(2, 132, 199, 0.25)',
    cardHover: '#F0F9FF'
  },
  'sunset-amber': {
    name: 'Sunset Rose & Gold',
    primary: '#E11D48',
    primaryHover: '#BE123C',
    secondary: '#D97706',
    accent: '#D97706',
    background: '#FFFBEB',
    bgSurface: '#FFFFFF',
    textMain: '#1C1917',
    textMuted: '#57534E',
    gradient: 'linear-gradient(135deg, #E11D48 0%, #D97706 100%)',
    gradientHover: 'linear-gradient(135deg, #BE123C 0%, #B45309 100%)',
    glassBg: 'rgba(255, 255, 255, 0.94)',
    borderGlass: '#FDE68A',
    shadowGlow: 'rgba(225, 29, 72, 0.25)',
    cardHover: '#FFFBEB'
  },
  'emerald-luxe': {
    name: 'Emerald & Teal Luxe',
    primary: '#059669',
    primaryHover: '#047857',
    secondary: '#0D9488',
    accent: '#0D9488',
    background: '#F0FDF4',
    bgSurface: '#FFFFFF',
    textMain: '#064E3B',
    textMuted: '#475569',
    gradient: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
    gradientHover: 'linear-gradient(135deg, #047857 0%, #0F766E 100%)',
    glassBg: 'rgba(255, 255, 255, 0.94)',
    borderGlass: '#A7F3D0',
    shadowGlow: 'rgba(5, 150, 105, 0.25)',
    cardHover: '#F0FDF4'
  },
  'midnight-obsidian': {
    name: 'Midnight Dark Obsidian',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#8B5CF6',
    accent: '#8B5CF6',
    background: '#0F172A',
    bgSurface: '#1E293B',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    gradientHover: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    glassBg: 'rgba(30, 41, 59, 0.92)',
    borderGlass: '#334155',
    shadowGlow: 'rgba(59, 130, 246, 0.35)',
    cardHover: '#334155'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('vizhop_theme') || 'royal-violet';
  });

  useEffect(() => {
    localStorage.setItem('vizhop_theme', currentTheme);
    const themeObj = THEMES[currentTheme] || THEMES['royal-violet'];
    const root = document.documentElement;

    root.setAttribute('data-theme', currentTheme);
    root.style.setProperty('--primary', themeObj.primary);
    root.style.setProperty('--primary-hover', themeObj.primaryHover);
    root.style.setProperty('--secondary', themeObj.secondary);
    root.style.setProperty('--accent', themeObj.accent);
    root.style.setProperty('--bg-dark', themeObj.background);
    root.style.setProperty('--bg-surface', themeObj.bgSurface);
    root.style.setProperty('--bg-card', themeObj.bgSurface);
    root.style.setProperty('--bg-card-hover', themeObj.cardHover);
    root.style.setProperty('--text-main', themeObj.textMain);
    root.style.setProperty('--text-muted', themeObj.textMuted);
    root.style.setProperty('--gradient-primary', themeObj.gradient);
    root.style.setProperty('--gradient-hover', themeObj.gradientHover);
    root.style.setProperty('--bg-glass', themeObj.glassBg);
    root.style.setProperty('--border-glass', themeObj.borderGlass);

    // Apply main background color
    document.body.style.backgroundColor = themeObj.background;
    document.body.style.color = themeObj.textMain;
  }, [currentTheme]);

  const changeTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES, activeThemeConfig: THEMES[currentTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
