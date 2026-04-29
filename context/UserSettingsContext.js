'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const UserSettingsContext = createContext();

export function UserSettingsProvider({ children }) {
  const { user } = useAuth();
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Seed from DB value when user loads, fall back to localStorage
  useEffect(() => {
    if (user) {
      if (user.smoothScroll !== undefined) {
        // DB is source of truth
        setSmoothScroll(user.smoothScroll);
        localStorage.setItem('nutrigain_smooth_scroll', String(user.smoothScroll));
      } else {
        // User existed before this field was added — check localStorage
        const stored = localStorage.getItem('nutrigain_smooth_scroll');
        setSmoothScroll(stored !== null ? stored === 'true' : true);
      }
    } else if (!mounted) {
      // Not logged in yet — use localStorage so UI doesn't flash
      const stored = localStorage.getItem('nutrigain_smooth_scroll');
      if (stored !== null) {
        setSmoothScroll(stored === 'true');
      }
    }
    setMounted(true);
  }, [user]);

  const toggleSmoothScroll = async (value) => {
    const newVal = value !== undefined ? value : !smoothScroll;

    // Optimistic update — instant UI response
    setSmoothScroll(newVal);
    localStorage.setItem('nutrigain_smooth_scroll', String(newVal));

    // Persist to database
    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smoothScroll: newVal }),
      });
    } catch (error) {
      console.error('[UserSettings] Failed to save smoothScroll to DB:', error);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ smoothScroll, toggleSmoothScroll, mounted }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}
