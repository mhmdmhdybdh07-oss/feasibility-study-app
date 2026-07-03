// نظام الثيمات والإعدادات العامة

export interface Theme {
  id: string;
  nameAr: string;
  nameEn: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  warning: string;
  danger: string;
  fontFamily: string;
  description: string;
}

export const THEMES: Theme[] = [
  {
    id: 'teal',
    nameAr: 'فيروزي كلاسيكي',
    nameEn: 'Classic Teal',
    primary: '#0d9488',
    secondary: '#0f766e',
    accent: '#facc15',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#1f2937',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    fontFamily: 'Cairo',
    description: 'الثيم الافتراضي - فيروزي مع لمسات صفراء',
  },
  {
    id: 'royal',
    nameAr: 'ملكي أزرق',
    nameEn: 'Royal Blue',
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#fbbf24',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    success: '#16a34a',
    warning: '#eab308',
    danger: '#dc2626',
    fontFamily: 'Cairo',
    description: 'أزرق ملكي فخم - مناسب للشركات الكبيرة',
  },
  {
    id: 'desert',
    nameAr: 'صحراوي',
    nameEn: 'Desert',
    primary: '#c2410c',
    secondary: '#9a3412',
    accent: '#fde68a',
    background: '#fffbeb',
    surface: '#ffffff',
    text: '#451a03',
    success: '#15803d',
    warning: '#ca8a04',
    danger: '#b91c1c',
    fontFamily: 'Cairo',
    description: 'برتقالي صحراوي - يناسب البيئة اليمنية',
  },
  {
    id: 'forest',
    nameAr: 'غابي أخضر',
    nameEn: 'Forest Green',
    primary: '#15803d',
    secondary: '#166534',
    accent: '#fbbf24',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
    success: '#16a34a',
    warning: '#ca8a04',
    danger: '#dc2626',
    fontFamily: 'Cairo',
    description: 'أخضر غابي - مثالي للمشاريع الزراعية',
  },
  {
    id: 'midnight',
    nameAr: 'ليلي داكن',
    nameEn: 'Midnight Dark',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#f472b6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    fontFamily: 'Cairo',
    description: 'داكن أنيق - مريح للعين في الإضاءة المنخفضة',
  },
  {
    id: 'gold',
    nameAr: 'ذهبي فاخر',
    nameEn: 'Luxury Gold',
    primary: '#a16207',
    secondary: '#854d0e',
    accent: '#fbbf24',
    background: '#fefce8',
    surface: '#ffffff',
    text: '#422006',
    success: '#16a34a',
    warning: '#eab308',
    danger: '#dc2626',
    fontFamily: 'Cairo',
    description: 'ذهبي فاخر - مناسب للمشاريع الراقية',
  },
  {
    id: 'coral',
    nameAr: 'مرجاني',
    nameEn: 'Coral',
    primary: '#e11d48',
    secondary: '#be123c',
    accent: '#06b6d4',
    background: '#fff1f2',
    surface: '#ffffff',
    text: '#4c0519',
    success: '#16a34a',
    warning: '#eab308',
    danger: '#dc2626',
    fontFamily: 'Cairo',
    description: 'وردي مرجاني حيوي',
  },
  {
    id: 'slate',
    nameAr: 'رمادي احترافي',
    nameEn: 'Professional Slate',
    primary: '#475569',
    secondary: '#334155',
    accent: '#0ea5e9',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    success: '#16a34a',
    warning: '#eab308',
    danger: '#dc2626',
    fontFamily: 'Cairo',
    description: 'رمادي احترافي - رسمي وهادئ',
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// تطبيق الثيم على المتغيرات CSS
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-foreground', theme.text);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
  root.style.setProperty('--color-danger', theme.danger);
  // تطبيق متغيرات shadcn
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--accent', theme.accent);
}

export interface AppSettings {
  themeId: string;
  organizationName: string;
  organizationLogo: string;
  reportHeader: string;
  reportFooter: string;
  currency: string;
  language: 'ar' | 'en';
  defaultDiscountRate: number;
  defaultVatRate: number;
  defaultIncomeTax: number;
  fontSize: 'small' | 'medium' | 'large';
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'teal',
  organizationName: '',
  organizationLogo: '',
  reportHeader: 'تقرير دراسة الجدوى',
  reportFooter: `© ${new Date().getFullYear()} - برنامج إعداد دراسات الجدوى`,
  currency: 'YER',
  language: 'ar',
  defaultDiscountRate: 10,
  defaultVatRate: 5,
  defaultIncomeTax: 15,
  fontSize: 'medium',
};
