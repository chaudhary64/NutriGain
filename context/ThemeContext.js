'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Theme context — "light" | "dark".
 *
 * Resolution order:
 *   1. The user's saved choice (DB -> localStorage fallback)
 *   2. OS preference on first visit (no saved choice anywhere)
 *
 * The choice is written to <html data-theme="..."> so CSS variables can
 * react before/independent of React, persisted to localStorage instantly,
 * and synced to the user's account (follows them across devices).
 * toggleTheme() accepts no argument (pure toggle); setTheme() pins one.
 */
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Resolve initial theme: saved choice, else OS preference.
  useEffect(() => {
    let resolved = null;
    const stored = localStorage.getItem('nutrigain_theme');
    if (stored === 'light' || stored === 'dark') {
      resolved = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      resolved = 'dark';
    }
    if (resolved) setThemeState(resolved);
    setMounted(true);
  }, []);

  // Adopt the account's saved theme when the user loads.
  const { user } = useAuth();
  useEffect(() => {
    if (user && (user.theme === 'light' || user.theme === 'dark')) {
      setThemeState(user.theme);
      localStorage.setItem('nutrigain_theme', user.theme);
    }
  }, [user]);

  // Reflect onto <html> for CSS.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  const setTheme = (next) => {
    setThemeState(next);
    localStorage.setItem('nutrigain_theme', next);
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
