// نظام العملات - الريال اليمني هو العملة الرئيسية

export type CurrencyCode = 'YER' | 'USD' | 'SAR' | 'AED' | 'EGP' | 'KWD' | 'QAR' | 'BHD' | 'OMR' | 'JOD';

export interface CurrencyInfo {
  code: CurrencyCode;
  nameAr: string;
  nameEn: string;
  symbol: string;
  rateToYER: number; // معدل الصرف مقابل الريال اليمني
}

// معدلات الصرف الافتراضية (يمكن تحديثها من واجهة الإعدادات)
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  YER: { code: 'YER', nameAr: 'ريال يمني', nameEn: 'Yemeni Rial', symbol: '﷼', rateToYER: 1 },
  USD: { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', rateToYER: 530 },
  SAR: { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', rateToYER: 141 },
  AED: { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ', rateToYER: 144 },
  EGP: { code: 'EGP', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', symbol: 'ج.م', rateToYER: 17 },
  KWD: { code: 'KWD', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', symbol: 'د.ك', rateToYER: 1730 },
  QAR: { code: 'QAR', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', symbol: 'ر.ق', rateToYER: 145 },
  BHD: { code: 'BHD', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar', symbol: 'د.ب', rateToYER: 1405 },
  OMR: { code: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial', symbol: 'ر.ع', rateToYER: 1375 },
  JOD: { code: 'JOD', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar', symbol: 'د.أ', rateToYER: 746 },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

// معدلات الصرف المخصصة (تُحمّل من قاعدة البيانات)
let customRates: Record<string, number> | null = null;

export function setCustomRates(rates: Record<string, number> | null) {
  customRates = rates;
}

export function getRate(currency: CurrencyCode): number {
  if (customRates && customRates[currency] != null) return customRates[currency];
  return CURRENCIES[currency].rateToYER;
}

// تحويل المبلغ من الريال اليمني إلى عملة العرض
export function convertFromYER(amountYER: number, toCurrency: CurrencyCode): number {
  const rate = getRate(toCurrency);
  return amountYER / rate;
}

// تحويل المبلغ من عملة العرض إلى الريال اليمني
export function convertToYER(amount: number, fromCurrency: CurrencyCode): number {
  const rate = getRate(fromCurrency);
  return amount * rate;
}

// تنسيق المبلغ مع رمز العملة
export function formatCurrency(amountYER: number, displayCurrency: CurrencyCode, lang: 'ar' | 'en' = 'ar'): string {
  const converted = convertFromYER(amountYER, displayCurrency);
  const info = CURRENCIES[displayCurrency];
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-YE' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
  return lang === 'ar' ? `${formatted} ${info.symbol}` : `${info.symbol}${formatted}`;
}

// تنسيق الأرقام فقط
export function formatNumber(value: number, lang: 'ar' | 'en' = 'ar'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-YE' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
