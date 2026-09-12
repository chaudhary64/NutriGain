'use client';

/*
 * Reserved for future per-user UI preferences. The smoothScroll setting was
 * removed: smooth scrolling is now a fixed design choice scoped to the home
 * page only (see components/LenisProvider.js).
 */

import { createContext, useContext } from 'react';

const UserSettingsContext = createContext(null);

export function UserSettingsProvider({ children }) {
  return (
    <UserSettingsContext.Provider value={{}}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext) || {};
}
