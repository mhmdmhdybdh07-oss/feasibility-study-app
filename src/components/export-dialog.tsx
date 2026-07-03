'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { FileText, FileSpreadsheet, FileJson, Printer, Loader2, FileType, Presentation } from 'lucide-react';
import { formatCurrency, convertFromYER, CURRENCIES } from '@/lib/currencies';

type ExportFormat = 'pdf' | 'excel' | 'json' | 'print' | 'word' | 'pptx';

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const locale = useAppStore((s) => s.locale);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const { data: project } = useProject(currentProjectId);

  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!project) return;
    setExporting(format);
    try {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${project.name}.json`);
      } else if (format === 'excel') {
        // تصدير Excel حقيقي عبر API
        const res = await fetch(`/api/projects/${project.id}/export-xlsx?currency=${displayCurrency}`);
        if (!res.ok) throw new Error('Failed to export xlsx');
        const blob = await res.blob();
        downloadBlob(blob, `${project.name}.xlsx`);
      } else if (format === 'word') {
        const html = buildWordHTML(project, displayCurrency, locale);
        const blob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
        downloadBlob(blob, `${project.name}.doc`);
      } else if (format === 'pptx') {
        const res = await fetch(`/api/projects/${project.id}/export-pptx?currency=${displayCurrency}`);
        if (!res.ok) throw new Error('Failed to export pptx');
        const blob = await res.blob();
        downloadBlob(blob, `${project.name}.pptx`);
      } else if (format === 'pdf' || format === 'print') {
        // فتح صفحة النتائج ثم طباعتها
        setActiveSection('results');
        setTimeout(() => window.print(), 400);
      }
      toast({ title: t('exportSuccess') });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({ title: t('exportFailed'), variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  const formats: { key: ExportFormat; icon: typeof FileText; title: string; desc: string }[] = [
    { key: 'pdf', icon: FileText, title: t('exportPDF'), desc: locale === 'ar' ? 'تقرير PDF للطباعة' : 'Printable PDF report' },
    { key: 'pptx', icon: Presentation, title: locale === 'ar' ? 'تصدير PowerPoint' : 'Export PowerPoint', desc: locale === 'ar' ? 'عرض تقديمي للمستثمرين' : 'Investor presentation' },
    { key: 'word', icon: FileType, title: t('exportWord'), desc: locale === 'ar' ? 'ملف Word قابل للتحرير' : 'Editable Word document' },
    { key: 'excel', icon: FileSpreadsheet, title: t('exportExcel'), desc: locale === 'ar' ? 'ملف XLSX بـ 9 أوراق' : 'XLSX with 9 sheets' },
    { key: 'json', icon: FileJson, title: t('exportJSON'), desc: locale === 'ar' ? 'نسخة احتياطية كاملة' : 'Full backup' },
    { key: 'print', icon: Printer, title: t('exportPrint'), desc: locale === 'ar' ? 'طباعة مباشرة' : 'Direct print' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('export')}</DialogTitle>
          <DialogDescription>{t('appSubtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2">
          {formats.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.key}
                className="p-4 hover:bg-accent transition-colors cursor-pointer text-center"
                onClick={() => !exporting && handleExport(f.key)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center">
                    {exporting === f.key ? (
                      <Loader2 className="size-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="size-5 text-primary" />
                    )}
                  </div>
                  <div className="font-medium text-sm">{f.title}</div>
                  <div className="text-[10px] text-muted-foreground">{f.desc}</div>
                </div>
              </Card>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function buildCSV(project: any, displayCurrency: string, locale: 'ar' | 'en'): string {
  const lines: string[] = [];
  const cur = CURRENCIES[displayCurrency as keyof typeof CURRENCIES];
  lines.push(`# ${locale === 'ar' ? 'تقرير دراسة الجدوى' : 'Feasibility Study Report'}`);
  lines.push(`${locale === 'ar' ? 'اسم المشروع' : 'Project Name'},${project.name}`);
  lines.push(`${locale === 'ar' ? 'التاريخ' : 'Date'},${new Date().toLocaleString()}`);
  lines.push(`${locale === 'ar' ? 'العملة' : 'Currency'},${cur.nameEn} (${cur.symbol})`);
  lines.push('');

  const addSection = (title: string, data: any) => {
    if (!data) return;
    lines.push(`## ${title}`);
    for (const [k, v] of Object.entries(data)) {
      if (v === null || v === undefined || v === '') continue;
      lines.push(`${k},${formatValue(v as any, displayCurrency, locale)}`);
    }
    lines.push('');
  };

  addSection(locale === 'ar' ? 'تأسيس المشروع' : 'Establishment', project.establishment);
  addSection(locale === 'ar' ? 'الدراسة الاجتماعية' : 'Social Study', project.socialStudy);
  addSection(locale === 'ar' ? 'الدراسة البيئية' : 'Environmental Study', project.environmentalStudy);
  addSection(locale === 'ar' ? 'الدراسة القانونية' : 'Legal Study', project.legalStudy);
  addSection(locale === 'ar' ? 'الدراسة التسويقية' : 'Market Study', project.marketStudy);
  addSection(locale === 'ar' ? 'الدراسة الفنية' : 'Technical Study', project.technicalStudy);
  addSection(locale === 'ar' ? 'الدراسة المالية' : 'Financial Study', project.financialStudy);
  addSection(locale === 'ar' ? 'الدراسة الاقتصادية' : 'Economic Study', project.economicStudy);

  return lines.join('\n');
}

function formatValue(value: any, currency: string, locale: 'ar' | 'en'): string {
  if (typeof value === 'number') {
    // إذا كان المبلغ كبيراً نسخّره كعملة
    if (value > 1000) {
      return formatCurrency(value, currency as any, locale);
    }
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join(' | ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// بناء ملف Word احترافي بصيغة HTML قابل للتحرير في Microsoft Word
function buildWordHTML(project: any, displayCurrency: string, locale: 'ar' | 'en'): string {
  const cur = CURRENCIES[displayCurrency as keyof typeof CURRENCIES];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale === 'ar' ? 'ar' : 'en';
  const title = locale === 'ar' ? 'تقرير دراسة الجدوى' : 'Feasibility Study Report';

  // جلب الإعدادات من localStorage
  let settings: any = {};
  try {
    const stored = localStorage.getItem('feasibility-app-store');
    if (stored) settings = JSON.parse(stored)?.state?.settings ?? {};
  } catch {}

  const orgName = settings.organizationName || '';
  const orgLogo = settings.organizationLogo || '';
  const themeId = settings.themeId || 'teal';
  const header = settings.reportHeader || title;
  const footer = settings.reportFooter || `© ${new Date().getFullYear()}`;

  // ألوان الثيم
  const themes: Record<string, any> = {
    teal: { primary: '#0d9488', accent: '#facc15', dark: '#0f766e', light: '#ccfbf1' },
    royal: { primary: '#1e40af', accent: '#fbbf24', dark: '#1e3a8a', light: '#dbeafe' },
    desert: { primary: '#c2410c', accent: '#fde68a', dark: '#9a3412', light: '#fed7aa' },
    forest: { primary: '#15803d', accent: '#fbbf24', dark: '#166534', light: '#dcfce7' },
    midnight: { primary: '#7c3aed', accent: '#f472b6', dark: '#6d28d9', light: '#ede9fe' },
    gold: { primary: '#a16207', accent: '#fbbf24', dark: '#854d0e', light: '#fef3c7' },
    coral: { primary: '#e11d48', accent: '#06b6d4', dark: '#be123c', light: '#ffe4e6' },
    slate: { primary: '#475569', accent: '#0ea5e9', dark: '#334155', light: '#e2e8f0' },
  };
  const theme = themes[themeId] ?? themes.teal;

  const sections: Array<{ title: string; data: any; icon: string }> = [
    { title: locale === 'ar' ? 'تأسيس المشروع' : 'Project Establishment', data: project.establishment, icon: '📋' },
    { title: locale === 'ar' ? 'الدراسة الاجتماعية' : 'Social Study', data: project.socialStudy, icon: '👥' },
    { title: locale === 'ar' ? 'الدراسة البيئية' : 'Environmental Study', data: project.environmentalStudy, icon: '🌱' },
    { title: locale === 'ar' ? 'الدراسة القانونية' : 'Legal Study', data: project.legalStudy, icon: '⚖️' },
    { title: locale === 'ar' ? 'الدراسة التسويقية' : 'Market Study', data: project.marketStudy, icon: '🛒' },
    { title: locale === 'ar' ? 'الدراسة الفنية' : 'Technical Study', data: project.technicalStudy, icon: '⚙️' },
    { title: locale === 'ar' ? 'الدراسة المالية' : 'Financial Study', data: project.financialStudy, icon: '💰' },
    { title: locale === 'ar' ? 'الدراسة الاقتصادية' : 'Economic Study', data: project.economicStudy, icon: '📈' },
  ];

  // جدول المحتويات
  const tocItems = sections
    .filter((s) => s.data && typeof s.data === 'object')
    .map((s, i) => `<div style='margin:4pt 0;padding:4pt 8pt;background:${theme.light};border-radius:4pt;'>
      <span style='color:${theme.primary};font-weight:bold;'>${i + 1}.</span>
      <span style='margin-${dir === 'rtl' ? 'right' : 'left'}:8pt;'>${s.icon} ${s.title}</span>
    </div>`).join('');

  // أقسام الدراسة
  const sectionsHTML = sections
    .filter((s) => s.data && typeof s.data === 'object')
    .map((s, i) => {
      const rows = Object.entries(s.data)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `<tr>
          <td style='padding:6pt 10pt;border:1pt solid ${theme.primary};background:${theme.light};width:35%;font-weight:bold;'>${k}</td>
          <td style='padding:6pt 10pt;border:1pt solid ${theme.primary};'>${formatValue(v as any, displayCurrency, locale)}</td>
        </tr>`).join('');
      return `
        <div style='page-break-before: always;'></div>
        <h2 style='color:${theme.primary};border-bottom:3pt solid ${theme.accent};padding-bottom:6pt;margin-top:24pt;font-size:18pt;'>
          ${i + 1}. ${s.icon} ${s.title}
        </h2>
        <table style='border-collapse:collapse;width:100%;font-size:11pt;margin-top:12pt;'>${rows}</table>
      `;
    })
    .join('');

  // المؤشرات المالية المختصرة
  const fin = project.financialStudy || {};
  const eco = project.economicStudy || {};
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
  const totalRev = yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0);
  const totalCost = yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0);
  const netProfit = totalRev - totalCost;

  const indicatorsHTML = `
    <div style='page-break-before: always;'></div>
    <h2 style='color:${theme.primary};border-bottom:3pt solid ${theme.accent};padding-bottom:6pt;font-size:18pt;'>
      ${sections.filter(s => s.data).length + 1}. 📊 ${locale === 'ar' ? 'الملخص المالي والمؤشرات' : 'Financial Summary & Indicators'}
    </h2>
    <table style='border-collapse:collapse;width:100%;margin-top:12pt;font-size:12pt;'>
      <tr style='background:${theme.primary};color:white;'>
        <th style='padding:8pt;border:1pt solid ${theme.dark};'>${locale === 'ar' ? 'المؤشر' : 'Indicator'}</th>
        <th style='padding:8pt;border:1pt solid ${theme.dark};'>${locale === 'ar' ? 'القيمة' : 'Value'}</th>
      </tr>
      <tr><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};background:${theme.light};font-weight:bold;'>${locale === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}</td><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};'>${formatValue(Number(fin.initialInvestment) || 0, displayCurrency, locale)}</td></tr>
      <tr><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};background:${theme.light};font-weight:bold;'>${locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenues'}</td><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};'>${formatValue(totalRev, displayCurrency, locale)}</td></tr>
      <tr><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};background:${theme.light};font-weight:bold;'>${locale === 'ar' ? 'إجمالي التكاليف' : 'Total Costs'}</td><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};'>${formatValue(totalCost, displayCurrency, locale)}</td></tr>
      <tr style='background:${netProfit >= 0 ? '#dcfce7' : '#fee2e2'};'><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};font-weight:bold;'>${locale === 'ar' ? 'صافي الربح' : 'Net Profit'}</td><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};font-weight:bold;color:${netProfit >= 0 ? '#16a34a' : '#dc2626'};'>${formatValue(netProfit, displayCurrency, locale)}</td></tr>
      <tr><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};background:${theme.light};font-weight:bold;'>${locale === 'ar' ? 'معدل الخصم' : 'Discount Rate'}</td><td style='padding:6pt 10pt;border:1pt solid ${theme.primary};'>${eco.discountRate || 10}%</td></tr>
    </table>

    <h3 style='color:${theme.dark};margin-top:18pt;'>${locale === 'ar' ? 'التوصيات' : 'Recommendations'}</h3>
    <ul style='font-size:11pt;'>
      <li>${locale === 'ar' ? 'متابعة المؤشرات المالية بشكل دوري' : 'Monitor financial indicators periodically'}</li>
      <li>${locale === 'ar' ? 'تنويع مصادر الإيرادات' : 'Diversify revenue sources'}</li>
      <li>${locale === 'ar' ? 'بناء احتياطي نقدي (10-15%)' : 'Build cash reserves (10-15%)'}</li>
      <li>${locale === 'ar' ? 'مراجعة المخاطر بشكل مستمر' : 'Continuously review risks'}</li>
    </ul>
  `;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${title} - ${project.name}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml><![endif]-->
<style>
@page {
  size: A4;
  margin: 2.5cm 2cm;
  mso-header-margin: 1cm;
  mso-footer-margin: 1cm;
  mso-title-page: yes;
}
body { font-family: 'Cairo', 'Arial', sans-serif; font-size: 12pt; line-height: 1.7; color: #1f2937; }
h1 { color: ${theme.primary}; font-size: 28pt; text-align: center; }
h2 { page-break-before: always; }
h3 { color: ${theme.dark}; }
table { page-break-inside: avoid; }
.cover { text-align: center; padding-top: 150pt; page-break-after: always; }
.cover-logo { max-width: 180pt; max-height: 180pt; margin-bottom: 30pt; }
.cover-title { font-size: 36pt; color: ${theme.primary}; margin-bottom: 12pt; }
.cover-subtitle { font-size: 24pt; color: #555; }
.cover-date { margin-top: 60pt; color: #999; font-size: 14pt; }
.toc { page-break-after: always; }
.toc-title { color: ${theme.primary}; font-size: 24pt; border-bottom: 3pt solid ${theme.accent}; padding-bottom: 8pt; }
.org-banner { background: ${theme.primary}; color: white; padding: 8pt 16pt; text-align: center; font-weight: bold; margin-bottom: 20pt; }
.footer-note { border-top: 2pt solid ${theme.primary}; padding-top: 8pt; margin-top: 40pt; text-align: center; color: #777; font-size: 10pt; }
</style>
</head>
<body>

<!-- صفحة الغلاف -->
<div class="cover">
  ${orgLogo ? `<img src="${orgLogo}" class="cover-logo" />` : ''}
  ${orgName ? `<div style='color:${theme.dark};font-size:14pt;margin-bottom:20pt;'>${orgName}</div>` : ''}
  <h1 class="cover-title">${header}</h1>
  <div class="cover-subtitle">${project.name}</div>
  ${project.description ? `<p style="font-size:13pt;color:#666;max-width:500pt;margin:20pt auto;">${project.description}</p>` : ''}
  <div class="cover-date">
    ${new Date().toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</div>

<!-- شعار المؤسسة في كل الصفحات -->
${orgName ? `<div class="org-banner">${orgName} - ${header}</div>` : ''}

<!-- معلومات أساسية -->
<div style="background:${theme.light};padding:12pt;border-radius:4pt;margin-bottom:20pt;">
  <table style="border-collapse:collapse;width:100%;font-size:11pt;">
    <tr>
      <td style="padding:4pt;"><b>${locale === 'ar' ? 'اسم المشروع' : 'Project'}:</b></td>
      <td style="padding:4pt;">${project.name}</td>
      <td style="padding:4pt;"><b>${locale === 'ar' ? 'التاريخ' : 'Date'}:</b></td>
      <td style="padding:4pt;">${new Date().toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US')}</td>
    </tr>
    <tr>
      <td style="padding:4pt;"><b>${locale === 'ar' ? 'العملة' : 'Currency'}:</b></td>
      <td style="padding:4pt;">${cur.nameEn} (${cur.symbol})</td>
      <td style="padding:4pt;"><b>${locale === 'ar' ? 'الوصف' : 'Description'}:</b></td>
      <td style="padding:4pt;">${project.description || ''}</td>
    </tr>
  </table>
</div>

<!-- جدول المحتويات -->
<div class="toc">
  <h2 class="toc-title" style="page-break-before: avoid;">📚 ${locale === 'ar' ? 'جدول المحتويات' : 'Table of Contents'}</h2>
  <div style="margin-top:16pt;">${tocItems}</div>
  <div style="margin:4pt 0;padding:4pt 8pt;background:${theme.light};border-radius:4pt;">
    <span style='color:${theme.primary};font-weight:bold;'>${sections.filter(s => s.data).length + 1}.</span>
    <span style='margin-${dir === 'rtl' ? 'right' : 'left'}:8pt;'>📊 ${locale === 'ar' ? 'الملخص المالي والمؤشرات' : 'Financial Summary & Indicators'}</span>
  </div>
</div>

<!-- أقسام الدراسة -->
${sectionsHTML}

<!-- الملخص المالي -->
${indicatorsHTML}

<!-- التذييل -->
<div class="footer-note">
  ${footer}
  ${orgName ? ` • ${orgName}` : ''}
</div>

</body>
</html>`;
}
