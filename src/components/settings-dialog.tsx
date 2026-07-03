'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { THEMES, getThemeById, DEFAULT_SETTINGS, type AppSettings } from '@/lib/themes';
import { CURRENCY_LIST } from '@/lib/currencies';
import { Palette, Building2, Sliders, Upload, Check, RotateCcw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const { toast } = useToast();
  const themeId = useAppStore((s) => s.themeId);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [tab, setTab] = useState<'theme' | 'organization' | 'defaults'>('theme');

  const handleSave = () => {
    setSettings(localSettings);
    setThemeId(localSettings.themeId);
    toast({ title: locale === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved' });
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setThemeId('teal');
    toast({ title: locale === 'ar' ? 'تم استعادة الإعدادات الافتراضية' : 'Reset to defaults' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLocalSettings((p) => ({ ...p, organizationLogo: reader.result as string }));
    reader.readAsDataURL(f);
  };

  const currentTheme = getThemeById(localSettings.themeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="size-5 text-primary" />
            {locale === 'ar' ? 'الإعدادات والثيمات' : 'Settings & Themes'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar' ? 'تخصيص البرنامج بالكامل: الثيم، الهوية، الإعدادات الافتراضية' : 'Customize the app: theme, branding, defaults'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme"><Palette className="size-4 me-1" />{locale === 'ar' ? 'الثيمات' : 'Themes'}</TabsTrigger>
            <TabsTrigger value="organization"><Building2 className="size-4 me-1" />{locale === 'ar' ? 'الهوية' : 'Branding'}</TabsTrigger>
            <TabsTrigger value="defaults"><Sliders className="size-4 me-1" />{locale === 'ar' ? 'الإعدادات' : 'Defaults'}</TabsTrigger>
          </TabsList>

          {/* تبويب الثيمات */}
          <TabsContent value="theme" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <Card
                  key={t.id}
                  className={cn(
                    'p-3 cursor-pointer transition-all',
                    localSettings.themeId === t.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                  )}
                  onClick={() => {
                    setLocalSettings((p) => ({ ...p, themeId: t.id }));
                    setThemeId(t.id); // معاينة فورية
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      <div className="size-4 rounded-full" style={{ backgroundColor: t.primary }} />
                      <div className="size-4 rounded-full" style={{ backgroundColor: t.accent }} />
                      <div className="size-4 rounded-full" style={{ backgroundColor: t.background, border: '1px solid #ccc' }} />
                    </div>
                    {localSettings.themeId === t.id && <Check className="size-3.5 text-emerald-600 ms-auto" />}
                  </div>
                  <div className="font-medium text-xs">{locale === 'ar' ? t.nameAr : t.nameEn}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</div>
                </Card>
              ))}
            </div>

            {/* معاينة الثيم */}
            <Card className="p-3" style={{ backgroundColor: currentTheme.surface, color: currentTheme.text }}>
              <div className="text-xs mb-2 opacity-70">{locale === 'ar' ? 'معاينة الثيم:' : 'Theme preview:'}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: currentTheme.primary, color: 'white' }}>{locale === 'ar' ? 'زر أساسي' : 'Primary button'}</Badge>
                  <Badge style={{ backgroundColor: currentTheme.accent, color: currentTheme.text }}>{locale === 'ar' ? 'زر ثانوي' : 'Secondary'}</Badge>
                  <Badge style={{ backgroundColor: currentTheme.success, color: 'white' }}>{locale === 'ar' ? 'نجاح' : 'Success'}</Badge>
                  <Badge style={{ backgroundColor: currentTheme.warning, color: 'white' }}>{locale === 'ar' ? 'تحذير' : 'Warning'}</Badge>
                  <Badge style={{ backgroundColor: currentTheme.danger, color: 'white' }}>{locale === 'ar' ? 'خطر' : 'Danger'}</Badge>
                </div>
                <div className="p-2 rounded text-xs" style={{ backgroundColor: currentTheme.background }}>
                  {locale === 'ar' ? 'هذا مثال على نص داخل صندوق بخلفية الثيم' : 'Sample text inside themed box'}
                </div>
              </div>
            </Card>

            {/* حجم الخط */}
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'حجم الخط' : 'Font size'}</Label>
              <Select value={localSettings.fontSize} onValueChange={(v) => setLocalSettings((p) => ({ ...p, fontSize: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{locale === 'ar' ? 'صغير' : 'Small'} (14px)</SelectItem>
                  <SelectItem value="medium">{locale === 'ar' ? 'متوسط' : 'Medium'} (16px)</SelectItem>
                  <SelectItem value="large">{locale === 'ar' ? 'كبير' : 'Large'} (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* تبويب الهوية */}
          <TabsContent value="organization" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'اسم المؤسسة/الشركة' : 'Organization name'}</Label>
              <Input
                value={localSettings.organizationName}
                onChange={(e) => setLocalSettings((p) => ({ ...p, organizationName: e.target.value }))}
                placeholder={locale === 'ar' ? 'مثال: شركة الأمل للاستشارات' : 'e.g. Al-Amal Consulting'}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'شعار المؤسسة' : 'Organization logo'}</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={localSettings.organizationLogo}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, organizationLogo: e.target.value }))}
                  placeholder={locale === 'ar' ? 'URL أو ارفع صورة' : 'URL or upload'}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" />
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
              {localSettings.organizationLogo && (
                <img src={localSettings.organizationLogo} alt="logo" className="size-16 object-contain border rounded p-1" />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'ترويسة التقارير' : 'Report header'}</Label>
              <Input
                value={localSettings.reportHeader}
                onChange={(e) => setLocalSettings((p) => ({ ...p, reportHeader: e.target.value }))}
                placeholder={locale === 'ar' ? 'مثال: دراسة جدوى اقتصادية' : 'e.g. Economic Feasibility Study'}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'تذييل التقارير' : 'Report footer'}</Label>
              <Input
                value={localSettings.reportFooter}
                onChange={(e) => setLocalSettings((p) => ({ ...p, reportFooter: e.target.value }))}
                placeholder={locale === 'ar' ? 'مثال: © 2026 ...' : '© 2026 ...'}
              />
            </div>
          </TabsContent>

          {/* تبويب الإعدادات الافتراضية */}
          <TabsContent value="defaults" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'ar' ? 'العملة الافتراضية' : 'Default currency'}</Label>
                <Select value={localSettings.currency} onValueChange={(v) => setLocalSettings((p) => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCY_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {locale === 'ar' ? c.nameAr : c.nameEn} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'ar' ? 'اللغة الافتراضية' : 'Default language'}</Label>
                <Select value={localSettings.language} onValueChange={(v) => setLocalSettings((p) => ({ ...p, language: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'ar' ? 'معدل الخصم الافتراضي %' : 'Default discount rate %'}</Label>
                <Input
                  type="number"
                  value={localSettings.defaultDiscountRate}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, defaultDiscountRate: Number(e.target.value) || 0 }))}
                  step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'ar' ? 'معدل VAT الافتراضي %' : 'Default VAT rate %'}</Label>
                <Input
                  type="number"
                  value={localSettings.defaultVatRate}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, defaultVatRate: Number(e.target.value) || 0 }))}
                  step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'ar' ? 'ضريبة الدخل الافتراضية %' : 'Default income tax %'}</Label>
                <Input
                  type="number"
                  value={localSettings.defaultIncomeTax}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, defaultIncomeTax: Number(e.target.value) || 0 }))}
                  step="0.5"
                />
              </div>
            </div>

            <Card className="p-3 bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground">
                💡 {locale === 'ar'
                  ? 'هذه القيم ستُستخدم تلقائياً عند إنشاء دراسات جدوى جديدة'
                  : 'These values will be auto-applied to new feasibility studies'}
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
            <RotateCcw className="size-4 me-1.5" />
            {locale === 'ar' ? 'استعادة الافتراضي' : 'Reset Defaults'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave}>
              <Save className="size-4 me-1.5" />
              {locale === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
