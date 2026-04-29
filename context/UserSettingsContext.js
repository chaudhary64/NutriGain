'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UserSettingsContext = createContext();

export function UserSettingsProvider({ children }) {
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('nutrigain_smooth_scroll');
    if (stored !== null) {
      setSmoothScroll(stored === 'true');
    }
    setMounted(true);
  }, []);

  const toggleSmoothScroll = (value) => {
    const newVal = value !== undefined ? value : !smoothScroll;
    setSmoothScroll(newVal);
    localStorage.setItem('nutrigain_smooth_scroll', String(newVal));
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
