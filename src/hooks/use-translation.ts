'use client';

import { useAppStore } from '@/store/app-store';
import { t as translate, type TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);
  const t = (key: TranslationKey) => translate(locale, key);
  return { t, locale };
}
