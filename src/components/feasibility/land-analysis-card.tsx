'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, CURRENCIES } from '@/lib/currencies';
import { analyzeSoil, calculateReclamation, calculateWaterNeed, type SoilAnalysis, type LandReclamationInputs } from '@/lib/land-analysis';
import { CROPS_LIBRARY } from '@/lib/crops-library';
import { Microscope, Calculator, Droplets, Mountain, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#0d9488', '#facc15', '#f97316', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6'];

export function LandAnalysisCard() {
  const { locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const cur = CURRENCIES[displayCurrency];

  const [tab, setTab] = useState<'soil' | 'reclamation' | 'water'>('soil');

  // === محلل التربة ===
  const [soil, setSoil] = useState<SoilAnalysis>({
    ph: 7.2, ec: 2.5, organicMatter: 1.5, clayContent: 30, sandContent: 40, siltContent: 30,
    nitrogen: 25, phosphorus: 15, potassium: 200, depth: 60, slope: 3,
  });

  const soilResult = useMemo(() => analyzeSoil(soil), [soil]);

  // === الاستصلاح ===
  const [reclam, setReclam] = useState<LandReclamationInputs>({
    area: 50, slope: 3, vegetation: 'light', rockType: 'medium', waterSource: 'well',
    distanceToWater: 500, soilDepth: 60, needsLeveling: true, needsDrainage: true,
    needsFencing: true, needsRoadAccess: true,
  });

  const reclamResult = useMemo(() => calculateReclamation(reclam), [reclam]);

  // === المياه ===
  const [cropId, setCropId] = useState('wheat');
  const [area, setArea] = useState(50);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(40);
  const [windSpeed, setWindSpeed] = useState(2);
  const [rainfall, setRainfall] = useState(250);
  const [efficiency, setEfficiency] = useState(0.9);

  const selectedCrop = CROPS_LIBRARY.find((c) => c.id === cropId);
  const waterResult = useMemo(() => selectedCrop ? calculateWaterNeed(selectedCrop, {
    cropId, area, region: '', temperature, humidity, windSpeed, rainfallEffective: rainfall, irrigationEfficiency: efficiency,
  }) : null, [selectedCrop, cropId, area, temperature, humidity, windSpeed, rainfall, efficiency]);

  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  // بيانات رسوم الاستصلاح
  const reclamChartData = reclamResult.items.map((item) => ({
    name: item.categoryAr.length > 10 ? item.categoryAr.slice(0, 10) + '…' : item.categoryAr,
    cost: Number((item.totalCost / cur.rateToYER).toFixed(0)),
  }));

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
          <Mountain className="size-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold">{locale === 'ar' ? 'محلل التربة والاستصلاح' : 'Soil & Reclamation Analyzer'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar' ? 'تحليل التربة + حساب تكاليف الاستصلاح + الاحتياجات المائية' : 'Soil analysis + reclamation costs + water needs'}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="soil"><Microscope className="size-4 me-1" />{locale === 'ar' ? 'التربة' : 'Soil'}</TabsTrigger>
          <TabsTrigger value="reclamation"><Calculator className="size-4 me-1" />{locale === 'ar' ? 'استصلاح' : 'Reclamation'}</TabsTrigger>
          <TabsTrigger value="water"><Droplets className="size-4 me-1" />{locale === 'ar' ? 'مياه' : 'Water'}</TabsTrigger>
        </TabsList>

        {/* تبويب التربة */}
        <TabsContent value="soil" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Field label={locale === 'ar' ? 'PH' : 'PH'} value={soil.ph} onChange={(v) => setSoil((p) => ({ ...p, ph: v }))} step="0.1" />
            <Field label={locale === 'ar' ? 'الملوحة EC (dS/m)' : 'EC (dS/m)'} value={soil.ec} onChange={(v) => setSoil((p) => ({ ...p, ec: v }))} step="0.1" />
            <Field label={locale === 'ar' ? 'مادة عضوية %' : 'Organic %'} value={soil.organicMatter} onChange={(v) => setSoil((p) => ({ ...p, organicMatter: v }))} step="0.1" />
            <Field label={locale === 'ar' ? 'عمق التربة (سم)' : 'Depth (cm)'} value={soil.depth} onChange={(v) => setSoil((p) => ({ ...p, depth: v }))} />
            <Field label={locale === 'ar' ? 'طين %' : 'Clay %'} value={soil.clayContent} onChange={(v) => setSoil((p) => ({ ...p, clayContent: v }))} />
            <Field label={locale === 'ar' ? 'رمل %' : 'Sand %'} value={soil.sandContent} onChange={(v) => setSoil((p) => ({ ...p, sandContent: v }))} />
            <Field label={locale === 'ar' ? 'غرين %' : 'Silt %'} value={soil.siltContent} onChange={(v) => setSoil((p) => ({ ...p, siltContent: v }))} />
            <Field label={locale === 'ar' ? 'انحدار %' : 'Slope %'} value={soil.slope} onChange={(v) => setSoil((p) => ({ ...p, slope: v }))} />
          </div>

          {/* النتائج */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <ResultBox label={locale === 'ar' ? 'القوام' : 'Texture'} value={soilResult.textureAr} color="bg-blue-500/10 text-blue-700" />
            <ResultBox label={locale === 'ar' ? 'الخصوبة' : 'Fertility'} value={soilResult.fertilityAr} color="bg-emerald-500/10 text-emerald-700" />
            <ResultBox label={locale === 'ar' ? 'الصرف' : 'Drainage'} value={soilResult.drainageAr} color="bg-cyan-500/10 text-cyan-700" />
            <ResultBox label={locale === 'ar' ? 'الملوحة' : 'Salinity'} value={soilResult.salinityAr} color="bg-amber-500/10 text-amber-700" />
            <ResultBox label={locale === 'ar' ? 'الحموضة' : 'PH Level'} value={soilResult.phAr} color="bg-purple-500/10 text-purple-700" />
          </div>

          {/* التوصيات */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-amber-500" />
              {locale === 'ar' ? 'التوصيات:' : 'Recommendations:'}
            </h4>
            <div className="space-y-1">
              {soilResult.recommendations.map((rec, i) => (
                <div key={i} className="text-xs p-2 rounded-md bg-secondary/30 flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* المحاصيل المناسبة */}
          {soilResult.suitableCrops.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {locale === 'ar' ? 'محاصيل مناسبة:' : 'Suitable crops:'}
              </h4>
              <div className="flex flex-wrap gap-1">
                {soilResult.suitableCrops.map((c, i) => (
                  <Badge key={i} className="bg-emerald-500/20 text-emerald-700 text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* تبويب الاستصلاح */}
        <TabsContent value="reclamation" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Field label={locale === 'ar' ? 'المساحة (هكتار)' : 'Area (ha)'} value={reclam.area} onChange={(v) => setReclam((p) => ({ ...p, area: v }))} />
            <Field label={locale === 'ar' ? 'الانحدار %' : 'Slope %'} value={reclam.slope} onChange={(v) => setReclam((p) => ({ ...p, slope: v }))} />
            <Field label={locale === 'ar' ? 'عمق التربة (سم)' : 'Soil depth'} value={reclam.soilDepth} onChange={(v) => setReclam((p) => ({ ...p, soilDepth: v }))} />
            <Field label={locale === 'ar' ? 'مسافة المياه (م)' : 'Water distance'} value={reclam.distanceToWater} onChange={(v) => setReclam((p) => ({ ...p, distanceToWater: v }))} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <Label className="text-[10px]">{locale === 'ar' ? 'النباتات' : 'Vegetation'}</Label>
              <select value={reclam.vegetation} onChange={(e) => setReclam((p) => ({ ...p, vegetation: e.target.value as any }))} className="w-full p-1.5 rounded border text-sm">
                <option value="none">{locale === 'ar' ? 'لا يوجد' : 'None'}</option>
                <option value="light">{locale === 'ar' ? 'خفيف' : 'Light'}</option>
                <option value="medium">{locale === 'ar' ? 'متوسط' : 'Medium'}</option>
                <option value="dense">{locale === 'ar' ? 'كثيف' : 'Dense'}</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px]">{locale === 'ar' ? 'نوع الصخور' : 'Rock type'}</Label>
              <select value={reclam.rockType} onChange={(e) => setReclam((p) => ({ ...p, rockType: e.target.value as any }))} className="w-full p-1.5 rounded border text-sm">
                <option value="soft">{locale === 'ar' ? 'لينة' : 'Soft'}</option>
                <option value="medium">{locale === 'ar' ? 'متوسطة' : 'Medium'}</option>
                <option value="hard">{locale === 'ar' ? 'صلبة' : 'Hard'}</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px]">{locale === 'ar' ? 'مصدر المياه' : 'Water source'}</Label>
              <select value={reclam.waterSource} onChange={(e) => setReclam((p) => ({ ...p, waterSource: e.target.value as any }))} className="w-full p-1.5 rounded border text-sm">
                <option value="well">{locale === 'ar' ? 'بئر' : 'Well'}</option>
                <option value="canal">{locale === 'ar' ? 'قناة' : 'Canal'}</option>
                <option value="rain">{locale === 'ar' ? 'مطر' : 'Rain'}</option>
                <option value="none">{locale === 'ar' ? 'لا يوجد' : 'None'}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 text-[10px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={reclam.needsLeveling} onChange={(e) => setReclam((p) => ({ ...p, needsLeveling: e.target.checked }))} />
                {locale === 'ar' ? 'تسوية' : 'Leveling'}
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={reclam.needsDrainage} onChange={(e) => setReclam((p) => ({ ...p, needsDrainage: e.target.checked }))} />
                {locale === 'ar' ? 'صرف' : 'Drainage'}
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={reclam.needsFencing} onChange={(e) => setReclam((p) => ({ ...p, needsFencing: e.target.checked }))} />
                {locale === 'ar' ? 'سور' : 'Fencing'}
              </label>
            </div>
          </div>

          {/* النتائج */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <BigStat label={locale === 'ar' ? 'التكلفة الإجمالية' : 'Total Cost'} value={fmt(reclamResult.totalCost)} color="text-primary" />
            <BigStat label={locale === 'ar' ? 'للهكتار' : 'Per Hectare'} value={fmt(reclamResult.costPerHectare)} color="text-amber-600" />
            <BigStat label={locale === 'ar' ? 'المدة (شهور)' : 'Duration'} value={`${reclamResult.durationMonths}`} color="text-blue-600" />
            <BigStat label={locale === 'ar' ? 'عدد البنود' : 'Items'} value={`${reclamResult.items.length}`} color="text-emerald-600" />
          </div>

          {/* رسم بياني */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reclamChartData} layout="vertical" margin={{ left: 60, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={10} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
              <YAxis type="category" dataKey="name" fontSize={10} width={60} />
              <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
              <Bar dataKey="cost" name={locale === 'ar' ? 'التكلفة' : 'Cost'} radius={[0, 4, 4, 0]}>
                {reclamChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* المراحل */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="size-4 text-blue-600" />
              {locale === 'ar' ? 'مراحل الاستصلاح' : 'Reclamation Phases'}
            </h4>
            <div className="space-y-1">
              {reclamResult.phases.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-secondary/30 text-xs">
                  <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{p.phase}</div>
                    <div className="text-[10px] text-muted-foreground">{p.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{p.durationMonths} {locale === 'ar' ? 'شهر' : 'mo'}</Badge>
                  <span className="font-mono text-[10px]">{fmt(p.cost)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* التوصيات */}
          <div className="space-y-1">
            {reclamResult.recommendations.map((rec, i) => (
              <div key={i} className="text-xs p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                {rec}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* تبويب المياه */}
        <TabsContent value="water" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="md:col-span-1">
              <Label className="text-xs">{locale === 'ar' ? 'المحصول' : 'Crop'}</Label>
              <select value={cropId} onChange={(e) => setCropId(e.target.value)} className="w-full p-1.5 rounded border text-sm">
                {CROPS_LIBRARY.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {locale === 'ar' ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <Field label={locale === 'ar' ? 'المساحة (هكتار)' : 'Area (ha)'} value={area} onChange={setArea} />
            <Field label={locale === 'ar' ? 'الحرارة (°C)' : 'Temp'} value={temperature} onChange={setTemperature} />
            <Field label={locale === 'ar' ? 'الرطوبة %' : 'Humidity %'} value={humidity} onChange={setHumidity} />
            <Field label={locale === 'ar' ? 'الرياح (m/s)' : 'Wind'} value={windSpeed} onChange={setWindSpeed} />
            <Field label={locale === 'ar' ? 'الأمطار (مم)' : 'Rain (mm)'} value={rainfall} onChange={setRainfall} />
            <div>
              <Label className="text-xs">{locale === 'ar' ? 'كفاءة الري' : 'Irrigation eff.'}</Label>
              <select value={efficiency} onChange={(e) => setEfficiency(Number(e.target.value))} className="w-full p-1.5 rounded border text-sm">
                <option value={0.9}>{locale === 'ar' ? 'تنقيط (90%)' : 'Drip (90%)'}</option>
                <option value={0.75}>{locale === 'ar' ? 'رش (75%)' : 'Sprinkler (75%)'}</option>
                <option value={0.6}>{locale === 'ar' ? 'غمر (60%)' : 'Flood (60%)'}</option>
              </select>
            </div>
          </div>

          {waterResult && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <BigStat label={locale === 'ar' ? 'ET للمحصول (مم)' : 'ETc (mm)'} value={waterResult.etc.toFixed(0)} color="text-cyan-600" />
                <BigStat label={locale === 'ar' ? 'صافي الري (مم)' : 'Net Irrigation'} value={waterResult.netIrrigation.toFixed(0)} color="text-blue-600" />
                <BigStat label={locale === 'ar' ? 'إجمالي (م³)' : 'Total (m³)'} value={waterResult.totalWater.toLocaleString()} color="text-primary" />
                <BigStat label={locale === 'ar' ? 'مضخة (لتر/ث)' : 'Pump (L/s)'} value={waterResult.pumpCapacity.toFixed(1)} color="text-amber-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-3 bg-secondary/30">
                  <div className="text-xs font-medium mb-2">{locale === 'ar' ? 'توزيع الاحتياج المائي' : 'Water Need Distribution'}</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: locale === 'ar' ? 'صافي' : 'Net', value: waterResult.netVolume },
                          { name: locale === 'ar' ? 'فاقد' : 'Loss', value: waterResult.grossVolume - waterResult.netVolume },
                        ]}
                        dataKey="value" cx="50%" cy="50%" outerRadius={50}
                        label={(e: any) => `${e.name}: ${e.value}م³`}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-3 bg-secondary/30">
                  <div className="text-xs font-medium mb-2">{locale === 'ar' ? 'التوصيات' : 'Recommendations'}</div>
                  <div className="space-y-1">
                    {waterResult.recommendations.map((rec, i) => (
                      <div key={i} className="text-[10px] p-1.5 rounded bg-background/70">{rec}</div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px]">{label}</Label>
      <Input
        type="number" value={value} step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-8 text-sm"
      />
    </div>
  );
}

function ResultBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`p-2 rounded-md ${color} text-center`}>
      <div className="text-[9px] opacity-80">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}

function BigStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2 rounded-md bg-secondary/30">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`font-mono font-bold text-sm ${color}`}>{value}</div>
    </div>
  );
}
