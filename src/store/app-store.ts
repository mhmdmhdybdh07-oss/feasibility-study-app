'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/translations';
import type { CurrencyCode } from '@/lib/currencies';
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/themes';

export interface AppState {
  // إعدادات
  locale: Locale;
  displayCurrency: CurrencyCode;
  theme: 'light' | 'dark';
  displayMode: 'light' | 'dark' | 'auto' | 'reading';
  themeId: string;
  settings: AppSettings;

  // المشروع الحالي
  currentProjectId: string | null;

  // القسم الحالي
  activeSection: string;

  // إجراءات
  setLocale: (locale: Locale) => void;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDisplayMode: (mode: 'light' | 'dark' | 'auto' | 'reading') => void;
  setThemeId: (themeId: string) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setCurrentProjectId: (id: string | null) => void;
  setActiveSection: (section: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'ar',
      displayCurrency: 'YER',
      theme: 'light',
      displayMode: 'light',
      themeId: 'teal',
      settings: DEFAULT_SETTINGS,
      currentProjectId: null,
      activeSection: 'dashboard',

      setLocale: (locale) => set({ locale }),
      setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),
      setTheme: (theme) => set({ theme }),
      setDisplayMode: (displayMode) => set({ displayMode, theme: displayMode === 'dark' ? 'dark' : 'light' }),
      setThemeId: (themeId) => set({ themeId }),
      setSettings: (partial) => set((state) => ({ settings: { ...state.settings, ...partial } })),
      setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
      setActiveSection: (activeSection) => set({ activeSection }),
    }),
    {
      name: 'feasibility-app-store',
    }
  )
);
