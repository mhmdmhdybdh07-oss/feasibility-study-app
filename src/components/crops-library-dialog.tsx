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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { CROPS_LIBRARY, CROP_CATEGORIES, recommendCrops, type CropInfo } from '@/lib/crops-library';
import { formatCurrency, CURRENCIES } from '@/lib/currencies';
import { Search, Sprout, Droplets, Calendar, Mountain, Thermometer, GitCompare, Trophy, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

export function CropsLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const cur = CURRENCIES[displayCurrency];

  const [tab, setTab] = useState<'library' | 'compare'>('library');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // معايير التوصية
  const [altitude, setAltitude] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(25);
  const [rainfall, setRainfall] = useState<number>(400);

  const filtered = useMemo(() => {
    return CROPS_LIBRARY.filter((c) => {
      const matchesSearch = !search ||
        c.nameAr.includes(search) ||
        c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        c.scientificName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const recommended = useMemo(() => {
    if (altitude === 0 && temperature === 25 && rainfall === 400) return [];
    return recommendCrops({ altitude, temperature, rainfall });
  }, [altitude, temperature, rainfall]);

  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const compareCrops = CROPS_LIBRARY.filter((c) => compareIds.includes(c.id));
  // ترتيب حسب الربحية تنازلياً
  const sortedByProfit = [...compareCrops].sort((a, b) => b.profitPerHa - a.profitPerHa);
  const bestCrop = sortedByProfit[0];

  // بيانات الرسم البياني للمقارنة
  const compareChartData = sortedByProfit.map((c) => ({
    name: locale === 'ar' ? c.nameAr : c.nameEn,
    icon: c.icon,
    profit: Number((c.profitPerHa / cur.rateToYER).toFixed(0)),
    revenue: Number((c.revenuePerHa / cur.rateToYER).toFixed(0)),
    cost: Number((c.totalCostPerHa / cur.rateToYER).toFixed(0)),
    water: c.waterNeedMm,
    yield: c.yieldPerHectare,
  }));

  // بيانات الرادار (مقاييس نسبية 0-100)
  const radarData = sortedByProfit.map((c) => {
    const maxProfit = Math.max(...compareCrops.map((x) => x.profitPerHa), 1);
    const maxYield = Math.max(...compareCrops.map((x) => x.yieldPerHectare), 1);
    const minWater = Math.min(...compareCrops.map((x) => x.waterNeedMm), 1);
    return {
      crop: locale === 'ar' ? c.nameAr : c.nameEn,
      ربحية: (c.profitPerHa / maxProfit) * 100,
      إنتاجية: (c.yieldPerHectare / maxYield) * 100,
      'كفاءة مائية': (minWater / c.waterNeedMm) * 100,
      'سرعة عائد': (100 / (c.maturityDays / 60)) * 30,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="size-5 text-primary" />
            {locale === 'ar' ? 'مكتبة المحاصيل اليمنية' : 'Yemeni Crops Library'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? `${CROPS_LIBRARY.length} محصول يمني ببيانات علمية كاملة + مقارنة بين المحاصيل`
              : `${CROPS_LIBRARY.length} Yemeni crops + comparison tool`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <Sprout className="size-4 me-1.5" />
              {locale === 'ar' ? 'المكتبة' : 'Library'}
            </TabsTrigger>
            <TabsTrigger value="compare">
              <GitCompare className="size-4 me-1.5" />
              {locale === 'ar' ? 'مقارنة المحاصيل' : 'Compare Crops'}
              {compareIds.length > 0 && (
                <Badge variant="secondary" className="ms-1 text-[10px] h-4">{compareIds.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* تبويب المكتبة */}
          <TabsContent value="library" className="space-y-3 mt-3">
            {/* البحث والفلترة */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={locale === 'ar' ? 'بحث...' : 'Search...'} className="ps-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  {Object.entries(CROP_CATEGORIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{locale === 'ar' ? v.ar : v.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* التوصية حسب الموقع */}
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="text-xs font-medium mb-2">{locale === 'ar' ? '🎯 توصية محاصيل حسب موقعك:' : '🎯 Recommend crops by your location:'}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] flex items-center gap-1"><Mountain className="size-3" />{locale === 'ar' ? 'الارتفاع (م)' : 'Altitude (m)'}</Label>
                  <Input type="number" value={altitude} onChange={(e) => setAltitude(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] flex items-center gap-1"><Thermometer className="size-3" />{locale === 'ar' ? 'الحرارة (°C)' : 'Temp (°C)'}</Label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] flex items-center gap-1"><Droplets className="size-3" />{locale === 'ar' ? 'الأمطار (مم)' : 'Rain (mm)'}</Label>
                  <Input type="number" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>
              {recommended.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'محاصيل موصى بها:' : 'Recommended:'}</span>
                  {recommended.slice(0, 6).map((c) => (
                    <Badge key={c.id} className="text-[10px] bg-emerald-500/20 text-emerald-700">{c.icon} {locale === 'ar' ? c.nameAr : c.nameEn}</Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* شبكة المحاصيل */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto pe-1 max-h-72">
              {filtered.map((crop) => {
                const isSelected = selectedCrop?.id === crop.id;
                const inCompare = compareIds.includes(crop.id);
                return (
                  <Card
                    key={crop.id}
                    className={cn(
                      'p-3 cursor-pointer transition-all relative',
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50',
                      inCompare && 'ring-2 ring-emerald-500'
                    )}
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="text-3xl">{crop.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{locale === 'ar' ? crop.nameAr : crop.nameEn}</div>
                        <div className="text-[10px] text-muted-foreground italic">{crop.scientificName}</div>
                      </div>
                      <Badge className={cn('text-[9px] h-5', CROP_CATEGORIES[crop.category].color)}>
                        {locale === 'ar' ? CROP_CATEGORIES[crop.category].ar : CROP_CATEGORIES[crop.category].en}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="flex items-center gap-1"><Sprout className="size-3" />{crop.yieldPerHectare} {locale === 'ar' ? 'طن/هكتار' : 't/ha'}</div>
                      <div className="flex items-center gap-1"><Droplets className="size-3" />{crop.waterNeedMm} {locale === 'ar' ? 'مم' : 'mm'}</div>
                      <div className="flex items-center gap-1"><Calendar className="size-3" />{crop.maturityDays} {locale === 'ar' ? 'يوم' : 'd'}</div>
                      <div className="flex items-center gap-1"><Mountain className="size-3" />{crop.altitudeMin}-{crop.altitudeMax}م</div>
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'ربح/هكتار' : 'Profit/ha'}</span>
                      <span className="font-mono font-bold text-emerald-600">{fmt(crop.profitPerHa)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCompare(crop.id); }}
                      className={cn(
                        'absolute top-2 end-2 size-5 rounded-full flex items-center justify-center transition-colors',
                        inCompare ? 'bg-emerald-500 text-white' : 'bg-muted hover:bg-emerald-500/30'
                      )}
                      title={locale === 'ar' ? 'أضف للمقارنة' : 'Add to compare'}
                    >
                      {inCompare ? <X className="size-3" /> : <Plus className="size-3" />}
                    </button>
                  </Card>
                );
              })}
            </div>

            {/* تفاصيل المحصول المختار */}
            {selectedCrop && (
              <Card className="p-3 bg-secondary/30 max-h-44 overflow-y-auto">
                <div className="flex items-start gap-2 mb-2">
                  <div className="text-4xl">{selectedCrop.icon}</div>
                  <div>
                    <h3 className="font-bold">{locale === 'ar' ? selectedCrop.nameAr : selectedCrop.nameEn}</h3>
                    <p className="text-[10px] italic">{selectedCrop.scientificName}</p>
                  </div>
                </div>
                <p className="text-xs mb-2 leading-relaxed">{selectedCrop.notes}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                  <InfoBox label={locale === 'ar' ? 'الموسم' : 'Season'} value={selectedCrop.plantingSeason} />
                  <InfoBox label={locale === 'ar' ? 'التربة' : 'Soil'} value={selectedCrop.soilType} />
                  <InfoBox label={locale === 'ar' ? 'الـ PH' : 'PH'} value={selectedCrop.soilPH} />
                  <InfoBox label={locale === 'ar' ? 'نوع الري' : 'Irrigation'} value={selectedCrop.irrigationType} />
                  <InfoBox label={locale === 'ar' ? 'تكلفة/هكتار' : 'Cost/ha'} value={fmt(selectedCrop.totalCostPerHa)} />
                  <InfoBox label={locale === 'ar' ? 'إيراد/هكتار' : 'Revenue/ha'} value={fmt(selectedCrop.revenuePerHa)} />
                  <InfoBox label={locale === 'ar' ? 'سعر/طن' : 'Price/t'} value={fmt(selectedCrop.pricePerTon)} />
                  <InfoBox label={locale === 'ar' ? 'مناطق مناسبة' : 'Regions'} value={selectedCrop.suitableRegions.slice(0, 3).join('، ')} />
                </div>
              </Card>
            )}
          </TabsContent>

          {/* تبويب المقارنة */}
          <TabsContent value="compare" className="space-y-3 mt-3 overflow-y-auto max-h-[60vh] pe-1">
            {compareCrops.length === 0 ? (
              <div className="text-center py-12">
                <GitCompare className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'اختر 2-5 محاصيل من تبويب "المكتبة" بالضغط على +' : 'Select 2-5 crops from Library tab by clicking +'}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setTab('library')}>
                  {locale === 'ar' ? 'الذهاب للمكتبة' : 'Go to Library'}
                </Button>
              </div>
            ) : (
              <>
                {/* الأفضل */}
                {bestCrop && (
                  <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <Trophy className="size-8 text-amber-500" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">{locale === 'ar' ? '🏆 الأفضل ربحية' : '🏆 Most Profitable'}</div>
                        <div className="text-lg font-bold">
                          {bestCrop.icon} {locale === 'ar' ? bestCrop.nameAr : bestCrop.nameEn}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'ربح/هكتار' : 'Profit/ha'}</div>
                        <div className="text-lg font-bold text-emerald-600 font-mono">{fmt(bestCrop.profitPerHa)}</div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* رسم المقارنة */}
                <Card className="p-3">
                  <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'مقارنة الربح والتكلفة والإيراد' : 'Profit/Cost/Revenue Comparison'}</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={compareChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={50} />
                      <YAxis fontSize={10} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
                      <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
                      <Legend />
                      <Bar dataKey="revenue" name={locale === 'ar' ? 'إيراد' : 'Revenue'} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cost" name={locale === 'ar' ? 'تكلفة' : 'Cost'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name={locale === 'ar' ? 'ربح' : 'Profit'} fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* رسم رادار */}
                <Card className="p-3">
                  <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'تحليل متعدد المعايير' : 'Multi-criteria Analysis'}</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="crop" fontSize={10} />
                      <PolarRadiusAxis domain={[0, 100]} fontSize={9} />
                      {sortedByProfit.map((c, i) => (
                        <Radar
                          key={c.id}
                          name={locale === 'ar' ? c.nameAr : c.nameEn}
                          dataKey={locale === 'ar' ? 'ربحية' : 'ربحية'}
                          stroke={`hsl(${i * 60}, 70%, 50%)`}
                          fill={`hsl(${i * 60}, 70%, 50%)`}
                          fillOpacity={0.15}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {locale === 'ar' ? '💡 الرسام يعرض نسبة كل محصول مقابل الأفضل في كل معيار' : '💡 Shows each crop relative to the best in each criterion'}
                  </p>
                </Card>

                {/* جدول المقارنة الشامل */}
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/50 sticky top-0">
                        <tr>
                          <th className="p-2 text-start sticky start-0 bg-secondary/50">{locale === 'ar' ? 'المعيار' : 'Criterion'}</th>
                          {sortedByProfit.map((c) => (
                            <th key={c.id} className="p-2 text-center min-w-32">
                              <div>{c.icon} {locale === 'ar' ? c.nameAr : c.nameEn}</div>
                              {c.id === bestCrop?.id && <Trophy className="size-3 text-amber-500 inline" />}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <CompareRow label={locale === 'ar' ? 'الربح/هكتار' : 'Profit/ha'} best={bestCrop?.profitPerHa ?? 0} values={sortedByProfit.map((c) => ({ id: c.id, value: c.profitPerHa, display: fmt(c.profitPerHa) }))} fmt={fmt} higherBetter />
                        <CompareRow label={locale === 'ar' ? 'الإيراد/هكتار' : 'Revenue/ha'} best={bestCrop?.revenuePerHa ?? 0} values={sortedByProfit.map((c) => ({ id: c.id, value: c.revenuePerHa, display: fmt(c.revenuePerHa) }))} fmt={fmt} higherBetter />
                        <CompareRow label={locale === 'ar' ? 'التكلفة/هكتار' : 'Cost/ha'} best={Math.min(...sortedByProfit.map(c => c.totalCostPerHa))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.totalCostPerHa, display: fmt(c.totalCostPerHa) }))} fmt={fmt} higherBetter={false} />
                        <CompareRow label={locale === 'ar' ? 'الإنتاجية (طن/هكتار)' : 'Yield (t/ha)'} best={Math.max(...sortedByProfit.map(c => c.yieldPerHectare))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.yieldPerHectare, display: String(c.yieldPerHectare) }))} fmt={fmt} higherBetter />
                        <CompareRow label={locale === 'ar' ? 'سعر/طن' : 'Price/t'} best={Math.max(...sortedByProfit.map(c => c.pricePerTon))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.pricePerTon, display: fmt(c.pricePerTon) }))} fmt={fmt} higherBetter />
                        <CompareRow label={locale === 'ar' ? 'المياه (مم)' : 'Water (mm)'} best={Math.min(...sortedByProfit.map(c => c.waterNeedMm))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.waterNeedMm, display: String(c.waterNeedMm) }))} fmt={fmt} higherBetter={false} />
                        <CompareRow label={locale === 'ar' ? 'أيام النضج' : 'Maturity (days)'} best={Math.min(...sortedByProfit.map(c => c.maturityDays))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.maturityDays, display: String(c.maturityDays) }))} fmt={fmt} higherBetter={false} />
                        <CompareRow label={locale === 'ar' ? 'هامش الربح %' : 'Profit margin %'} best={Math.max(...sortedByProfit.map(c => (c.profitPerHa / c.revenuePerHa) * 100))} values={sortedByProfit.map((c) => ({ id: c.id, value: (c.profitPerHa / c.revenuePerHa) * 100, display: `${((c.profitPerHa / c.revenuePerHa) * 100).toFixed(1)}%` }))} fmt={fmt} higherBetter />
                        <CompareRow label={locale === 'ar' ? 'كفاءة المياه (ربح/م³)' : 'Water efficiency'} best={Math.max(...sortedByProfit.map(c => c.profitPerHa / c.waterNeedMm))} values={sortedByProfit.map((c) => ({ id: c.id, value: c.profitPerHa / c.waterNeedMm, display: (c.profitPerHa / c.waterNeedMm / 1000).toFixed(1) + 'K' }))} fmt={fmt} higherBetter />
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* التوصية */}
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="text-xs font-medium mb-1 flex items-center gap-1.5">
                    <Trophy className="size-4 text-amber-500" />
                    {locale === 'ar' ? 'الخلاصة' : 'Conclusion'}
                  </div>
                  <p className="text-xs leading-relaxed">
                    {locale === 'ar'
                      ? `بناءً على المقارنة، "${bestCrop ? (locale === 'ar' ? bestCrop.nameAr : bestCrop.nameEn) : ''}" هو الأعلى ربحية بـ ${bestCrop ? fmt(bestCrop.profitPerHa) : ''}/هكتار.`
                      : `Based on comparison, "${bestCrop ? (locale === 'ar' ? bestCrop.nameAr : bestCrop.nameEn) : ''}" has the highest profitability at ${bestCrop ? fmt(bestCrop.profitPerHa) : ''}/ha.`}
                  </p>
                </Card>

                <Button variant="outline" size="sm" className="w-full" onClick={() => setCompareIds([])}>
                  <X className="size-4 me-1" />
                  {locale === 'ar' ? 'مسح المقارنة' : 'Clear Comparison'}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function CompareRow({ label, values, higherBetter, best }: {
  label: string;
  values: Array<{ id: string; value: number; display: string }>;
  higherBetter: boolean;
  best: number;
  fmt?: (yer: number) => string;
}) {
  const bestId = higherBetter
    ? values.reduce((max, v) => v.value > max.value ? v : max, values[0]).id
    : values.reduce((min, v) => v.value < min.value ? v : min, values[0]).id;

  return (
    <tr className="border-t hover:bg-accent/30">
      <td className="p-2 font-medium sticky start-0 bg-background">{label}</td>
      {values.map((v) => (
        <td key={v.id} className={`p-2 text-center font-mono tabular-nums ${v.id === bestId ? 'bg-emerald-100 dark:bg-emerald-900/30 font-bold text-emerald-700' : ''}`}>
          {v.display}
          {v.id === bestId && <Trophy className="size-3 text-amber-500 inline ms-1" />}
        </td>
      ))}
    </tr>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-1.5 rounded bg-background/70">
      <div className="text-muted-foreground text-[9px]">{label}</div>
      <div className="font-medium text-[10px]">{value}</div>
    </div>
  );
}
