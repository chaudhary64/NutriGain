'use client';

import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Theme context — "light" | "dark".
 *
 * Resolution order, identical to the server's (see app/layout.js):
 *   1. A choice made in this session (the toggle)
 *   2. The account's saved theme
 *   3. The theme the page already opened in — server-rendered, from the
 *      preference cookie or the account; the OS preference on a first visit
 *
 * The server paints <html data-theme> with steps 2–3 before the page is sent,
 * so nothing here has to *decide* the first theme. It reads what is already
 * showing, which is why there is no change-on-mount: the toggle, the page and
 * the pixels all start on the same value.
 *
 * Everything written goes to three places: this state, localStorage (for the
 * pre-paint script) and the ng_theme cookie (for the server's next render).
 * toggleTheme() accepts no argument (pure toggle); setTheme() pins one.
 */
const ThemeContext = createContext();

const STORAGE_KEY = 'nutrigain_theme';
const COOKIE = 'ng_theme';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const CANVAS = { light: '#fafafa', dark: '#0a0a0a' };

/* Layout effects never run on the server, so fall back to the passive effect
   there to keep React from warning during SSR. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const isTheme = (value) => value === 'light' || value === 'dark';

/** The theme the document is already showing, resolved by the server script. */
function readAppliedTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (isTheme(attr)) return attr;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* Storage can be denied; the OS preference below still works. */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Storage + cookie, so the next first paint already knows. */
function persistTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Private mode: the cookie below still carries the choice to the server. */
  }
  try {
    document.cookie = `${COOKIE}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    /* Nothing further to try; the in-memory theme still applies. */
  }
}

/** Reflect onto <html> for CSS, the native UI and the bare canvas. */
function paintTheme(theme) {
  const root = document.documentElement;
  // The server usually already painted this; skip the write so a correct
  // first paint is not needlessly mutated.
  if (root.getAttribute('data-theme') !== theme) {
    root.setAttribute('data-theme', theme);
  }
  root.style.colorScheme = theme;
  root.style.backgroundColor = CANVAS[theme];
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  /* Two inputs, both read rather than computed in an effect: the choice the
     user made in this session, and what the server already rendered. */
  const [chosen, setChosen] = useState(null);
  const [applied, setApplied] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Read the theme off <html> before the browser paints the hydrated tree, so
  // the toggle never renders a label that contradicts the page behind it.
  useBeforePaint(() => {
    setApplied(readAppliedTheme());
    setMounted(true);
  }, []);

  const accountTheme = user && isTheme(user.theme) ? user.theme : null;
  const theme = chosen ?? accountTheme ?? applied;

  // Apply before paint so a toggle (or a theme changed on another device)
  // never lands a frame late.
  useBeforePaint(() => {
    if (!mounted) return;
    paintTheme(theme);
    persistTheme(theme);
  }, [theme, mounted]);

  const setTheme = (next) => {
    setChosen(next);
    persistTheme(next);
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
