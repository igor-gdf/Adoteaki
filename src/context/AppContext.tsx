'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';
import type { SessionUser } from '@/server/auth/session';

interface AppContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: typeof dictionaries['pt-BR'];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: SessionUser | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (email: string, password: string) => Promise<boolean>;
  favoriteIds: string[];
  toggleFavorite: (animalId: string) => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      }
      const favRes = await fetch('/api/favorites', { cache: 'no-store' });
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavoriteIds(favData.favoriteIds || []);
      }
    } catch {
      // ignore offline
    }
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem('adoteaki_locale') as Locale | null;
    if (savedLocale === 'pt-BR' || savedLocale === 'en') {
      setLocaleState(savedLocale);
    }

    const savedTheme = localStorage.getItem('adoteaki_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    refreshUser();
  }, [refreshUser]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem('adoteaki_locale', loc);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('adoteaki_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setUser(null);
    setFavoriteIds([]);
  };

  const quickLoginAs = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    if (res.ok) {
      await refreshUser();
      return true;
    }
    return false;
  };

  const toggleFavorite = async (animalId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const isFav = favoriteIds.includes(animalId);
    setFavoriteIds((prev) =>
      isFav ? prev.filter((id) => id !== animalId) : [...prev, animalId]
    );

    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animalId }),
    });
    if (!res.ok) {
      await refreshUser();
    }
  };

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale],
        theme,
        toggleTheme,
        user,
        refreshUser,
        logout,
        quickLoginAs,
        favoriteIds,
        toggleFavorite,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
