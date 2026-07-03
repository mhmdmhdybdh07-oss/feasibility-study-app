'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { Leaf, TreePine, Droplets, Sun, Recycle, Award, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

export function SustainabilityCard() {
  const { locale } = useTranslation();
  const [energyUse, setEnergyUse] = useState(100000); // kWh/سنة
  const [waterUse, setWaterUse] = useState(10000); // م³/سنة
  const [wasteGenerated, setWasteGenerated] = useState(50); // طن/سنة
  const [recycledWaste, setRecycledWaste] = useState(30); // طن/سنة
  const [treesPlanted, setTreesPlanted] = useState(100);
  const [renewableEnergy, setRenewableEnergy] = useState(20); // %
  const [organicMaterials, setOrganicMaterials] = useState(40); // %
  const [localSourcing, setLocalSourcing] = useState(60); // %

  const result = useMemo(() => {
    // البصمة الكربونية (تقديرية)
    const carbonFromEnergy = energyUse * 0.5 * (1 - renewableEnergy / 100); // kg CO2
    const carbonAbsorbed = treesPlanted * 22; // kg CO2/شجرة/سنة
    const netCarbon = carbonFromEnergy - carbonAbsorbed;

    // نقاط الاستدامة (0-100)
    const energyScore = Math.max(0, 100 - (energyUse / 10000) * (1 - renewableEnergy / 100));
    const waterScore = Math.max(0, 100 - (waterUse / 1000));
    const wasteScore = (recycledWaste / Math.max(wasteGenerated, 1)) * 100;
    const carbonScore = netCarbon <= 0 ? 100 : Math.max(0, 100 - (netCarbon / 1000) * 10);
    const materialsScore = organicMaterials;
    const sourcingScore = localSourcing;

    const overallScore = Math.round((energyScore + waterScore + wasteScore + carbonScore + materialsScore + sourcingScore) / 6);

    // تصنيف
    let grade = 'F';
    let gradeAr = 'ضعيف';
    let gradeColor = 'bg-red-500';
    if (overallScore >= 80) { grade = 'A'; gradeAr = 'ممتاز'; gradeColor = 'bg-emerald-500'; }
    else if (overallScore >= 65) { grade = 'B'; gradeAr = 'جيد جداً'; gradeColor = 'bg-blue-500'; }
    else if (overallScore >= 50) { grade = 'C'; gradeAr = 'جيد'; gradeColor = 'bg-amber-500'; }
    else if (overallScore >= 35) { grade = 'D'; gradeAr = 'مقبول'; gradeColor = 'bg-orange-500'; }

    return {
      carbonFromEnergy: Math.round(carbonFromEnergy),
      carbonAbsorbed: Math.round(carbonAbsorbed),
      netCarbon: Math.round(netCarbon),
      energyScore: Math.round(energyScore),
      waterScore: Math.round(waterScore),
      wasteScore: Math.round(wasteScore),
      carbonScore: Math.round(carbonScore),
      materialsScore: Math.round(materialsScore),
      sourcingScore: Math.round(sourcingScore),
      overallScore,
      grade,
      gradeAr,
      gradeColor,
    };
  }, [energyUse, waterUse, wasteGenerated, recycledWaste, treesPlanted, renewableEnergy, organicMaterials, localSourcing]);

  const radarData = [
    { metric: locale === 'ar' ? 'طاقة' : 'Energy', value: result.energyScore },
    { metric: locale === 'ar' ? 'مياه' : 'Water', value: result.waterScore },
    { metric: locale === 'ar' ? 'نفايات' : 'Waste', value: result.wasteScore },
    { metric: locale === 'ar' ? 'كربون' : 'Carbon', value: result.carbonScore },
    { metric: locale === 'ar' ? 'مواد' : 'Materials', value: result.materialsScore },
    { metric: locale === 'ar' ? 'توريد' : 'Sourcing', value: result.sourcingScore },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Leaf className="size-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold">{locale === 'ar' ? 'حاسبة الاستدامة البيئية' : 'Sustainability Calculator'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar' ? 'تقييم الأثر البيئي + بصمة الكربون + درجة استدامة' : 'Environmental impact + carbon footprint + sustainability score'}
          </p>
        </div>
      </div>

      {/* الدرجة الكلية */}
      <Card className={cn('p-4 mb-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30')}>
        <div className="flex items-center gap-4">
          <div className={cn('size-20 rounded-full flex items-center justify-center text-white font-bold text-3xl', result.gradeColor)}>
            {result.grade}
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'درجة الاستدامة' : 'Sustainability Score'}</div>
            <div className="text-3xl font-bold text-emerald-600">{result.overallScore}<span className="text-lg text-muted-foreground">/100</span></div>
            <div className="text-sm font-medium">{result.gradeAr}</div>
          </div>
          <div className="text-end">
            <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'صافي الكربون' : 'Net Carbon'}</div>
            <div className={cn('text-lg font-bold', result.netCarbon <= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {result.netCarbon <= 0 ? '🌱' : '🏭'} {Math.abs(result.netCarbon).toLocaleString()} kg CO₂
            </div>
            {result.netCarbon <= 0 && <Badge className="bg-emerald-500 text-white text-[9px]">{locale === 'ar' ? 'محايد كربونياً!' : 'Carbon Neutral!'}</Badge>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* المدخلات */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold mb-2">{locale === 'ar' ? 'المدخلات البيئية' : 'Environmental Inputs'}</h4>
          <Field label={locale === 'ar' ? 'استهلاك الطاقة (kWh/سنة)' : 'Energy Use (kWh/yr)'} value={energyUse} onChange={setEnergyUse} icon={<Sun className="size-3" />} />
          <Field label={locale === 'ar' ? 'استهلاك المياه (م³/سنة)' : 'Water Use (m³/yr)'} value={waterUse} onChange={setWaterUse} icon={<Droplets className="size-3" />} />
          <Field label={locale === 'ar' ? 'النفايات (طن/سنة)' : 'Waste (ton/yr)'} value={wasteGenerated} onChange={setWasteGenerated} icon={<Recycle className="size-3" />} />
          <Field label={locale === 'ar' ? 'نفايات معاد تدويرها (طن)' : 'Recycled Waste (ton)'} value={recycledWaste} onChange={setRecycledWaste} icon={<Recycle className="size-3" />} />
          <Field label={locale === 'ar' ? 'أشجار مزروعة' : 'Trees Planted'} value={treesPlanted} onChange={setTreesPlanted} icon={<TreePine className="size-3" />} />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">{locale === 'ar' ? 'طاقة متجددة %' : 'Renewable %'}</Label>
              <Input type="number" value={renewableEnergy} onChange={(e) => setRenewableEnergy(Number(e.target.value) || 0)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">{locale === 'ar' ? 'مواد عضوية %' : 'Organic %'}</Label>
              <Input type="number" value={organicMaterials} onChange={(e) => setOrganicMaterials(Number(e.target.value) || 0)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">{locale === 'ar' ? 'توريد محلي %' : 'Local %'}</Label>
              <Input type="number" value={localSourcing} onChange={(e) => setLocalSourcing(Number(e.target.value) || 0)} className="h-7 text-xs" />
            </div>
          </div>
        </div>

        {/* الرسوم */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold mb-1">{locale === 'ar' ? 'تحليل الاستدامة (رادار)' : 'Sustainability Analysis'}</h4>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" fontSize={9} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={8} />
                <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* تفصيل النقاط */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            {radarData.map((d, i) => (
              <div key={i} className="p-1.5 rounded bg-secondary/40 text-center">
                <div className="text-muted-foreground">{d.metric}</div>
                <div className={cn('font-bold', d.value >= 70 ? 'text-emerald-600' : d.value >= 40 ? 'text-amber-600' : 'text-red-600')}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* توصيات */}
          <Card className="p-2 bg-emerald-50 dark:bg-emerald-900/20">
            <div className="text-[10px] font-medium mb-1 flex items-center gap-1"><Award className="size-3 text-emerald-600" /> {locale === 'ar' ? 'توصيات الاستدامة' : 'Recommendations'}</div>
            <ul className="text-[10px] space-y-0.5 text-muted-foreground">
              {result.energyScore < 50 && <li>⚡ زيادة الطاقة المتجددة (شمسي/رياح)</li>}
              {result.waterScore < 50 && <li>💧 تركيب نظام ري بالتنقيط + إعادة تدوير مياه</li>}
              {result.wasteScore < 50 && <li>♻️ زيادة نسبة تدوير النفايات</li>}
              {result.carbonScore < 50 && <li>🌳 زراعة المزيد من الأشجار لتعويض الكربون</li>}
              {result.materialsScore < 50 && <li>🌱 استخدام مواد عضوية بدلاً من الكيميائية</li>}
              {result.sourcingScore < 50 && <li>📦 زيادة التوريد المحلي لتقليل النقل</li>}
              {result.overallScore >= 80 && <li>🏆 أداء بيئي ممتاز - حافظ عليه!</li>}
            </ul>
          </Card>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, value, onChange, icon }: { label: string; value: number; onChange: (v: number) => void; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] flex items-center gap-1">{icon}{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="h-7 text-xs" />
    </div>
  );
}
