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
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency } from '@/lib/currencies';
import {
  ENERGY_PROJECTS, ENERGY_TYPES,
  YEMEN_SOLAR_IRRADIANCE, YEMEN_WIND_SPEED,
  calculateSolarProduction, calculateWindProduction, calculateTariff,
} from '@/lib/energy-library';
import {
  TURBINE_TYPES, YEMEN_HYDRO_SITES, SITE_TYPES,
  calculateHydroPower, calculateHydroCosts,
} from '@/lib/hydro-library';
import { Search, Sun, Wind, Droplet, Flame, Zap, Trophy, Calculator, Leaf, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#facc15', '#3b82f6', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'];

export function EnergyLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const [tab, setTab] = useState<'library' | 'solar' | 'wind' | 'tariff' | 'hydro'>('library');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // === حاسبة شمسية ===
  const [solarCapacity, setSolarCapacity] = useState(10);
  const [solarRegion, setSolarRegion] = useState('حضرموت');
  const [solarLosses, setSolarLosses] = useState(14);

  const solarIrradiance = YEMEN_SOLAR_IRRADIANCE.find((r) => r.region === solarRegion)?.irradiance ?? 5.8;
  const solarResult = useMemo(() => calculateSolarProduction({
    panelCapacity: solarCapacity, irradiance: solarIrradiance, systemLosses: solarLosses, panelTilt: 15, panelOrientation: 0, daysPerYear: 365,
  }), [solarCapacity, solarIrradiance, solarLosses]);

  // === حاسبة رياح ===
  const [windCapacity, setWindCapacity] = useState(10);
  const [windRegion, setWindRegion] = useState('شبوة');
  const [windHeight, setWindHeight] = useState(30);
  const [windRotor, setWindRotor] = useState(8);

  const windSpeed = YEMEN_WIND_SPEED.find((r) => r.region === windRegion)?.windSpeed ?? 5.0;
  const windResult = useMemo(() => calculateWindProduction({
    turbineCapacity: windCapacity, windSpeed, turbineHeight: windHeight, airDensity: 1.225, rotorDiameter: windRotor, capacityFactor: 30,
  }), [windCapacity, windSpeed, windHeight, windRotor]);

  // === حاسبة تعرفة ===
  const [tariffProduction, setTariffProduction] = useState(solarResult.annualProduction);
  const [selfConsumption, setSelfConsumption] = useState(60);
  const [tariff, setTariff] = useState(150);
  const [feedInTariff, setFeedInTariff] = useState(100);
  const [capex, setCapex] = useState(12000000 * solarCapacity);
  const [opex, setOpex] = useState(240000 * solarCapacity);
  const [lifetime, setLifetime] = useState(25);

  const tariffResult = useMemo(() => calculateTariff({
    annualProduction: tariffProduction, selfConsumption, tariff, feedInTariff, capex, opexAnnual: opex, lifetime,
  }), [tariffProduction, selfConsumption, tariff, feedInTariff, capex, opex, lifetime]);

  // === حاسبة كهرومائية ===
  const [hydroHead, setHydroHead] = useState(50);
  const [hydroFlow, setHydroFlow] = useState(5);
  const [hydroTurbineType, setHydroTurbineType] = useState('francis');
  const [hydroTurbineEff, setHydroTurbineEff] = useState(88);
  const [hydroGeneratorEff, setHydroGeneratorEff] = useState(95);
  const [hydroCapacityFactor, setHydroCapacityFactor] = useState(50);
  const [hydroIncludeDam, setHydroIncludeDam] = useState(false);
  const [hydroTransmission, setHydroTransmission] = useState(0);
  const [hydroAccess, setHydroAccess] = useState(0);

  const hydroResult = useMemo(() => calculateHydroPower({
    head: hydroHead, flow: hydroFlow, turbineEfficiency: hydroTurbineEff,
    generatorEfficiency: hydroGeneratorEff, systemLosses: 5, capacityFactor: hydroCapacityFactor,
    turbineType: hydroTurbineType,
  }), [hydroHead, hydroFlow, hydroTurbineEff, hydroGeneratorEff, hydroCapacityFactor, hydroTurbineType]);

  const hydroCostResult = useMemo(() => calculateHydroCosts({
    power: Math.max(1, hydroResult.netPower), turbineType: hydroTurbineType,
    includeDam: hydroIncludeDam, includeTransmission: hydroTransmission > 0,
    transmissionDistance: hydroTransmission, includeAccess: hydroAccess > 0,
    accessDistance: hydroAccess,
  }), [hydroResult.netPower, hydroTurbineType, hydroIncludeDam, hydroTransmission, hydroAccess]);

  const filtered = ENERGY_PROJECTS.filter((p) => {
    const matchesSearch = !search || p.nameAr.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const fmt = (n: number) => formatCurrency(n, displayCurrency, locale);

  // بيانات الإنتاج الشهري
  const monthlyData = solarResult.monthlyProduction.map((v, i) => ({
    month: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'][i],
    production: v,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-5 text-amber-500" />
            {locale === 'ar' ? 'مكتبة مشاريع الطاقة المتجددة' : 'Renewable Energy Projects'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? `${ENERGY_PROJECTS.length} مشروع طاقة + حاسبات شمسية ورياح وتعرفة`
              : `${ENERGY_PROJECTS.length} energy projects + solar/wind/tariff calculators`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="library"><Zap className="size-4 me-1" />{locale === 'ar' ? 'المشاريع' : 'Projects'}</TabsTrigger>
            <TabsTrigger value="solar"><Sun className="size-4 me-1" />{locale === 'ar' ? 'شمسية' : 'Solar'}</TabsTrigger>
            <TabsTrigger value="wind"><Wind className="size-4 me-1" />{locale === 'ar' ? 'رياح' : 'Wind'}</TabsTrigger>
            <TabsTrigger value="hydro"><Waves className="size-4 me-1" />{locale === 'ar' ? 'كهروماء' : 'Hydro'}</TabsTrigger>
            <TabsTrigger value="tariff"><Calculator className="size-4 me-1" />{locale === 'ar' ? 'تعرفة' : 'Tariff'}</TabsTrigger>
          </TabsList>

          {/* تبويب المشاريع */}
          <TabsContent value="library" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={locale === 'ar' ? 'بحث...' : 'Search...'} className="ps-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  {Object.entries(ENERGY_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{locale === 'ar' ? v.ar : v.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pe-1">
              {filtered.map((p) => (
                <Card key={p.id} className="p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="text-3xl">{p.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{locale === 'ar' ? p.nameAr : p.nameEn}</div>
                      <div className="text-[10px] text-muted-foreground">{p.capacity} {p.capacityUnit}</div>
                    </div>
                    <Badge className={cn('text-[9px] h-5', ENERGY_TYPES[p.type].color)}>
                      {locale === 'ar' ? ENERGY_TYPES[p.type].ar : ENERGY_TYPES[p.type].en}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
                    <div className="p-1 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">{locale === 'ar' ? 'استثمار' : 'CAPEX'}</div>
                      <div className="font-bold">{fmt(p.capex)}</div>
                    </div>
                    <div className="p-1 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">{locale === 'ar' ? 'استرداد' : 'Payback'}</div>
                      <div className="font-bold">{p.paybackYears} {locale === 'ar' ? 'سنة' : 'yr'}</div>
                    </div>
                    <div className="p-1 rounded bg-secondary/40 text-center">
                      <div className="text-muted-foreground">ROI</div>
                      <div className="font-bold text-emerald-600">{p.roi}%</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[9px]">{p.annualProduction.toLocaleString()} kWh/{locale === 'ar' ? 'سنة' : 'yr'}</Badge>
                    <Badge variant="outline" className="text-[9px]">CO₂↓ {p.co2Saved} {locale === 'ar' ? 'طن' : 't'}</Badge>
                    <Badge variant="outline" className="text-[9px]">{p.areaRequired} م²</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{p.notes}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب الطاقة الشمسية */}
          <TabsContent value="solar" className="space-y-3 mt-3">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Sun className="size-4 text-amber-500" />{locale === 'ar' ? 'حاسبة الإنتاج الشمسي' : 'Solar Production Calculator'}</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'السعة (kW)' : 'Capacity (kW)'}</Label>
                  <Input type="number" value={solarCapacity} onChange={(e) => setSolarCapacity(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'المنطقة' : 'Region'}</Label>
                  <Select value={solarRegion} onValueChange={setSolarRegion}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEMEN_SOLAR_IRRADIANCE.map((r) => (
                        <SelectItem key={r.region} value={r.region}>{r.region} ({r.irradiance} kWh/m²)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'خسائر النظام %' : 'System Losses %'}</Label>
                  <Input type="number" value={solarLosses} onChange={(e) => setSolarLosses(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <Stat label={locale === 'ar' ? 'إنتاج يومي' : 'Daily'} value={`${solarResult.dailyProduction} kWh`} color="text-amber-600" />
                <Stat label={locale === 'ar' ? 'إنتاج سنوي' : 'Annual'} value={`${solarResult.annualProduction.toLocaleString()} kWh`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'معامل السعة' : 'Capacity Factor'} value={`${solarResult.capacityFactor}%`} color="text-blue-600" />
                <Stat label={locale === 'ar' ? 'CO₂ محفوظ' : 'CO₂ Saved'} value={`${solarResult.co2Saved} ${locale === 'ar' ? 'طن' : 't'}`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'مساحة مطلوبة' : 'Area'} value={`${solarResult.areaRequired} م²`} />
                <Stat label={locale === 'ar' ? 'أشجار مكافئة' : 'Trees Equiv.'} value={`${solarResult.treesEquivalent} 🌳`} />
                <Stat label={locale === 'ar' ? 'نسبة الأداء' : 'Perf. Ratio'} value={`${(solarResult.performanceRatio * 100).toFixed(0)}%`} />
                <Stat label={locale === 'ar' ? 'الإشعاع' : 'Irradiance'} value={`${solarIrradiance} kWh/m²/يوم`} />
              </div>

              <div>
                <div className="text-xs font-medium mb-1">{locale === 'ar' ? 'الإنتاج الشهري (kWh)' : 'Monthly Production (kWh)'}</div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" fontSize={9} />
                    <YAxis fontSize={9} />
                    <Tooltip />
                    <Area dataKey="production" stroke="#facc15" fill="#facc1533" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* تبويب الرياح */}
          <TabsContent value="wind" className="space-y-3 mt-3">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Wind className="size-4 text-blue-500" />{locale === 'ar' ? 'حاسبة طاقة الرياح' : 'Wind Energy Calculator'}</h4>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'السعة (kW)' : 'Capacity'}</Label>
                  <Input type="number" value={windCapacity} onChange={(e) => setWindCapacity(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'المنطقة' : 'Region'}</Label>
                  <Select value={windRegion} onValueChange={setWindRegion}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEMEN_WIND_SPEED.map((r) => (
                        <SelectItem key={r.region} value={r.region}>{r.region} ({r.windSpeed} m/s)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'الارتفاع (م)' : 'Height'}</Label>
                  <Input type="number" value={windHeight} onChange={(e) => setWindHeight(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'قطر الدوار (م)' : 'Rotor Ø'}</Label>
                  <Input type="number" value={windRotor} onChange={(e) => setWindRotor(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <Stat label={locale === 'ar' ? 'إنتاج سنوي' : 'Annual'} value={`${windResult.annualProduction.toLocaleString()} kWh`} color="text-blue-600" />
                <Stat label={locale === 'ar' ? 'معامل السعة' : 'Capacity Factor'} value={`${windResult.actualCapacityFactor}%`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'CO₂ محفوظ' : 'CO₂ Saved'} value={`${windResult.co2Saved} ${locale === 'ar' ? 'طن' : 't'}`} />
                <Stat label={locale === 'ar' ? 'مساحة' : 'Area'} value={`${windResult.areaRequired} م²`} />
              </div>

              {windResult.tips.length > 0 && (
                <div className="space-y-1">
                  {windResult.tips.map((tip, i) => (
                    <div key={i} className="text-[11px] p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">{tip}</div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* تبويب الكهروماء */}
          <TabsContent value="hydro" className="space-y-3 mt-3 max-h-[65vh] overflow-y-auto pe-1">
            {/* المواقع المائية اليمنية */}
            <Card className="p-3 bg-cyan-500/5 border-cyan-500/20">
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Waves className="size-4 text-cyan-600" />{locale === 'ar' ? 'المواقع المائية المحتملة في اليمن' : 'Potential Hydro Sites in Yemen'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {YEMEN_HYDRO_SITES.map((site) => {
                  const turbine = TURBINE_TYPES.find(t => t.id === site.recommendedTurbine);
                  return (
                    <div key={site.id} className="p-2 rounded bg-background/70 text-[10px] cursor-pointer hover:bg-accent/30" onClick={() => { setHydroHead(site.estimatedHead); setHydroFlow(site.estimatedFlow); }}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{site.nameAr}</span>
                        <Badge className={cn('text-[9px] h-4', SITE_TYPES[site.siteType].color)}>{SITE_TYPES[site.siteType].ar}</Badge>
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        رأس: {site.estimatedHead}م | تدفق: {site.estimatedFlow}م³/ث | قدرة: ~{site.estimatedPower}kW
                      </div>
                      <div className="text-cyan-600 mt-0.5">{turbine?.icon} {turbine?.nameAr}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* حاسبة القدرة */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Waves className="size-4 text-cyan-600" />{locale === 'ar' ? 'حاسبة القدرة الكهرومائية' : 'Hydro Power Calculator'}</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'صافي الرأس (م)' : 'Net Head (m)'}</Label>
                  <Input type="number" value={hydroHead} onChange={(e) => setHydroHead(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'التدفق (م³/ث)' : 'Flow (m³/s)'}</Label>
                  <Input type="number" value={hydroFlow} onChange={(e) => setHydroFlow(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'نوع التوربين' : 'Turbine Type'}</Label>
                  <Select value={hydroTurbineType} onValueChange={setHydroTurbineType}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TURBINE_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.icon} {t.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'كفاءة التوربين %' : 'Turbine Eff. %'}</Label>
                  <Input type="number" value={hydroTurbineEff} onChange={(e) => setHydroTurbineEff(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'كفاءة المولد %' : 'Generator Eff. %'}</Label>
                  <Input type="number" value={hydroGeneratorEff} onChange={(e) => setHydroGeneratorEff(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'معامل السعة %' : 'Capacity Factor %'}</Label>
                  <Input type="number" value={hydroCapacityFactor} onChange={(e) => setHydroCapacityFactor(Number(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>

              {/* النتائج */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <Stat label={locale === 'ar' ? 'القدرة النظرية' : 'Gross Power'} value={`${hydroResult.grossPower} kW`} color="text-blue-600" />
                <Stat label={locale === 'ar' ? 'القدرة الفعلية' : 'Net Power'} value={`${hydroResult.netPower} kW`} color="text-cyan-600" highlight />
                <Stat label={locale === 'ar' ? 'الكفاءة الكلية' : 'Overall Eff.'} value={`${hydroResult.overallEfficiency}%`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'إنتاج سنوي' : 'Annual'} value={`${hydroResult.annualProduction.toLocaleString()} kWh`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'إنتاج يومي' : 'Daily'} value={`${hydroResult.dailyProduction} kWh`} />
                <Stat label={locale === 'ar' ? 'CO₂ محفوظ' : 'CO₂ Saved'} value={`${hydroResult.co2Saved} ${locale === 'ar' ? 'طن' : 't'}`} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'منازل مغذاة' : 'Homes'} value={`${hydroResult.homesPowered} 🏠`} />
                <Stat label={locale === 'ar' ? 'قطر الأنبوب' : 'Pipe Ø'} value={`${hydroResult.pipeDiameter} ${locale === 'ar' ? 'مم' : 'mm'}`} />
              </div>

              {/* التوربينات المناسبة */}
              {hydroResult.recommendedTurbines.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-medium mb-1">{locale === 'ar' ? '✅ توربينات مناسبة:' : '✅ Suitable turbines:'}</div>
                  <div className="flex flex-wrap gap-1">
                    {hydroResult.recommendedTurbines.map((t) => (
                      <Badge key={t.id} className="text-[9px] bg-cyan-500/20 text-cyan-700">{t.icon} {t.nameAr} ({t.efficiency}%)</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* النصائح */}
              {hydroResult.tips.length > 0 && (
                <div className="space-y-1 mb-3">
                  {hydroResult.tips.map((tip, i) => (
                    <div key={i} className="text-[11px] p-1.5 rounded bg-cyan-50 dark:bg-cyan-900/20">{tip}</div>
                  ))}
                </div>
              )}

              {/* أنواع التوربينات */}
              <div className="border-t pt-2">
                <div className="text-[10px] font-medium mb-1">{locale === 'ar' ? '📋 دليل أنواع التوربينات:' : '📋 Turbine Types Guide:'}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {TURBINE_TYPES.map((t) => (
                    <div key={t.id} className={cn('p-1.5 rounded text-[9px] cursor-pointer', hydroTurbineType === t.id ? 'bg-cyan-500/20 ring-1 ring-cyan-500' : 'bg-secondary/30')} onClick={() => setHydroTurbineType(t.id)}>
                      <div className="font-medium">{t.icon} {t.nameAr}</div>
                      <div className="text-muted-foreground">رأس: {t.minHead}-{t.maxHead}م | تدفق: {t.minFlow}-{t.maxFlow}م³/ث</div>
                      <div className="text-cyan-600">كفاءة: {t.efficiency}% | تكلفة: {t.costPerKW.toLocaleString()} ر/kW</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* تحليل التكاليف */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Calculator className="size-4 text-primary" />{locale === 'ar' ? 'تحليل تكاليف محددة' : 'Detailed Cost Analysis'}</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-[10px]">
                  <input type="checkbox" checked={hydroIncludeDam} onChange={(e) => setHydroIncludeDam(e.target.checked)} />
                  {locale === 'ar' ? 'بناء سد' : 'Build Dam'}
                </label>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'خط نقل (كم)' : 'Transmission (km)'}</Label>
                  <Input type="number" value={hydroTransmission} onChange={(e) => setHydroTransmission(Number(e.target.value) || 0)} className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{locale === 'ar' ? 'طريق وصول (كم)' : 'Access Road (km)'}</Label>
                  <Input type="number" value={hydroAccess} onChange={(e) => setHydroAccess(Number(e.target.value) || 0)} className="h-7 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <Stat label={locale === 'ar' ? 'إجمالي الاستثمار' : 'Total CAPEX'} value={fmt(hydroCostResult.totalCapex)} color="text-primary" highlight />
                <Stat label={locale === 'ar' ? 'تكلفة/kW' : 'Cost/kW'} value={fmt(hydroCostResult.costPerKW)} color="text-amber-600" />
                <Stat label={locale === 'ar' ? 'تشغيل سنوي' : 'Annual OPEX'} value={fmt(hydroCostResult.annualOpex)} />
                <Stat label={locale === 'ar' ? 'استرداد' : 'Payback'} value={`${hydroCostResult.paybackYears} ${locale === 'ar' ? 'سنة' : 'yr'}`} color="text-emerald-600" />
                <Stat label="LCOE" value={`${hydroCostResult.lcoe} ر/kWh`} />
                <Stat label={locale === 'ar' ? 'إنتاج سنوي' : 'Annual'} value={`${hydroCostResult.annualProduction.toLocaleString()} kWh`} />
                <Stat label={locale === 'ar' ? 'العمر' : 'Lifetime'} value={`${hydroCostResult.lifetime} ${locale === 'ar' ? 'سنة' : 'yr'}`} />
              </div>

              {/* تفصيل البنود */}
              <div className="space-y-1 mb-2">
                {hydroCostResult.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-secondary/30">
                    <span className="font-medium">{item.categoryAr}: <span className="text-muted-foreground">{item.description}</span></span>
                    <span className="font-mono">{fmt(item.cost)} <Badge variant="outline" className="text-[8px] h-3.5">{item.percentage}%</Badge></span>
                  </div>
                ))}
              </div>

              {/* التوصيات */}
              {hydroCostResult.recommendations.length > 0 && (
                <div className="space-y-1">
                  {hydroCostResult.recommendations.map((rec, i) => (
                    <div key={i} className="text-[10px] p-1.5 rounded bg-primary/5">{rec}</div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* تبويب التعرفة */}
          <TabsContent value="tariff" className="space-y-3 mt-3">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Calculator className="size-4 text-primary" />{locale === 'ar' ? 'حاسبة التعرفة وعائد التغذية' : 'Tariff & Feed-in Calculator'}</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Field label={locale === 'ar' ? 'إنتاج سنوي (kWh)' : 'Annual Production'} value={tariffProduction} onChange={setTariffProduction} />
                <Field label={locale === 'ar' ? 'استهلاك ذاتي %' : 'Self-Consumption %'} value={selfConsumption} onChange={setSelfConsumption} />
                <Field label={locale === 'ar' ? 'تعرفة شراء (ر/kWh)' : 'Tariff (R/kWh)'} value={tariff} onChange={setTariff} />
                <Field label={locale === 'ar' ? 'تعرفة بيع (ر/kWh)' : 'Feed-in (R/kWh)'} value={feedInTariff} onChange={setFeedInTariff} />
                <Field label={locale === 'ar' ? 'استثمار (ر)' : 'CAPEX'} value={capex} onChange={setCapex} />
                <Field label={locale === 'ar' ? 'تشغيل سنوي (ر)' : 'OPEX'} value={opex} onChange={setOpex} />
                <Field label={locale === 'ar' ? 'العمر (سنة)' : 'Lifetime'} value={lifetime} onChange={setLifetime} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <Stat label={locale === 'ar' ? 'توفير سنوي' : 'Annual Savings'} value={fmt(tariffResult.annualSavings)} color="text-emerald-600" />
                <Stat label={locale === 'ar' ? 'إيراد بيع' : 'Export Revenue'} value={fmt(tariffResult.annualRevenue)} color="text-blue-600" />
                <Stat label={locale === 'ar' ? 'منفعة كلية' : 'Total Benefit'} value={fmt(tariffResult.totalAnnualBenefit)} color="text-primary" highlight />
                <Stat label={locale === 'ar' ? 'استرداد' : 'Payback'} value={`${tariffResult.paybackYears} ${locale === 'ar' ? 'سنة' : 'yr'}`} color="text-amber-600" />
                <Stat label={locale === 'ar' ? 'ربح العمر' : 'Lifetime Profit'} value={fmt(tariffResult.lifetimeProfit)} color="text-emerald-600" />
                <Stat label="ROI" value={`${tariffResult.roi}%`} color="text-emerald-600" />
                <Stat label="LCOE" value={`${tariffResult.lcoe} ر/kWh`} />
                <Stat label={locale === 'ar' ? 'كهرباء مباعة' : 'Exported'} value={`${tariffResult.exported.toLocaleString()} kWh`} />
              </div>

              <Card className="p-2 bg-primary/5 border-primary/20 text-xs">
                <b>💡 LCOE</b> ({locale === 'ar' ? 'تكلفة الكهرباء المعادلة' : 'Levelized Cost of Energy'}): {tariffResult.lcoe} {locale === 'ar' ? 'ر/kWh' : 'R/kWh'}
                {tariffResult.lcoe < tariff ? ` ✅ أقل من تعرفة الشراء (${tariff} ر) = ` : ` ❌ أعلى من تعرفة الشراء = `}
                {tariffResult.lcoe < tariff ? (locale === 'ar' ? 'مجدي!' : 'Viable!') : (locale === 'ar' ? 'يحتاج مراجعة' : 'Needs review')}
              </Card>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px]">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="h-8 text-sm" />
    </div>
  );
}

function Stat({ label, value, color = '', highlight = false }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className={cn('p-2 rounded-md', highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30')}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-bold text-sm', color || (highlight ? 'text-primary' : ''))}>{value}</div>
    </div>
  );
}
