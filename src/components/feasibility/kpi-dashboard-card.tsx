'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Wallet, Users, Activity, Target, Percent, Gauge } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

export function KpiDashboardCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);

  if (!project) return null;

  const fin = (project.financialStudy as any) ?? {};
  const eco = (project.economicStudy as any) ?? {};
  const tech = (project.technicalStudy as any) ?? {};
  const social = (project.socialStudy as any) ?? {};
  const market = (project.marketStudy as any) ?? {};
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];

  const indicators = calculateIndicators({
    initialInvestment: Number(fin.initialInvestment) || 0,
    fixedAssets: Number(fin.fixedAssets) || 0,
    workingCapital: Number(fin.workingCapital) || 0,
    operatingCosts: Number(fin.operatingCosts) || 0,
    loans: Number(fin.loans) || 0,
    interestRate: Number(fin.interestRate) || 0,
    loanPeriod: Number(fin.loanPeriod) || 0,
    yearsData,
    discountRate: Number(eco.discountRate) || 10,
  });

  const cur = CURRENCIES[displayCurrency as CurrencyCode];
  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  // KPIs مقسّمة لفئات
  const financialKpis = [
    { name: t('ecoNPV'), value: indicators.npv, target: 0, unit: 'currency', higherBetter: true },
    { name: t('ecoIRR'), value: indicators.irr ?? 0, target: Number(eco.discountRate) || 10, unit: '%', higherBetter: true },
    { name: t('ecoROI'), value: indicators.roi, target: 15, unit: '%', higherBetter: true },
    { name: t('ecoProfitabilityIndex'), value: indicators.profitabilityIndex, target: 1, unit: '', higherBetter: true },
    { name: t('mirr'), value: indicators.mirr ?? 0, target: Number(eco.discountRate) || 10, unit: '%', higherBetter: true },
  ];

  const operationalKpis = [
    { name: t('techProductionCapacity'), value: tech.productionCapacity || '—', target: '', unit: 'text' },
    { name: t('techLaborRequired'), value: Number(tech.laborRequired) || 0, target: 10, unit: 'number' },
    { name: t('socialJobsCreated'), value: Number(social.jobsCreated) || 0, target: 5, unit: 'number', higherBetter: true },
    { name: t('socialLocalEmployment'), value: Number(social.localEmployment) || 0, target: 70, unit: '%', higherBetter: true },
    { name: t('socialGenderRatio'), value: Number(social.genderRatio) || 0, target: 30, unit: '%', higherBetter: true },
  ];

  const strategicKpis = [
    { name: t('marketShare'), value: Number(market.expectedShare) || 0, target: 10, unit: '%', higherBetter: true },
    { name: t('marketGrowthRate'), value: Number(market.growthRate) || 0, target: 8, unit: '%', higherBetter: true },
    { name: t('ecoPayback'), value: indicators.paybackPeriod ?? 0, target: 5, unit: 'years', higherBetter: false },
    { name: t('marginOfSafety'), value: indicators.totalRevenues > 0 && indicators.breakEvenRevenue > 0
        ? ((indicators.totalRevenues - indicators.breakEvenRevenue) / indicators.totalRevenues) * 100 : 0, target: 30, unit: '%', higherBetter: true },
  ];

  // بيانات الرادار
  const radarData = [
    { metric: t('ecoROI'), value: Math.min(100, Math.max(0, indicators.roi)) },
    { metric: t('ecoProfitabilityIndex'), value: Math.min(100, indicators.profitabilityIndex * 50) },
    { metric: t('marketShare'), value: Math.min(100, (Number(market.expectedShare) || 0) * 5) },
    { metric: t('socialLocalEmployment'), value: Math.min(100, Number(social.localEmployment) || 0) },
    { metric: t('socialGenderRatio'), value: Math.min(100, Number(social.genderRatio) || 0) },
    { metric: t('marginOfSafety'), value: Math.min(100, indicators.totalRevenues > 0 && indicators.breakEvenRevenue > 0
        ? ((indicators.totalRevenues - indicators.breakEvenRevenue) / indicators.totalRevenues) * 100 : 0) },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
          <Gauge className="size-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold">{t('kpiDashboard')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar' ? 'مؤشرات الأداء الرئيسية (KPIs) عبر الفئات' : 'Key Performance Indicators across categories'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KPIs مالية */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Wallet className="size-4 text-primary" />
            {t('kpiFinancial')}
          </h4>
          <div className="space-y-2">
            {financialKpis.map((kpi, i) => {
              const meetsTarget = kpi.higherBetter ? kpi.value >= kpi.target : kpi.value <= kpi.target;
              const display = kpi.unit === 'currency' ? fmt(kpi.value) : `${kpi.value.toFixed(2)}${kpi.unit}`;
              return (
                <div key={i} className="p-2 rounded-md bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground truncate">{kpi.name}</span>
                    <Badge variant={meetsTarget ? 'default' : 'destructive'} className="text-[9px] h-4">
                      {meetsTarget ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className={`font-mono font-bold text-sm ${meetsTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                    {display}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t('kpiTarget')}: {kpi.unit === 'currency' ? fmt(kpi.target) : `${kpi.target}${kpi.unit}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPIs تشغيلية */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Activity className="size-4 text-blue-600" />
            {t('kpiOperational')}
          </h4>
          <div className="space-y-2">
            {operationalKpis.map((kpi, i) => {
              const val = kpi.value as any;
              const display = kpi.unit === 'text' ? val : `${val}${kpi.unit}`;
              const meetsTarget = kpi.unit === 'text' ? true :
                (kpi.higherBetter !== false ? val >= kpi.target : val <= kpi.target);
              return (
                <div key={i} className="p-2 rounded-md bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground truncate">{kpi.name}</span>
                    <Badge variant={meetsTarget ? 'default' : 'destructive'} className="text-[9px] h-4">
                      {meetsTarget ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className={`font-mono font-bold text-sm ${meetsTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                    {display}
                  </div>
                  {kpi.target && (
                    <div className="text-[10px] text-muted-foreground">
                      {t('kpiTarget')}: {kpi.target}{kpi.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KPIs استراتيجية */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Target className="size-4 text-purple-600" />
            {t('kpiStrategic')}
          </h4>
          <div className="space-y-2">
            {strategicKpis.map((kpi, i) => {
              const meetsTarget = kpi.higherBetter ? kpi.value >= kpi.target : kpi.value <= kpi.target;
              const display = `${kpi.value.toFixed(1)}${kpi.unit}`;
              return (
                <div key={i} className="p-2 rounded-md bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground truncate">{kpi.name}</span>
                    <Badge variant={meetsTarget ? 'default' : 'destructive'} className="text-[9px] h-4">
                      {meetsTarget ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className={`font-mono font-bold text-sm ${meetsTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                    {display}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t('kpiTarget')}: {kpi.target}{kpi.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* مخطط الرادار */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">
          {locale === 'ar' ? 'مؤشر الأداء الشامل' : 'Overall Performance Index'}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="metric" fontSize={10} />
            <PolarRadiusAxis domain={[0, 100]} fontSize={9} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#0d9488"
              fill="#0d9488"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
