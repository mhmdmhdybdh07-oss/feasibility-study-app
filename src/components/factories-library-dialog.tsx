'use client';

import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { FACTORIES_LIBRARY, FACTORY_CATEGORIES, type FactoryInfo } from '@/lib/factories-library';
import { formatCurrency, CURRENCIES } from '@/lib/currencies';
import { Search, Factory, Users, Zap, TrendingUp, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';

export function FactoriesLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const cur = CURRENCIES[displayCurrency];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedFactory, setSelectedFactory] = useState<FactoryInfo | null>(null);
  const [sortCriteria, setSortCriteria] = useState<'profit' | 'roi' | 'payback' | 'investment'>('profit');

  const filtered = useMemo(() => {
    const result = FACTORIES_LIBRARY.filter((f) => {
      const matchesSearch = !search ||
        f.nameAr.includes(search) ||
        f.nameEn.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    // ترتيب
    return result.sort((a, b) => {
      if (sortCriteria === 'profit') return b.annualProfit - a.annualProfit;
      if (sortCriteria === 'roi') return (b.annualProfit / b.initialInvestment) - (a.annualProfit / a.initialInvestment);
      if (sortCriteria === 'payback') return a.paybackPeriod - b.paybackPeriod;
      return a.initialInvestment - b.initialInvestment;
    });
  }, [search, categoryFilter, sortCriteria]);

  // أعلى 5 مصانع ربحية
  const topFactories = useMemo(() => {
    return [...FACTORIES_LIBRARY].sort((a, b) => b.annualProfit - a.annualProfit).slice(0, 5);
  }, []);

  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  const topChartData = topFactories.map((f) => ({
    name: locale === 'ar' ? f.nameAr.length > 12 ? f.nameAr.slice(0, 12) + '…' : f.nameAr : f.nameEn,
    icon: f.icon,
    profit: Number((f.annualProfit / cur.rateToYER / 1000000).toFixed(1)),
    investment: Number((f.initialInvestment / cur.rateToYER / 1000000).toFixed(1)),
  }));

  const riskColors = {
    low: 'bg-emerald-500/20 text-emerald-700',
    medium: 'bg-amber-500/20 text-amber-700',
    high: 'bg-red-500/20 text-red-700',
  };
  const riskAr = { low: 'منخفض', medium: 'متوسط', high: 'عالٍ' };

  const exportColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-500/20 text-blue-700',
    high: 'bg-emerald-500/20 text-emerald-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="size-5 text-primary" />
            {locale === 'ar' ? 'مكتبة مصانع الصناعات التحويلية' : 'Manufacturing Factories Library'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? `${FACTORIES_LIBRARY.length} مصنع ببيانات الاستثمار والإنتاج والربحية + توصية الأفضل`
              : `${FACTORIES_LIBRARY.length} factories with investment, production & profitability data`}
          </DialogDescription>
        </DialogHeader>

        {/* ترتيب أعلى المصانع ربحية */}
        <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Trophy className="size-4 text-amber-500" />
            {locale === 'ar' ? '🏆 أعلى 5 مصانع ربحية (مليون/سنة)' : '🏆 Top 5 Most Profitable Factories'}
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={topChartData} layout="vertical" margin={{ left: 80, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={10} width={80} />
              <Tooltip formatter={(v: number) => `${v}M ${cur.symbol}`} />
              <Legend />
              <Bar dataKey="profit" name={locale === 'ar' ? 'ربح سنوي' : 'Annual Profit'} radius={[0, 4, 4, 0]}>
                {topChartData.map((_, i) => (
                  <Cell key={i} fill={['#facc15', '#c0c0c0', '#cd7f32', '#94a3b8', '#94a3b8'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* البحث والفلترة */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={locale === 'ar' ? 'بحث...' : 'Search...'} className="ps-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === 'ar' ? 'كل الفئات' : 'All'}</SelectItem>
              {Object.entries(FACTORY_CATEGORIES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{locale === 'ar' ? v.ar : v.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortCriteria} onValueChange={(v) => setSortCriteria(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="profit">{locale === 'ar' ? 'الأعلى ربحاً' : 'Most Profit'}</SelectItem>
              <SelectItem value="roi">{locale === 'ar' ? 'الأعلى عائداً' : 'Best ROI'}</SelectItem>
              <SelectItem value="payback">{locale === 'ar' ? 'الأسرع استرداداً' : 'Fastest Payback'}</SelectItem>
              <SelectItem value="investment">{locale === 'ar' ? 'الأقل استثماراً' : 'Lowest Investment'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* شبكة المصانع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto pe-1 max-h-72">
          {filtered.map((factory) => (
            <Card
              key={factory.id}
              className={cn(
                'p-3 cursor-pointer transition-all',
                selectedFactory?.id === factory.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
              )}
              onClick={() => setSelectedFactory(factory)}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="text-3xl">{factory.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{locale === 'ar' ? factory.nameAr : factory.nameEn}</div>
                  <div className="text-[10px] text-muted-foreground">{factory.productionCapacity}</div>
                </div>
                <Badge className={cn('text-[9px] h-5', FACTORY_CATEGORIES[factory.category].color)}>
                  {locale === 'ar' ? FACTORY_CATEGORIES[factory.category].ar : FACTORY_CATEGORIES[factory.category].en}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center gap-1"><Users className="size-3" />{factory.workers} {locale === 'ar' ? 'عامل' : 'workers'}</div>
                <div className="flex items-center gap-1"><TrendingUp className="size-3" />{factory.profitMargin}%</div>
                <div className="flex items-center gap-1"><Target className="size-3" />{factory.paybackPeriod} {locale === 'ar' ? 'سنة' : 'yr'}</div>
                <div className="flex items-center gap-1"><Zap className="size-3" />{riskAr[factory.riskLevel]}</div>
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{locale === 'ar' ? 'ربح سنوي' : 'Annual Profit'}</span>
                <span className="font-mono font-bold text-emerald-600">{fmt(factory.annualProfit)}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* تفاصيل المصنع المختار */}
        {selectedFactory && (
          <Card className="p-3 bg-secondary/30 max-h-56 overflow-y-auto">
            <div className="flex items-start gap-2 mb-2">
              <div className="text-4xl">{selectedFactory.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold">{locale === 'ar' ? selectedFactory.nameAr : selectedFactory.nameEn}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge className={cn('text-[9px]', FACTORY_CATEGORIES[selectedFactory.category].color)}>
                    {locale === 'ar' ? FACTORY_CATEGORIES[selectedFactory.category].ar : FACTORY_CATEGORIES[selectedFactory.category].en}
                  </Badge>
                  <Badge className={cn('text-[9px]', riskColors[selectedFactory.riskLevel])}>
                    {locale === 'ar' ? `مخاطر: ${riskAr[selectedFactory.riskLevel]}` : `${selectedFactory.riskLevel} risk`}
                  </Badge>
                  <Badge className={cn('text-[9px]', exportColors[selectedFactory.exportPotential])}>
                    {locale === 'ar' ? `تصدير: ${selectedFactory.exportPotential === 'high' ? 'عالٍ' : selectedFactory.exportPotential === 'medium' ? 'متوسط' : 'منخفض'}` : `Export: ${selectedFactory.exportPotential}`}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-xs mb-2 leading-relaxed">{selectedFactory.notes}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-2">
              <InfoBox label={locale === 'ar' ? 'الاستثمار' : 'Investment'} value={fmt(selectedFactory.initialInvestment)} highlight />
              <InfoBox label={locale === 'ar' ? 'ربح سنوي' : 'Annual Profit'} value={fmt(selectedFactory.annualProfit)} highlight />
              <InfoBox label={locale === 'ar' ? 'هامش الربح' : 'Profit Margin'} value={`${selectedFactory.profitMargin}%`} />
              <InfoBox label={locale === 'ar' ? 'استرداد' : 'Payback'} value={`${selectedFactory.paybackPeriod} ${locale === 'ar' ? 'سنة' : 'yr'}`} />
              <InfoBox label={locale === 'ar' ? 'الطاقة' : 'Capacity'} value={selectedFactory.productionCapacity} />
              <InfoBox label={locale === 'ar' ? 'العمال' : 'Workers'} value={`${selectedFactory.workers}`} />
              <InfoBox label={locale === 'ar' ? 'المساحة' : 'Land'} value={`${selectedFactory.landArea} م²`} />
              <InfoBox label={locale === 'ar' ? 'طاقة كهربائية' : 'Energy'} value={`${(selectedFactory.energyNeed / 1000).toFixed(0)}K kWh/yr`} />
            </div>

            {/* العملية والمعدات */}
            <div className="text-[11px] mb-1">
              <b>{locale === 'ar' ? '🔬 العملية:' : '🔬 Process:'}</b> {selectedFactory.productionProcess}
            </div>
            <div className="text-[11px] mb-1">
              <b>{locale === 'ar' ? '📦 المواد الخام:' : '📦 Raw materials:'}</b> {selectedFactory.rawMaterials}
            </div>
            <div className="text-[11px] mb-1">
              <b>{locale === 'ar' ? '⚙️ المعدات:' : '⚙️ Equipment:'}</b> {selectedFactory.equipment.join('، ')}
            </div>
            <div className="text-[11px] mb-1">
              <b>{locale === 'ar' ? '✅ معايير الجودة:' : '✅ Standards:'}</b> {selectedFactory.qualityStandards.join('، ')}
            </div>
            <div className="text-[11px] mb-1">
              <b>{locale === 'ar' ? '🎯 الأسواق:' : '🎯 Markets:'}</b> {selectedFactory.targetMarkets.join('، ')}
            </div>

            {/* المميزات والتحديات */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
              <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-900/20">
                <b className="text-emerald-700">✓ {locale === 'ar' ? 'مميزات:' : 'Advantages:'}</b>
                <ul className="mt-0.5 space-y-0.5">
                  {selectedFactory.advantages.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
              <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-900/20">
                <b className="text-amber-700">⚠ {locale === 'ar' ? 'تحديات:' : 'Challenges:'}</b>
                <ul className="mt-0.5 space-y-0.5">
                  {selectedFactory.challenges.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-1.5 rounded ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-background/70'}`}>
      <div className="text-muted-foreground text-[9px]">{label}</div>
      <div className={`font-medium text-[10px] ${highlight ? 'text-primary font-bold' : ''}`}>{value}</div>
    </div>
  );
}
