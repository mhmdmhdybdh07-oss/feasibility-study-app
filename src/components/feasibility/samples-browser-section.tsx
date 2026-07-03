'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SAMPLE_PROJECTS, type SampleProject } from '@/lib/sample-projects';
import { CURRENCIES } from '@/lib/currencies';
import { Loader2, FolderOpen, Sparkles, GitCompare, Trophy, Plus, X, Upload, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';

const COLORS = ['#0d9488', '#facc15', '#f97316', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899'];

export function SamplesBrowserSection() {
  const { locale } = useTranslation();
  const { toast } = useToast();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);

  const filtered = SAMPLE_PROJECTS.filter((s) => {
    const matchesSearch = !search ||
      s.nameAr.includes(search) ||
      s.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'agriculture' && (s.id.includes('farm') || s.id.includes('wheat'))) ||
      (filter === 'industry' && (s.id.includes('factory'))) ||
      (filter === 'service' && (s.id.includes('laundry') || s.id.includes('bakery')));
    return matchesSearch && matchesFilter;
  });

  // المشاريع المختارة للمقارنة
  const compareSamples = SAMPLE_PROJECTS.filter((s) => compareIds.includes(s.id));

  // حساب المؤشرات لكل مشروع نموذجي
  const calcSampleIndicators = (sample: SampleProject) => {
    const data = sample.data as any;
    const fin = data.financialStudy ?? {};
    const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
    const totalRev = yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0);
    const totalCost = yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0);
    const investment = Number(fin.initialInvestment) || 0;
    const netProfit = totalRev - totalCost;
    const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
    const duration = data.establishment?.projectDuration ?? 10;
    const workers = data.technicalStudy?.laborRequired ?? data.socialStudy?.jobsCreated ?? 0;
    return { totalRev, totalCost, investment, netProfit, roi, duration, workers, yearsCount: yearsData.length };
  };

  const handleLoadSample = async (sample: SampleProject) => {
    setLoading(sample.id);
    try {
      const res = await fetch('/api/projects/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sample.id }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ['projects'] });
      setCurrentProjectId(data.project.id);
      setActiveSection('establishment');
      toast({
        title: locale === 'ar' ? 'تم تحميل المشروع النموذجي' : 'Sample loaded',
        description: locale === 'ar' ? 'يمكنك الآن تحريره وتصديره' : 'You can now edit and export it',
      });
    } catch (e) {
      toast({ title: locale === 'ar' ? 'فشل التحميل' : 'Failed', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleExportSample = async (sample: SampleProject, format: 'json' | 'word' | 'html') => {
    setLoading(`${sample.id}-export-${format}`);
    try {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(sample.data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${sample.nameAr}.json`);
      } else if (format === 'word') {
        const html = buildSampleWordHTML(sample, locale);
        const blob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
        downloadBlob(blob, `${sample.nameAr}.doc`);
      } else if (format === 'html') {
        const html = buildSamplePreviewHTML(sample, locale);
        const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8' });
        downloadBlob(blob, `${sample.nameAr}.html`);
      }
      toast({ title: locale === 'ar' ? 'تم التصدير' : 'Exported' });
    } catch (e) {
      toast({ title: locale === 'ar' ? 'فشل التصدير' : 'Failed', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  };

  // === استيراد CSV ===
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: locale === 'ar' ? 'الملف فارغ أو غير صالح' : 'File empty or invalid', variant: 'destructive' });
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1, 6).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
        return obj;
      });
      setCsvPreview(rows);
    };
    reader.readAsText(f, 'UTF-8');
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setCsvImporting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) throw new Error('Invalid CSV');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, j) => { row[h] = values[j] ?? ''; });

        const name = row['name'] || row['اسم المشروع'] || row['projectName'] || `مشروع مستورد ${i}`;
        const investment = Number(row['initialInvestment'] || row['الاستثمار'] || row['investment'] || 0);
        const revenues = Number(row['revenues'] || row['الإيرادات'] || 0);
        const costs = Number(row['costs'] || row['التكاليف'] || 0);
        const duration = Number(row['duration'] || row['المدة'] || 5);

        const yearsData = Array.from({ length: duration }, (_, y) => ({
          year: y + 1,
          revenues: Math.round(revenues / duration),
          costs: Math.round(costs / duration),
        }));

        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description: row['description'] || row['الوصف'] || 'مستورد من CSV',
            mainCurrency: 'YER',
            displayCurrency: 'YER',
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const projectId = data.project.id;

        await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishment: {
              projectName: name,
              projectType: row['type'] || row['النوع'] || 'عام',
              projectSector: row['sector'] || row['القطاع'] || 'عام',
              projectLocation: row['location'] || row['الموقع'] || '',
              projectDuration: duration,
              projectCapital: investment,
            },
            financialStudy: {
              initialInvestment: investment,
              fixedAssets: Math.round(investment * 0.7),
              workingCapital: Math.round(investment * 0.2),
              operatingCosts: Math.round(investment * 0.05),
              yearsData,
            },
            economicStudy: {
              discountRate: Number(row['discountRate'] || row['معدل الخصم'] || 10),
            },
          }),
        });
        imported++;
      }

      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: locale === 'ar' ? `تم استيراد ${imported} مشروع` : `Imported ${imported} projects`,
      });
      setCsvFile(null);
      setCsvPreview(null);
    } catch (e) {
      toast({ title: locale === 'ar' ? 'فشل الاستيراد' : 'Import failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCsvImporting(false);
    }
  };

  // بيانات رسم المقارنة
  const compareChartData = compareSamples.map((s) => {
    const ind = calcSampleIndicators(s);
    return {
      name: (locale === 'ar' ? s.nameAr : s.nameEn).slice(0, 15),
      icon: s.icon,
      profit: Number((ind.netProfit / 1000000).toFixed(1)),
      investment: Number((ind.investment / 1000000).toFixed(1)),
      revenue: Number((ind.totalRev / 1000000).toFixed(1)),
    };
  });

  // ترتيب حسب الربحية
  const sortedByProfit = [...compareSamples].sort((a, b) => calcSampleIndicators(b).netProfit - calcSampleIndicators(a).netProfit);
  const bestSample = sortedByProfit[0];

  return (
    <div className="space-y-4">
      {/* رأس */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Sparkles className="size-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{locale === 'ar' ? 'المشاريع النموذجية' : 'Sample Projects'}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'ar'
                ? `${SAMPLE_PROJECTS.length} مشروع نموذجي كامل - تحميل وتحرير وتصدير ومقارنة + استيراد CSV`
                : `${SAMPLE_PROJECTS.length} complete samples - load, edit, export, compare + CSV import`}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse"><Sparkles className="size-4 me-1" />{locale === 'ar' ? 'المشاريع' : 'Browse'}</TabsTrigger>
          <TabsTrigger value="compare">
            <GitCompare className="size-4 me-1" />
            {locale === 'ar' ? 'مقارنة' : 'Compare'}
            {compareIds.length > 0 && <Badge variant="secondary" className="ms-1 text-[10px] h-4">{compareIds.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="import"><FileSpreadsheet className="size-4 me-1" />{locale === 'ar' ? 'استيراد CSV' : 'Import CSV'}</TabsTrigger>
        </TabsList>

        {/* تبويب استعراض المشاريع */}
        <TabsContent value="browse" className="space-y-4 mt-3">
          {/* البحث والفلترة */}
          <div className="flex gap-2 flex-wrap">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              className="max-w-xs"
            />
            <div className="flex gap-1">
              {[
                { id: 'all', ar: 'الكل', en: 'All' },
                { id: 'agriculture', ar: 'زراعية', en: 'Agriculture' },
                { id: 'industry', ar: 'صناعية', en: 'Industry' },
                { id: 'service', ar: 'خدمية', en: 'Service' },
              ].map((f) => (
                <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'outline'} onClick={() => setFilter(f.id)}>
                  {locale === 'ar' ? f.ar : f.en}
                </Button>
              ))}
            </div>
          </div>

          {/* شبكة المشاريع */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((sample) => {
              const ind = calcSampleIndicators(sample);
              const inCompare = compareIds.includes(sample.id);
              return (
                <Card key={sample.id} className={cn('p-4 hover:shadow-md transition-shadow flex flex-col relative', inCompare && 'ring-2 ring-emerald-500')}>
                  <button
                    onClick={() => toggleCompare(sample.id)}
                    className={cn(
                      'absolute top-2 end-2 size-5 rounded-full flex items-center justify-center transition-colors z-10',
                      inCompare ? 'bg-emerald-500 text-white' : 'bg-muted hover:bg-emerald-500/30'
                    )}
                    title={locale === 'ar' ? 'أضف للمقارنة' : 'Add to compare'}
                  >
                    {inCompare ? <X className="size-3" /> : <Plus className="size-3" />}
                  </button>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">{sample.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight">{locale === 'ar' ? sample.nameAr : sample.nameEn}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{locale === 'ar' ? sample.descriptionAr : sample.descriptionEn}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px]">
                    <div className="p-1.5 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">{locale === 'ar' ? 'استثمار' : 'Invest'}</div>
                      <div className="font-bold font-mono">{formatCurrency(ind.investment, 'YER', locale)}</div>
                    </div>
                    <div className="p-1.5 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">{locale === 'ar' ? 'مدة' : 'Duration'}</div>
                      <div className="font-bold">{ind.duration} {locale === 'ar' ? 'سنة' : 'yr'}</div>
                    </div>
                    <div className="p-1.5 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">{locale === 'ar' ? 'عمال' : 'Workers'}</div>
                      <div className="font-bold">{ind.workers}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge className={ind.netProfit >= 0 ? 'bg-emerald-500 text-white text-[9px]' : 'bg-red-500 text-white text-[9px]'}>
                      {ind.netProfit >= 0 ? (locale === 'ar' ? '✓ مجدي' : '✓ Viable') : (locale === 'ar' ? '✗ غير مجدي' : '✗ Not viable')}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">ROI {ind.roi.toFixed(0)}%</Badge>
                  </div>
                  <div className="space-y-2 mt-auto">
                    <Button size="sm" className="w-full" onClick={() => handleLoadSample(sample)} disabled={loading === sample.id}>
                      {loading === sample.id ? <Loader2 className="size-4 me-1.5 animate-spin" /> : <FolderOpen className="size-4 me-1.5" />}
                      {locale === 'ar' ? 'تحميل وتحرير' : 'Load & Edit'}
                    </Button>
                    <div className="grid grid-cols-3 gap-1">
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleExportSample(sample, 'json')} disabled={loading === `${sample.id}-export-json`}>JSON</Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleExportSample(sample, 'word')} disabled={loading === `${sample.id}-export-word`}>Word</Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleExportSample(sample, 'html')} disabled={loading === `${sample.id}-export-html`}>HTML</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* تبويب المقارنة */}
        <TabsContent value="compare" className="space-y-3 mt-3">
          {compareSamples.length < 2 ? (
            <div className="text-center py-12">
              <GitCompare className="size-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'اختر 2-6 مشاريع من تبويب "المشاريع" بالضغط على +' : 'Select 2-6 projects from Browse tab by clicking +'}
              </p>
            </div>
          ) : (
            <>
              {/* الأفضل */}
              {bestSample && (
                <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <Trophy className="size-8 text-amber-500" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{locale === 'ar' ? '🏆 الأعلى ربحية' : '🏆 Most Profitable'}</div>
                      <div className="text-lg font-bold">{bestSample.icon} {locale === 'ar' ? bestSample.nameAr : bestSample.nameEn}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'صافي الربح' : 'Net Profit'}</div>
                      <div className="text-lg font-bold text-emerald-600 font-mono">{formatCurrency(calcSampleIndicators(bestSample).netProfit, 'YER', locale)}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* رسم المقارنة */}
              <Card className="p-3">
                <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'مقارنة الربح والاستثمار (مليون)' : 'Profit & Investment (Million)'}</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={compareChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" fontSize={9} angle={-20} textAnchor="end" height={60} />
                    <YAxis fontSize={10} />
                    <Tooltip formatter={(v: number) => `${v}M ﷼`} />
                    <Legend />
                    <Bar dataKey="revenue" name={locale === 'ar' ? 'إيرادات' : 'Revenue'} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="investment" name={locale === 'ar' ? 'استثمار' : 'Investment'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name={locale === 'ar' ? 'ربح' : 'Profit'} fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* جدول المقارنة */}
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary/50 sticky top-0">
                      <tr>
                        <th className="p-2 text-start sticky start-0 bg-secondary/50">{locale === 'ar' ? 'المعيار' : 'Criterion'}</th>
                        {sortedByProfit.map((s) => (
                          <th key={s.id} className="p-2 text-center min-w-28">
                            {s.icon} {locale === 'ar' ? s.nameAr.slice(0, 12) : s.nameEn.slice(0, 12)}
                            {s.id === bestSample?.id && <Trophy className="size-3 text-amber-500 inline ms-1" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: locale === 'ar' ? 'الاستثمار' : 'Investment', key: 'investment', higher: false, fmt: (v: number) => formatCurrency(v, 'YER', locale) },
                        { label: locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue', key: 'totalRev', higher: true, fmt: (v: number) => formatCurrency(v, 'YER', locale) },
                        { label: locale === 'ar' ? 'صافي الربح' : 'Net Profit', key: 'netProfit', higher: true, fmt: (v: number) => formatCurrency(v, 'YER', locale) },
                        { label: 'ROI %', key: 'roi', higher: true, fmt: (v: number) => `${v.toFixed(1)}%` },
                        { label: locale === 'ar' ? 'المدة (سنوات)' : 'Duration', key: 'duration', higher: false, fmt: (v: number) => String(v) },
                        { label: locale === 'ar' ? 'العمال' : 'Workers', key: 'workers', higher: true, fmt: (v: number) => String(v) },
                      ].map((row) => {
                        const values = sortedByProfit.map((s) => ({ id: s.id, value: calcSampleIndicators(s)[row.key as keyof ReturnType<typeof calcSampleIndicators>] as number }));
                        const bestVal = row.higher ? Math.max(...values.map((v) => v.value)) : Math.min(...values.map((v) => v.value));
                        return (
                          <tr key={row.key} className="border-t hover:bg-accent/30">
                            <td className="p-2 font-medium sticky start-0 bg-background">{row.label}</td>
                            {values.map((v) => (
                              <td key={v.id} className={cn('p-2 text-center font-mono', v.value === bestVal && 'bg-emerald-100 dark:bg-emerald-900/30 font-bold text-emerald-700')}>
                                {row.fmt(v.value)}
                                {v.value === bestVal && <Trophy className="size-3 text-amber-500 inline ms-1" />}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Button variant="outline" size="sm" className="w-full" onClick={() => setCompareIds([])}>
                <X className="size-4 me-1" />
                {locale === 'ar' ? 'مسح المقارنة' : 'Clear'}
              </Button>
            </>
          )}
        </TabsContent>

        {/* تبويب استيراد CSV */}
        <TabsContent value="import" className="space-y-3 mt-3">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-12 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="size-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold">{locale === 'ar' ? 'استيراد مشاريع من CSV' : 'Import Projects from CSV'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'ar' ? 'استورد مشاريع متعددة دفعة واحدة من ملف CSV' : 'Import multiple projects from a CSV file'}
                </p>
              </div>
            </div>

            {/* الصيغة المطلوبة */}
            <Card className="p-3 bg-secondary/30 mb-4">
              <div className="text-xs font-medium mb-2">{locale === 'ar' ? '📋 صيغة الملف المطلوبة:' : '📋 Required format:'}</div>
              <div className="text-[11px] font-mono bg-background/70 p-2 rounded overflow-x-auto" dir="ltr">
                name,type,sector,location,duration,initialInvestment,revenues,costs,discountRate,description
              </div>
              <div className="text-[11px] font-mono bg-background/70 p-2 rounded mt-1 overflow-x-auto" dir="ltr">
                مشروع زراعي,زراعي,زراعي,ذمار,5,50000000,30000000,20000000,10,وصف المشروع
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {locale === 'ar' ? 'يدعم أيضاً الأعمدة بالعربية: اسم المشروع، النوع، القطاع، الموقع، المدة، الاستثمار، الإيرادات، التكاليف، معدل الخصم، الوصف' : 'Also supports Arabic column names'}
              </div>
            </Card>

            {/* رفع الملف */}
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg p-6 cursor-pointer hover:bg-accent/30 transition-colors">
                <Upload className="size-8 text-muted-foreground mb-2" />
                <div className="text-sm font-medium">
                  {csvFile ? csvFile.name : (locale === 'ar' ? 'اضغط لاختيار ملف CSV' : 'Click to select CSV file')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">.csv (UTF-8)</div>
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
              </label>

              {/* معاينة */}
              {csvPreview && csvPreview.length > 0 && (
                <Card className="p-3">
                  <div className="text-xs font-medium mb-2">{locale === 'ar' ? `معاينة (${csvPreview.length} صفوف):` : `Preview (${csvPreview.length} rows):`}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead className="bg-secondary/50">
                        <tr>
                          {Object.keys(csvPreview[0]).map((h) => (
                            <th key={h} className="p-1.5 text-start">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i} className="border-t">
                            {Object.values(row).map((v, j) => (
                              <td key={j} className="p-1.5 truncate max-w-32">{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* زر الاستيراد */}
              {csvFile && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setCsvFile(null); setCsvPreview(null); }}>
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button className="flex-1" onClick={handleCsvImport} disabled={csvImporting}>
                    {csvImporting ? <Loader2 className="size-4 me-1.5 animate-spin" /> : <Upload className="size-4 me-1.5" />}
                    {locale === 'ar' ? 'استيراد' : 'Import'}
                  </Button>
                </div>
              )}
            </div>

            {/* تحميل قالب فارغ */}
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  const template = 'name,type,sector,location,duration,initialInvestment,revenues,costs,discountRate,description\nمشروع زراعي,زراعي,زراعي,ذمار,5,50000000,30000000,20000000,10,وصف المشروع\nمشروع صناعي,صناعي,صناعي,صنعاء,7,200000000,150000000,100000000,12,وصف المصنع';
                  const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8' });
                  downloadBlob(blob, 'csv-template.csv');
                  toast({ title: locale === 'ar' ? 'تم تحميل القالب' : 'Template downloaded' });
                }}
              >
                <FileSpreadsheet className="size-4 me-1.5" />
                {locale === 'ar' ? 'تحميل قالب CSV فارغ' : 'Download CSV template'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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

// بناء Word احترافي للمشروع النموذجي
function buildSampleWordHTML(sample: SampleProject, locale: 'ar' | 'en'): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale === 'ar' ? 'ar' : 'en';
  const data = sample.data as any;

  const sections: Array<{ title: string; data: any; icon: string }> = [
    { title: locale === 'ar' ? 'تأسيس المشروع' : 'Establishment', data: data.establishment, icon: '📋' },
    { title: locale === 'ar' ? 'الدراسة الاجتماعية' : 'Social Study', data: data.socialStudy, icon: '👥' },
    { title: locale === 'ar' ? 'الدراسة البيئية' : 'Environmental', data: data.environmentalStudy, icon: '🌱' },
    { title: locale === 'ar' ? 'الدراسة القانونية' : 'Legal', data: data.legalStudy, icon: '⚖️' },
    { title: locale === 'ar' ? 'الدراسة التسويقية' : 'Market', data: data.marketStudy, icon: '🛒' },
    { title: locale === 'ar' ? 'الدراسة الفنية' : 'Technical', data: data.technicalStudy, icon: '⚙️' },
    { title: locale === 'ar' ? 'الدراسة المالية' : 'Financial', data: data.financialStudy, icon: '💰' },
    { title: locale === 'ar' ? 'الدراسة الاقتصادية' : 'Economic', data: data.economicStudy, icon: '📈' },
  ];

  const formatVal = (v: any): string => {
    if (typeof v === 'number') {
      if (v > 1000) return formatCurrency(v, 'YER', locale);
      return String(v);
    }
    if (Array.isArray(v)) return v.join('، ');
    if (typeof v === 'object' && v !== null) return JSON.stringify(v);
    return String(v ?? '');
  };

  const sectionsHTML = sections
    .filter((s) => s.data && typeof s.data === 'object')
    .map((s, i) => {
      const rows = Object.entries(s.data)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `<tr><td style='padding:6pt 10pt;border:1pt solid #0d9488;background:#ccfbf1;width:35%;font-weight:bold;'>${k}</td><td style='padding:6pt 10pt;border:1pt solid #0d9488;'>${formatVal(v)}</td></tr>`)
        .join('');
      return `<div style='page-break-before: always;'></div><h2 style='color:#0d9488;border-bottom:3pt solid #facc15;padding-bottom:6pt;'>${i + 1}. ${s.icon} ${s.title}</h2><table style='border-collapse:collapse;width:100%;'>${rows}</table>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${sample.nameAr}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
@page { size: A4; margin: 2.5cm 2cm; mso-title-page: yes; }
body { font-family: 'Cairo', Arial, sans-serif; font-size: 12pt; line-height: 1.7; }
h2 { page-break-before: always; }
table { page-break-inside: avoid; }
</style>
</head>
<body>
<div style="text-align:center;padding-top:150pt;page-break-after:always;">
  <div style="font-size:60pt;">${sample.icon}</div>
  <h1 style="color:#0d9488;font-size:32pt;margin-bottom:8pt;">${sample.nameAr}</h1>
  <p style="font-size:14pt;color:#555;">${sample.descriptionAr}</p>
  <p style="margin-top:60pt;color:#999;font-size:12pt;">${new Date().toLocaleDateString('ar-YE')}</p>
</div>
${sectionsHTML}
</body>
</html>`;
}

// بناء HTML للمعاينة
function buildSamplePreviewHTML(sample: SampleProject, locale: 'ar' | 'en'): string {
  const data = sample.data as any;
  const fin = data.financialStudy ?? {};
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
  const totalRev = yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0);
  const totalCost = yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0);
  const netProfit = totalRev - totalCost;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale === 'ar' ? 'ar' : 'en';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${sample.nameAr}</title>
<style>
body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: #f9fafb; max-width: 900px; margin: 0 auto; }
.header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; }
.header h1 { margin: 0; font-size: 28px; }
.header p { margin: 10px 0 0; opacity: 0.9; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; }
.stat .label { font-size: 12px; color: #6b7280; }
.stat .value { font-size: 20px; font-weight: bold; color: #0d9488; margin-top: 4px; }
.section { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 16px; }
.section h2 { color: #0d9488; border-bottom: 2px solid #facc15; padding-bottom: 8px; margin-top: 0; }
.section table { width: 100%; border-collapse: collapse; }
.section td { padding: 6px; border: 1px solid #e5e7eb; }
.section td:first-child { background: #f0fdfa; font-weight: bold; width: 35%; }
.viable { background: #16a34a; color: white; padding: 4px 12px; border-radius: 6px; display: inline-block; }
.not-viable { background: #dc2626; color: white; padding: 4px 12px; border-radius: 6px; display: inline-block; }
</style>
</head>
<body>
<div class="header">
  <div style="font-size:50px;">${sample.icon}</div>
  <h1>${sample.nameAr}</h1>
  <p>${sample.descriptionAr}</p>
</div>
<div class="stats">
  <div class="stat"><div class="label">${locale === 'ar' ? 'الاستثمار' : 'Investment'}</div><div class="value">${formatCurrency(Number(fin.initialInvestment) || 0, 'YER', locale)}</div></div>
  <div class="stat"><div class="label">${locale === 'ar' ? 'صافي الربح' : 'Net Profit'}</div><div class="value">${formatCurrency(netProfit, 'YER', locale)}</div></div>
  <div class="stat"><div class="label">${locale === 'ar' ? 'المدة' : 'Duration'}</div><div class="value">${data.establishment?.projectDuration ?? '?'} ${locale === 'ar' ? 'سنة' : 'yr'}</div></div>
  <div class="stat"><div class="label">${locale === 'ar' ? 'الحالة' : 'Status'}</div><div class="value">${netProfit >= 0 ? '<span class="viable">✓ ' + (locale === 'ar' ? 'مجدي' : 'Viable') + '</span>' : '<span class="not-viable">✗ ' + (locale === 'ar' ? 'غير مجدي' : 'Not Viable') + '</span>'}</div></div>
</div>
${['establishment', 'marketStudy', 'technicalStudy', 'financialStudy', 'economicStudy', 'socialStudy', 'environmentalStudy', 'legalStudy'].map((key) => {
    const titles: Record<string, string> = {
      establishment: '📋 ' + (locale === 'ar' ? 'تأسيس المشروع' : 'Establishment'),
      marketStudy: '🛒 ' + (locale === 'ar' ? 'الدراسة التسويقية' : 'Market Study'),
      technicalStudy: '⚙️ ' + (locale === 'ar' ? 'الدراسة الفنية' : 'Technical Study'),
      financialStudy: '💰 ' + (locale === 'ar' ? 'الدراسة المالية' : 'Financial Study'),
      economicStudy: '📈 ' + (locale === 'ar' ? 'الدراسة الاقتصادية' : 'Economic Study'),
      socialStudy: '👥 ' + (locale === 'ar' ? 'الدراسة الاجتماعية' : 'Social Study'),
      environmentalStudy: '🌱 ' + (locale === 'ar' ? 'الدراسة البيئية' : 'Environmental Study'),
      legalStudy: '⚖️ ' + (locale === 'ar' ? 'الدراسة القانونية' : 'Legal Study'),
    };
    const d = data[key];
    if (!d || typeof d !== 'object') return '';
    const rows = Object.entries(d).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => {
      let val = v;
      if (typeof v === 'number' && v > 1000) val = formatCurrency(v, 'YER', locale);
      return `<tr><td>${k}</td><td>${val}</td></tr>`;
    }).join('');
    return `<div class="section"><h2>${titles[key]}</h2><table>${rows}</table></div>`;
  }).join('')}
</body>
</html>`;
}
