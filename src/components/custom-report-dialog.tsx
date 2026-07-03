'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Image as ImageIcon, Palette, Loader2 } from 'lucide-react';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';

const SECTIONS = [
  { key: 'cover', ar: 'صفحة الغلاف', en: 'Cover Page' },
  { key: 'executiveSummary', ar: 'الملخص التنفيذي', en: 'Executive Summary' },
  { key: 'establishment', ar: 'تأسيس المشروع', en: 'Establishment' },
  { key: 'marketStudy', ar: 'الدراسة التسويقية', en: 'Market Study' },
  { key: 'technicalStudy', ar: 'الدراسة الفنية', en: 'Technical Study' },
  { key: 'financialStudy', ar: 'الدراسة المالية', en: 'Financial Study' },
  { key: 'economicStudy', ar: 'الدراسة الاقتصادية', en: 'Economic Study' },
  { key: 'socialStudy', ar: 'الدراسة الاجتماعية', en: 'Social Study' },
  { key: 'environmentalStudy', ar: 'الدراسة البيئية', en: 'Environmental Study' },
  { key: 'legalStudy', ar: 'الدراسة القانونية', en: 'Legal Study' },
  { key: 'indicators', ar: 'المؤشرات المالية', en: 'Financial Indicators' },
  { key: 'recommendations', ar: 'التوصيات', en: 'Recommendations' },
];

const COLOR_PRESETS = [
  { name: 'فيروزي', value: '#0d9488' },
  { name: 'أزرق', value: '#2563eb' },
  { name: 'بنفسجي', value: '#7c3aed' },
  { name: 'أخضر', value: '#16a34a' },
  { name: 'برتقالي', value: '#ea580c' },
  { name: 'وردي', value: '#db2777' },
  { name: 'رمادي', value: '#475569' },
  { name: 'أحمر', value: '#dc2626' },
];

export function CustomReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);

  const [selectedSections, setSelectedSections] = useState<string[]>(SECTIONS.map((s) => s.key));
  const [logo, setLogo] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#0d9488');
  const [header, setHeader] = useState<string>('تقرير دراسة الجدوى');
  const [footer, setFooter] = useState<string>('© ' + new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleToggle = (key: string) => {
    setSelectedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleGenerate = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const html = buildReportHTML(project, {
        sections: selectedSections,
        logo,
        primaryColor,
        header,
        footer,
        currency: displayCurrency as CurrencyCode,
        locale,
      });
      const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}-تقرير.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: t('reportGenerate') + ' ✓' });
      onOpenChange(false);
    } catch (e) {
      toast({ title: t('exportFailed'), description: (e as Error).message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            {t('customReportBuilder')}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar' ? 'أنشئ تقريراً مخصصاً بهويتك واختيار أقسامك' : 'Create a custom branded report with your selected sections'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* اختيار الأقسام */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">{t('reportSections')}</Label>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectedSections(SECTIONS.map((s) => s.key))}>
                  {t('selectAll')}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectedSections([])}>
                  {t('deselectAll')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SECTIONS.map((s) => (
                <Card
                  key={s.key}
                  className={`p-2 cursor-pointer transition-all ${selectedSections.includes(s.key) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  onClick={() => handleToggle(s.key)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedSections.includes(s.key)} readOnly />
                    <span className="text-xs">{locale === 'ar' ? s.ar : s.en}</span>
                  </div>
                </Card>
              ))}
            </div>
            <Badge variant="secondary" className="mt-2 text-[10px]">
              {selectedSections.length} / {SECTIONS.length}
            </Badge>
          </div>

          {/* الهوية */}
          <div className="border-t pt-3">
            <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
              <Palette className="size-4" />
              {t('reportBranding')}
            </Label>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('reportLogo')}</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://... أو ارفع صورة"
                    className="text-sm flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <ImageIcon className="size-4" />
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
                {logo && <img src={logo} alt="logo" className="size-12 object-contain border rounded p-1" />}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t('reportPrimaryColor')}</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setPrimaryColor(c.value)}
                      className={`size-7 rounded-md border-2 transition-all ${primaryColor === c.value ? 'scale-110 border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="size-7 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t('reportHeader')}</Label>
                <Input value={header} onChange={(e) => setHeader(e.target.value)} className="text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t('reportFooter')}</Label>
                <Input value={footer} onChange={(e) => setFooter(e.target.value)} className="text-sm" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleGenerate} disabled={generating || selectedSections.length === 0}>
            {generating ? <Loader2 className="size-4 me-2 animate-spin" /> : <Download className="size-4 me-2" />}
            {t('reportGenerate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildReportHTML(project: any, opts: {
  sections: string[];
  logo: string;
  primaryColor: string;
  header: string;
  footer: string;
  currency: CurrencyCode;
  locale: 'ar' | 'en';
}): string {
  const cur = CURRENCIES[opts.currency];
  const dir = opts.locale === 'ar' ? 'rtl' : 'ltr';
  const lang = opts.locale === 'ar' ? 'ar' : 'en';
  const fmt = (yer: number) => formatCurrency(yer, opts.currency, opts.locale);

  const sectionHTML: string[] = [];

  if (opts.sections.includes('cover')) {
    sectionHTML.push(`
      <div style="page-break-after: always; text-align:center; padding-top: 150px;">
        ${opts.logo ? `<img src="${opts.logo}" style="max-width:180px; max-height:180px; margin-bottom: 30px;" />` : ''}
        <h1 style="color: ${opts.primaryColor}; font-size: 36pt; margin-bottom: 12px;">${opts.header}</h1>
        <h2 style="font-size: 24pt; color: #555;">${project.name}</h2>
        ${project.description ? `<p style="font-size: 14pt; color: #777; max-width: 600px; margin: 20px auto;">${project.description}</p>` : ''}
        <p style="margin-top: 60px; color: #999; font-size: 12pt;">${new Date().toLocaleDateString(opts.locale === 'ar' ? 'ar-YE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    `);
  }

  const renderStudy = (title: string, data: any) => {
    if (!data || typeof data !== 'object') return '';
    const rows = Object.entries(data)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => {
        let val: any = v;
        if (typeof v === 'number' && v > 1000) val = fmt(v);
        return `<tr><td style="padding:6px 10px; border:1px solid #ddd; background:#f9f9f9; width:35%;"><b>${k}</b></td><td style="padding:6px 10px; border:1px solid #ddd;">${val}</td></tr>`;
      }).join('');
    return `<h2 style="color: ${opts.primaryColor}; border-bottom: 2px solid ${opts.primaryColor}; padding-bottom: 6px; margin-top: 30px;">${title}</h2><table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">${rows}</table>`;
  };

  if (opts.sections.includes('executiveSummary')) {
    sectionHTML.push(`<h2 style="color: ${opts.primaryColor}; border-bottom: 2px solid ${opts.primaryColor}; padding-bottom: 6px;">${opts.locale === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}</h2>
      <p>يقدم هذا التقرير دراسة جدوى متكاملة لمشروع <b>${project.name}</b>. ${project.description || ''}</p>`);
  }

  if (opts.sections.includes('establishment')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'تأسيس المشروع' : 'Establishment', project.establishment));
  if (opts.sections.includes('marketStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة التسويقية' : 'Market Study', project.marketStudy));
  if (opts.sections.includes('technicalStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة الفنية' : 'Technical Study', project.technicalStudy));
  if (opts.sections.includes('financialStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة المالية' : 'Financial Study', project.financialStudy));
  if (opts.sections.includes('economicStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة الاقتصادية' : 'Economic Study', project.economicStudy));
  if (opts.sections.includes('socialStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة الاجتماعية' : 'Social Study', project.socialStudy));
  if (opts.sections.includes('environmentalStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة البيئية' : 'Environmental Study', project.environmentalStudy));
  if (opts.sections.includes('legalStudy')) sectionHTML.push(renderStudy(opts.locale === 'ar' ? 'الدراسة القانونية' : 'Legal Study', project.legalStudy));

  if (opts.sections.includes('indicators')) {
    const fin = project.financialStudy || {};
    const eco = project.economicStudy || {};
    const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
    const totalRev = yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0);
    const totalCost = yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0);
    const initInv = Number(fin.initialInvestment) || 0;
    sectionHTML.push(`<h2 style="color: ${opts.primaryColor}; border-bottom: 2px solid ${opts.primaryColor}; padding-bottom: 6px;">${opts.locale === 'ar' ? 'المؤشرات المالية' : 'Financial Indicators'}</h2>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><b>${opts.locale === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}</b></td><td style="padding: 8px; border: 1px solid #ddd;">${fmt(initInv)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><b>${opts.locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenues'}</b></td><td style="padding: 8px; border: 1px solid #ddd;">${fmt(totalRev)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><b>${opts.locale === 'ar' ? 'إجمالي التكاليف' : 'Total Costs'}</b></td><td style="padding: 8px; border: 1px solid #ddd;">${fmt(totalCost)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><b>${opts.locale === 'ar' ? 'صافي الربح' : 'Net Profit'}</b></td><td style="padding: 8px; border: 1px solid #ddd;">${fmt(totalRev - totalCost)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><b>${opts.locale === 'ar' ? 'معدل الخصم' : 'Discount Rate'}</b></td><td style="padding: 8px; border: 1px solid #ddd;">${eco.discountRate || 10}%</td></tr>
      </table>`);
  }

  if (opts.sections.includes('recommendations')) {
    sectionHTML.push(`<h2 style="color: ${opts.primaryColor}; border-bottom: 2px solid ${opts.primaryColor}; padding-bottom: 6px;">${opts.locale === 'ar' ? 'التوصيات' : 'Recommendations'}</h2>
      <ul style="padding-${dir === 'rtl' ? 'right' : 'left'}: 20px;">
        <li>${opts.locale === 'ar' ? 'متابعة المؤشرات المالية بشكل دوري' : 'Monitor financial indicators periodically'}</li>
        <li>${opts.locale === 'ar' ? 'تنويع مصادر الإيرادات' : 'Diversify revenue sources'}</li>
        <li>${opts.locale === 'ar' ? 'بناء احتياطي نقدي للطوارئ' : 'Build emergency cash reserves'}</li>
        <li>${opts.locale === 'ar' ? 'مراجعة المخاطر بشكل مستمر' : 'Continuously review risks'}</li>
      </ul>`);
  }

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${project.name} - ${opts.header}</title>
<style>
@page { size: A4; margin: 2cm; }
body { font-family: 'Cairo', 'Arial', sans-serif; font-size: 12pt; line-height: 1.7; color: #222; }
h1 { color: ${opts.primaryColor}; }
h2 { color: ${opts.primaryColor}; page-break-after: avoid; }
h3 { color: ${opts.primaryColor}; }
table { page-break-inside: avoid; }
.header-bar { background: ${opts.primaryColor}; color: white; padding: 8px 16px; text-align: center; margin-bottom: 20px; font-weight: bold; }
.footer-bar { border-top: 2px solid ${opts.primaryColor}; padding-top: 8px; margin-top: 40px; text-align: center; color: #777; font-size: 10pt; }
</style>
</head>
<body>
<div class="header-bar">${opts.header}</div>
${sectionHTML.join('\n')}
<div class="footer-bar">${opts.footer}</div>
</body>
</html>`;
}
