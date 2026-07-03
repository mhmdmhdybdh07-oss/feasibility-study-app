'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { setCustomRates } from '@/lib/currencies';
import { applyTheme, getThemeById } from '@/lib/themes';

export function AppProvider({ children }: { children: ReactNode }) {
  const locale = useAppStore((s) => s.locale);
  const theme = useAppStore((s) => s.theme);
  const displayMode = useAppStore((s) => s.displayMode);
  const themeId = useAppStore((s) => s.themeId);
  const fontSize = useAppStore((s) => s.settings.fontSize);

  // مزامنة الاتجاه واللغة مع html
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  // مزامنة السمة (فاتح/داكن)
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // تطبيق الثيم المختار
  useEffect(() => {
    const themeData = getThemeById(themeId);
    applyTheme(themeData);
  }, [themeId]);

  // تطبيق حجم الخط + وضع العرض
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
    // وضع القراءة
    if (displayMode === 'reading') {
      html.classList.add('reading-mode');
    } else {
      html.classList.remove('reading-mode');
    }
    // الوضع التلقائي
    if (displayMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) html.classList.add('dark');
      else html.classList.remove('dark');
    }
  }, [fontSize, displayMode]);

  // تحميل أسعار الصرف المخصصة عند البدء
  useEffect(() => {
    fetch('/api/settings/exchange-rates')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.rates) setCustomRates(data.rates);
      })
      .catch(() => {});
  }, []);

  // تسجيل Service Worker للعمل بدون إنترنت
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered for offline mode'))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }, []);

  return <>{children}</>;
}
