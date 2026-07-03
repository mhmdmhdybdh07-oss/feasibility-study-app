'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/hooks/use-projects';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, GitCompare, Trophy, FileText } from 'lucide-react';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';

interface ComparisonResult {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    initialInvestment: number;
    totalRevenues: number;
    totalCosts: number;
    netProfit: number;
    npv: number;
    irr: number | null;
    paybackPeriod: number | null;
    roi: number;
    profitabilityIndex: number;
    isViable: boolean;
    yearsCount: number;
  }>;
  best: Record<string, string | null>;
  currencyInfo: { name: string; symbol: string; rate: number };
}

const COLORS = ['#0d9488', '#facc15', '#f97316', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6'];

export function CompareDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: projects, isLoading } = useProjects();
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, currency: displayCurrency }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setSelected([]);
    setResult(null);
  };

  const formatVal = (yer: number, suffix = '') => {
    if (yer == null) return '—';
    const converted = yer / (result?.currencyInfo.rate ?? 1);
    return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { maximumFractionDigits: 1 }).format(converted) + suffix;
  };

  const chartData = result?.projects.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    npv: Number((p.npv / (result.currencyInfo.rate)).toFixed(2)),
    netProfit: Number((p.netProfit / (result.currencyInfo.rate)).toFixed(2)),
  })) ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) handleReset(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="size-5 text-primary" />
            {t('compareProjects')}
          </DialogTitle>
          <DialogDescription>{t('compareSelectTwo')}</DialogDescription>
        </DialogHeader>

        {/* اختيار المشاريع */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {locale === 'ar' ? `المختار: ${selected.length}/5` : `Selected: ${selected.length}/5`}
            </Label>
            {selected.length > 0 && (
              <Button size="sm" variant="ghost" onClick={handleReset}>
                {locale === 'ar' ? 'مسح الاختيار' : 'Clear'}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : !projects?.length ? (
            <Card className="p-8 text-center text-muted-foreground">{t('noData')}</Card>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto pe-1">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  className={`p-3 cursor-pointer transition-all ${selected.includes(p.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  onClick={() => handleToggle(p.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected.includes(p.id)} readOnly />
                    <FileText className="size-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      {p.description && <div className="text-xs text-muted-foreground truncate">{p.description}</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* زر المقارنة */}
        {selected.length >= 2 && (
          <Button onClick={handleCompare} disabled={comparing} className="w-full">
            {comparing ? <Loader2 className="size-4 me-2 animate-spin" /> : <GitCompare className="size-4 me-2" />}
            {t('compareProjects')} ({selected.length})
          </Button>
        )}

        {/* النتائج */}
        {result && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <h3 className="font-bold">{t('compareResults')}</h3>
              <Badge variant="secondary" className="ms-auto">
                {result.currencyInfo.name} ({result.currencyInfo.symbol})
              </Badge>
            </div>

            {/* جدول المقارنة */}
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-2 text-start sticky start-0 bg-secondary/50">{locale === 'ar' ? 'المؤشر' : 'Indicator'}</th>
                      {result.projects.map((p) => (
                        <th key={p.id} className="p-2 text-center min-w-32">
                          <div className="font-medium">{p.name}</div>
                          <Badge className={`mt-1 text-[10px] ${p.isViable ? 'bg-emerald-500' : 'bg-destructive'} text-white`}>
                            {p.isViable ? (locale === 'ar' ? 'مجدي' : 'Viable') : (locale === 'ar' ? 'غير مجدي' : 'Not Viable')}
                          </Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'initialInvestment', label: t('finInitialInvestment'), fmt: (v: number) => formatVal(v), bestLower: true },
                      { key: 'totalRevenues', label: locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenues', fmt: (v: number) => formatVal(v), bestLower: false },
                      { key: 'totalCosts', label: locale === 'ar' ? 'إجمالي التكاليف' : 'Total Costs', fmt: (v: number) => formatVal(v), bestLower: true },
                      { key: 'netProfit', label: locale === 'ar' ? 'صافي الربح' : 'Net Profit', fmt: (v: number) => formatVal(v), bestLower: false },
                      { key: 'npv', label: t('ecoNPV'), fmt: (v: number) => formatVal(v), bestLower: false },
                      { key: 'irr', label: t('ecoIRR'), fmt: (v: number) => v == null ? '—' : `${v.toFixed(2)}%`, bestLower: false },
                      { key: 'paybackPeriod', label: t('ecoPayback'), fmt: (v: number) => v == null ? '—' : `${v.toFixed(2)}`, bestLower: true },
                      { key: 'roi', label: t('ecoROI'), fmt: (v: number) => `${v.toFixed(2)}%`, bestLower: false },
                      { key: 'profitabilityIndex', label: t('ecoProfitabilityIndex'), fmt: (v: number) => v.toFixed(2), bestLower: false },
                    ].map((row) => (
                      <tr key={row.key} className="border-t hover:bg-accent/30">
                        <td className="p-2 font-medium sticky start-0 bg-background">{row.label}</td>
                        {result.projects.map((p) => {
                          const val = (p as any)[row.key];
                          const isBest = result.best[row.key] === p.id;
                          return (
                            <td key={p.id} className={`p-2 text-center font-mono tabular-nums ${isBest ? 'bg-amber-100 dark:bg-amber-900/30 font-bold' : ''}`}>
                              {row.fmt(val)}
                              {isBest && <Trophy className="size-3 text-amber-500 inline ms-1" />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* رسم بياني للمقارنة */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">{locale === 'ar' ? 'مقارنة NPV وصافي الربح' : 'NPV vs Net Profit'}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
                  <Tooltip formatter={(v: number) => formatVal(v * (result.currencyInfo.rate))} />
                  <Legend />
                  <Bar dataKey="npv" name={t('ecoNPV')} radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                  <Bar dataKey="netProfit" name={locale === 'ar' ? 'صافي الربح' : 'Net Profit'} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* الخلاصة */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                {locale === 'ar' ? 'الخلاصة' : 'Conclusion'}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === 'ar'
                  ? `بناءً على المؤشرات، المشروع الأفضل هو "${result.projects.find(p => p.id === result.best.npv)?.name ?? '—'}" بأعلى NPV.`
                  : `Based on indicators, the best project is "${result.projects.find(p => p.id === result.best.npv)?.name ?? '—'}" with the highest NPV.`}
              </p>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
