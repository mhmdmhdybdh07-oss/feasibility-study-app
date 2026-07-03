'use client';

import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Wallet, BarChart3, Target, Percent, Clock, Sparkles, Activity, Gauge } from 'lucide-react';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateIndicators, type YearRow } from '@/lib/calculations';
import { ValidationCard } from './validation-card';
import { LandAnalysisCard } from './land-analysis-card';
import { AiAnalysisCard } from './ai-analysis-card';
import { SustainabilityCard } from './sustainability-card';
import { ProjectMapCard } from './project-map-card';
import { MonteCarloCard } from './monte-carlo-card';
import { StrategicToolsCard } from './strategic-tools-card';
import { RiskManagementCard } from './risk-management-card';
import { ProjectTrackingCard } from './project-tracking-card';
import { KpiDashboardCard } from './kpi-dashboard-card';
import { LoanAmortizationCard } from './loan-amortization-card';
import { AdvancedAnalyticsCard } from './advanced-analytics-card';
import { AttachmentsAndActivityCard } from './attachments-activity-card';
import { ResourcesCustomFieldsCard } from './resources-custom-fields-card';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, ReferenceLine, Area, AreaChart,
} from 'recharts';

const COLORS = ['#0d9488', '#facc15', '#f97316', '#8b5cf6', '#ef4444', '#10b981'];

export function ResultsSection() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project, isLoading } = useProject(currentProjectId);

  if (!currentProjectId) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('selectProjectFirst')}</p>
      </Card>
    );
  }

  if (isLoading || !project) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
      </Card>
    );
  }

  const fin = project.financialStudy || {};
  const eco = project.economicStudy || {};
  const establishment = project.establishment || {};
  const cur = CURRENCIES[displayCurrency as CurrencyCode];

  const yearsData: YearRow[] = Array.isArray(fin.yearsData) ? fin.yearsData : [];
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

  // تحضير بيانات الرسوم
  const barData = yearsData.map((y) => ({
    name: `${t('finYear')} ${y.year}`,
    [t('finRevenuesYear')]: indicators.totalRevenues > 0
      ? Number((y.revenues / cur.rateToYER).toFixed(2))
      : 0,
    [t('finCostsYear')]: Number((y.costs / cur.rateToYER).toFixed(2)),
  }));

  const cashFlowData = indicators.netCashFlows.map((cf, i) => ({
    name: i === 0 ? (locale === 'ar' ? 'بداية' : 'Start') : `${t('finYear')} ${i}`,
    [t('finCashFlow')]: Number((cf / cur.rateToYER).toFixed(2)),
    [t('cumulativeCash')]: Number((indicators.cumulativeCashFlows[i] / cur.rateToYER).toFixed(2)),
  }));

  // توزيع الاستثمار
  const investmentData = [
    { name: t('finFixedAssets'), value: Number((Number(fin.fixedAssets || 0) / cur.rateToYER).toFixed(2)) },
    { name: t('finWorkingCapital'), value: Number((Number(fin.workingCapital || 0) / cur.rateToYER).toFixed(2)) },
    { name: t('finOperatingCosts'), value: Number((Number(fin.operatingCosts || 0) / cur.rateToYER).toFixed(2)) },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* رأس النتائج */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('resultsTitle')} — {cur.nameAr} ({cur.symbol})
            </p>
          </div>
          <Badge className={indicators.isViable ? 'bg-emerald-500 text-white' : 'bg-destructive text-destructive-foreground'}>
            {indicators.isViable ? t('projectViable') : t('projectNotViable')}
          </Badge>
        </div>
      </Card>

      {/* فحص جودة البيانات */}
      <ValidationCard />

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard
          icon={<Wallet className="size-5" />}
          label={t('finInitialInvestment')}
          value={formatCurrency(Number(fin.initialInvestment) || 0, displayCurrency, locale)}
          color="primary"
        />
        <IndicatorCard
          icon={<Target className="size-5" />}
          label={t('ecoNPV')}
          value={formatCurrency(indicators.npv, displayCurrency, locale)}
          color={indicators.npv >= 0 ? 'emerald' : 'destructive'}
          hint={`${Number(eco.discountRate) || 10}%`}
        />
        <IndicatorCard
          icon={<Percent className="size-5" />}
          label={t('ecoIRR')}
          value={indicators.irr !== null ? `${indicators.irr.toFixed(2)}%` : '—'}
          color={indicators.irr !== null && indicators.irr > (Number(eco.discountRate) || 10) ? 'emerald' : 'destructive'}
        />
        <IndicatorCard
          icon={<Clock className="size-5" />}
          label={t('ecoPayback')}
          value={indicators.paybackPeriod !== null ? `${indicators.paybackPeriod.toFixed(2)}` : '—'}
          color="primary"
          hint={locale === 'ar' ? 'سنوات' : 'years'}
        />
        <IndicatorCard
          icon={<TrendingUp className="size-5" />}
          label={t('ecoROI')}
          value={`${indicators.roi.toFixed(2)}%`}
          color={indicators.roi >= 0 ? 'emerald' : 'destructive'}
        />
        <IndicatorCard
          icon={<BarChart3 className="size-5" />}
          label={t('ecoProfitabilityIndex')}
          value={indicators.profitabilityIndex.toFixed(2)}
          color={indicators.profitabilityIndex >= 1 ? 'emerald' : 'destructive'}
        />
        <IndicatorCard
          icon={<TrendingUp className="size-5" />}
          label={locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenues'}
          value={formatCurrency(indicators.totalRevenues, displayCurrency, locale)}
          color="emerald"
        />
        <IndicatorCard
          icon={<TrendingDown className="size-5" />}
          label={locale === 'ar' ? 'إجمالي التكاليف' : 'Total Costs'}
          value={formatCurrency(indicators.totalCosts, displayCurrency, locale)}
          color="destructive"
        />
      </div>

      {/* المؤشرات المتقدمة */}
      <ChartCard title={t('advancedIndicators')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <IndicatorCard
            icon={<Activity className="size-5" />}
            label={t('mirr')}
            value={indicators.mirr !== null ? `${indicators.mirr.toFixed(2)}%` : '—'}
            color={indicators.mirr !== null && indicators.mirr > (Number(eco.discountRate) || 10) ? 'emerald' : 'destructive'}
          />
          <IndicatorCard
            icon={<Clock className="size-5" />}
            label={t('discountedPayback')}
            value={indicators.discountedPaybackPeriod !== null ? `${indicators.discountedPaybackPeriod.toFixed(2)}` : '—'}
            color="primary"
            hint={locale === 'ar' ? 'سنوات' : 'years'}
          />
          <IndicatorCard
            icon={<Gauge className="size-5" />}
            label={t('wacc')}
            value={`${indicators.wacc.toFixed(2)}%`}
            color="primary"
          />
          <IndicatorCard
            icon={<Target className="size-5" />}
            label={t('marginOfSafety')}
            value={
              indicators.totalRevenues > 0 && indicators.breakEvenRevenue > 0
                ? `${(((indicators.totalRevenues - indicators.breakEvenRevenue) / indicators.totalRevenues) * 100).toFixed(1)}%`
                : '—'
            }
            color="emerald"
          />
        </div>
      </ChartCard>

      {/* تحليل نقطة التعادل */}
      <ChartCard title={t('breakEvenAnalysis')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">{t('fixedCosts')}</span>
              <span className="font-mono font-semibold">{formatCurrency(Number(fin.operatingCosts) || 0, displayCurrency, locale)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">{t('variableCosts')}</span>
              <span className="font-mono font-semibold">{formatCurrency(Math.max(0, indicators.totalCosts - (Number(fin.operatingCosts) || 0)), displayCurrency, locale)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">{t('contributionMargin')}</span>
              <span className="font-mono font-semibold">
                {indicators.totalRevenues > 0
                  ? `${(((indicators.totalRevenues - Math.max(0, indicators.totalCosts - (Number(fin.operatingCosts) || 0))) / indicators.totalRevenues) * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-primary/10 border border-primary/20">
              <span className="font-medium">{t('breakEven')}</span>
              <span className="font-mono font-bold text-primary">{formatCurrency(indicators.breakEvenRevenue, displayCurrency, locale)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
              <span className="text-muted-foreground">{t('marginOfSafety')}</span>
              <span className="font-mono font-semibold text-emerald-600">
                {indicators.totalRevenues > 0 && indicators.breakEvenRevenue > 0
                  ? formatCurrency(Math.max(0, indicators.totalRevenues - indicators.breakEvenRevenue), displayCurrency, locale)
                  : '—'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={buildBreakEvenData(fin, indicators, cur.rateToYER)}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="units" fontSize={11} label={{ value: locale === 'ar' ? 'الإيرادات' : 'Revenue', position: 'insideBottom', fontSize: 10 }} />
              <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v / cur.rateToYER)} />
              <Tooltip formatter={(v: number) => formatCurrency(v, displayCurrency, locale)} />
              <Legend />
              <Area dataKey="revenue" name={locale === 'ar' ? 'الإيرادات' : 'Revenue'} stroke="#10b981" fill="#10bb8122" type="monotone" />
              <Area dataKey="costs" name={locale === 'ar' ? 'التكاليف' : 'Costs'} stroke="#ef4444" fill="#ef444422" type="monotone" />
              <ReferenceLine x={0} stroke="#0d9488" strokeDasharray="5 5" label={{ value: locale === 'ar' ? 'تعادل' : 'Break-even', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* بطاقة الذكاء الاصطناعي */}
      <AiAnalysisCard />

      {/* محاكاة مونت كارلو */}
      <MonteCarloCard />

      {/* الأدوات الاستراتيجية (SWOT + Porter) */}
      <StrategicToolsCard />

      {/* إدارة المخاطر */}
      <RiskManagementCard />

      {/* تتبع التنفيذ */}
      <ProjectTrackingCard />

      {/* لوحة KPIs */}
      <KpiDashboardCard />

      {/* القروض والضرائب و Tornado و السيناريوهات */}
      <LoanAmortizationCard />
      <AdvancedAnalyticsCard />

      {/* المرفقات وسجل النشاطات */}
      <AttachmentsAndActivityCard />

      {/* إدارة الموارد والحقول المخصصة */}
      <ResourcesCustomFieldsCard />

      {/* محلل التربة والاستصلاح */}
      <LandAnalysisCard />

      {/* حاسبة الاستدامة البيئية */}
      <SustainabilityCard />

      {/* خريطة موقع المشروع */}
      <ProjectMapCard />

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={`${t('revenueCosts')} (${cur.symbol})`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v * cur.rateToYER, displayCurrency, locale)} />
              <Legend />
              <Bar dataKey={t('finRevenuesYear')} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t('finCostsYear')} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`${t('finCashFlow')} & ${t('cumulativeCash')} (${cur.symbol})`}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v * cur.rateToYER, displayCurrency, locale)} />
              <Legend />
              <Bar dataKey={t('finCashFlow')} fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Line dataKey={t('cumulativeCash')} stroke="#f97316" strokeWidth={2} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {investmentData.length > 0 && (
          <ChartCard title={locale === 'ar' ? 'توزيع الاستثمار' : 'Investment Distribution'}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={investmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(e: any) => `${e.name}: ${cur.symbol}${new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en').format(e.value)}`}
                  labelLine={false}
                >
                  {investmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v * cur.rateToYER, displayCurrency, locale)} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title={locale === 'ar' ? 'التدفق النقدي التراكمي' : 'Cumulative Cash Flow'}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v * cur.rateToYER, displayCurrency, locale)} />
              <Legend />
              <Line dataKey={t('cumulativeCash')} stroke="#0d9488" strokeWidth={3} type="monotone" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ملخص الجدول */}
      <ChartCard title={t('yearsAnalysis')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-2 text-start">{t('finYear')}</th>
                <th className="p-2 text-end">{t('finRevenuesYear')}</th>
                <th className="p-2 text-end">{t('finCostsYear')}</th>
                <th className="p-2 text-end">{locale === 'ar' ? 'الصافي' : 'Net'}</th>
                <th className="p-2 text-end">{t('cumulativeCash')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-medium">{locale === 'ar' ? 'بداية (استثمار)' : 'Start (Investment)'}</td>
                <td className="p-2 text-end text-muted-foreground">—</td>
                <td className="p-2 text-end font-mono text-destructive">{formatCurrency(Number(fin.initialInvestment) || 0, displayCurrency, locale)}</td>
                <td className="p-2 text-end font-mono text-destructive">{formatCurrency(-Number(fin.initialInvestment) || 0, displayCurrency, locale)}</td>
                <td className="p-2 text-end font-mono text-destructive">{formatCurrency(-Number(fin.initialInvestment) || 0, displayCurrency, locale)}</td>
              </tr>
              {yearsData.map((y, i) => {
                const net = (Number(y.revenues) || 0) - (Number(y.costs) || 0);
                const cum = indicators.cumulativeCashFlows[i + 1] || 0;
                return (
                  <tr key={i} className="border-t hover:bg-accent/30">
                    <td className="p-2 font-medium">{t('finYear')} {y.year}</td>
                    <td className="p-2 text-end font-mono text-emerald-600">{formatCurrency(Number(y.revenues) || 0, displayCurrency, locale)}</td>
                    <td className="p-2 text-end font-mono text-destructive">{formatCurrency(Number(y.costs) || 0, displayCurrency, locale)}</td>
                    <td className={`p-2 text-end font-mono ${net >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatCurrency(net, displayCurrency, locale)}</td>
                    <td className={`p-2 text-end font-mono ${cum >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatCurrency(cum, displayCurrency, locale)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 bg-secondary/30 font-semibold">
                <td className="p-2">{t('total')}</td>
                <td className="p-2 text-end font-mono text-emerald-600">{formatCurrency(indicators.totalRevenues, displayCurrency, locale)}</td>
                <td className="p-2 text-end font-mono text-destructive">{formatCurrency(indicators.totalCosts, displayCurrency, locale)}</td>
                <td className={`p-2 text-end font-mono ${indicators.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatCurrency(indicators.totalNetProfit, displayCurrency, locale)}</td>
                <td className="p-2 text-end"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* الملخص التنفيذي التلقائي */}
      <ChartCard title={t('executiveSummary')}>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-3">
          <p>
            {locale === 'ar'
              ? `يهدف هذا التقرير إلى تقديم دراسة جدوى متكاملة لمشروع "${project.name}"، `
              : `This report presents an integrated feasibility study for the project "${project.name}", `}
            {establishment.projectDescription
              ? `${establishment.projectDescription}. `
              : ''}
            {locale === 'ar'
              ? `يبلغ الاستثمار الأولي للمشروع ${formatCurrency(Number(fin.initialInvestment) || 0, displayCurrency, locale)}، موزعة على الأصول الثابتة ورأس المال العامل والتكاليف التشغيلية. `
              : `The initial investment amounts to ${formatCurrency(Number(fin.initialInvestment) || 0, displayCurrency, locale)}, distributed across fixed assets, working capital, and operating costs. `}
          </p>
          <p>
            {locale === 'ar'
              ? `بناءً على التحليل المالي للمشروع خلال ${yearsData.length} سنوات، `
              : `Based on the financial analysis over ${yearsData.length} years, `}
            {locale === 'ar'
              ? `تبلغ إجمالي الإيرادات المتوقعة ${formatCurrency(indicators.totalRevenues, displayCurrency, locale)} مقابل إجمالي تكاليف قدرها ${formatCurrency(indicators.totalCosts, displayCurrency, locale)}، `
              : `total expected revenues are ${formatCurrency(indicators.totalRevenues, displayCurrency, locale)} against total costs of ${formatCurrency(indicators.totalCosts, displayCurrency, locale)}, `}
            {locale === 'ar'
              ? `مما يحقق صافي ربح ${formatCurrency(indicators.totalNetProfit, displayCurrency, locale)}.`
              : `yielding a net profit of ${formatCurrency(indicators.totalNetProfit, displayCurrency, locale)}.`}
          </p>
          <p>
            {locale === 'ar'
              ? `تشير المؤشرات الاقتصادية إلى أن صافي القيمة الحالية (NPV) عند معدل خصم ${Number(eco.discountRate) || 10}% يبلغ ${formatCurrency(indicators.npv, displayCurrency, locale)}، `
              : `Economic indicators show that the Net Present Value (NPV) at a discount rate of ${Number(eco.discountRate) || 10}% is ${formatCurrency(indicators.npv, displayCurrency, locale)}, `}
            {indicators.irr !== null
              ? (locale === 'ar'
                ? `ومعدل العائد الداخلي (IRR) ${indicators.irr.toFixed(2)}%، `
                : `and the Internal Rate of Return (IRR) is ${indicators.irr.toFixed(2)}%, `)
              : ''}
            {indicators.paybackPeriod !== null
              ? (locale === 'ar'
                ? `مع فترة استرداد تقدر بـ ${indicators.paybackPeriod.toFixed(2)} سنة. `
                : `with an estimated payback period of ${indicators.paybackPeriod.toFixed(2)} years. `)
              : ''}
          </p>
          <p className="font-semibold">
            {indicators.isViable
              ? (locale === 'ar'
                ? `✓ الخلاصة: المشروع يُعد مجدياً اقتصادياً وفقاً للمؤشرات الحالية، ويُنصح بالمضي قدماً في التنفيذ مع متابعة الافتراضات بشكل دوري.`
                : `✓ Conclusion: The project is economically viable based on current indicators, and it is recommended to proceed with implementation while monitoring assumptions periodically.`)
              : (locale === 'ar'
                ? `✗ الخلاصة: المشروع غير مجدي وفق المعطيات الحالية، ويُنصح بمراجعة هيكل التكاليف والإيرادات أو البحث عن بدائل قبل التنفيذ.`
                : `✗ Conclusion: The project is not viable under current assumptions; it is recommended to review the cost/revenue structure or explore alternatives before implementation.`)}
          </p>
        </div>
      </ChartCard>

      {/* تحليل الحساسية */}
      <ChartCard title={t('ecoSensitivity')}>
        <p className="text-xs text-muted-foreground mb-3">
          {locale === 'ar'
            ? 'تأثير تغير الإيرادات والتكاليف على صافي القيمة الحالية (NPV):'
            : 'Impact of changes in revenues and costs on NPV:'}
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={buildSensitivityData(indicators, Number(eco.discountRate) || 10, cur.rateToYER)} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="scenario" fontSize={11} />
            <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v / cur.rateToYER)} />
            <Tooltip formatter={(v: number) => formatCurrency(v, displayCurrency, locale)} />
            <Legend />
            <Bar dataKey="npv" name={t('ecoNPV')} radius={[4, 4, 0, 0]}>
              {buildSensitivityData(indicators, Number(eco.discountRate) || 10, cur.rateToYER).map((entry, i) => (
                <Cell key={i} fill={entry.npv >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* التوصيات */}
      <ChartCard title={t('recommendations')}>
        <div className="space-y-3 text-sm">
          <RecommendationRow
            type={indicators.npv > 0 ? 'positive' : 'negative'}
            label={t('ecoNPV')}
            value={formatCurrency(indicators.npv, displayCurrency, locale)}
            note={locale === 'ar' ? (indicators.npv > 0 ? 'القيمة الحالية موجبة - المشروع يحقق عائداً يفوق معدل الخصم' : 'القيمة الحالية سالبة - يجب مراجعة الإيرادات والتكاليف') : ''}
          />
          <RecommendationRow
            type={indicators.irr === null ? 'neutral' : indicators.irr > (Number(eco.discountRate) || 10) ? 'positive' : 'negative'}
            label={t('ecoIRR')}
            value={indicators.irr !== null ? `${indicators.irr.toFixed(2)}%` : '—'}
            note={locale === 'ar' ? (indicators.irr !== null && indicators.irr > (Number(eco.discountRate) || 10) ? `IRR يفوق معدل الخصم ${Number(eco.discountRate) || 10}%` : 'IRR أقل من معدل الخصم') : ''}
          />
          <RecommendationRow
            type={indicators.paybackPeriod !== null && indicators.paybackPeriod <= (yearsData.length || 5) ? 'positive' : 'neutral'}
            label={t('ecoPayback')}
            value={indicators.paybackPeriod !== null ? `${indicators.paybackPeriod.toFixed(2)} ${locale === 'ar' ? 'سنة' : 'years'}` : '—'}
            note={locale === 'ar' ? 'فترة استرداد قصيرة نسبياً' : ''}
          />
          <RecommendationRow
            type={indicators.profitabilityIndex >= 1 ? 'positive' : 'negative'}
            label={t('ecoProfitabilityIndex')}
            value={indicators.profitabilityIndex.toFixed(2)}
            note={locale === 'ar' ? (indicators.profitabilityIndex >= 1 ? 'مؤشر ربحية أكبر من 1 - مجدي' : 'مؤشر ربحية أقل من 1 - غير مجدي') : ''}
          />
        </div>
      </ChartCard>
    </div>
  );
}

function IndicatorCard({ icon, label, value, color, hint }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'emerald' | 'destructive';
  hint?: string;
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    destructive: 'bg-destructive/10 text-destructive',
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className={`text-lg font-bold font-mono tabular-nums mt-1 ${color === 'emerald' ? 'text-emerald-600' : color === 'destructive' ? 'text-destructive' : ''}`}>
            {value}
          </div>
          {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
        </div>
        <div className={`size-8 rounded-md flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="text-md font-semibold mb-3">{title}</h3>
      {children}
    </Card>
  );
}

function RecommendationRow({ type, label, value, note }: {
  type: 'positive' | 'negative' | 'neutral';
  label: string;
  value: string;
  note: string;
}) {
  const colors = {
    positive: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    negative: 'border-destructive bg-red-50 dark:bg-red-900/20',
    neutral: 'border-muted bg-muted/50',
  };
  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-md border-s-2 ${colors[type]}`}>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {note && <div className="text-xs text-muted-foreground mt-0.5">{note}</div>}
      </div>
      <div className="font-mono font-bold">{value}</div>
    </div>
  );
}

// بناء بيانات تحليل نقطة التعادل - منحنيات الإيرادات والتكاليف
function buildBreakEvenData(
  fin: any,
  indicators: ReturnType<typeof calculateIndicators>,
  _rate: number
): Array<{ units: string; revenue: number; costs: number }> {
  const fixedCosts = Number(fin.operatingCosts) || 0;
  const breakEven = indicators.breakEvenRevenue;
  if (!breakEven || breakEven <= 0) return [];

  // 10 نقاط: من 0 إلى 1.8 ضعف نقطة التعادل
  const points: Array<{ units: string; revenue: number; costs: number }> = [];
  for (let i = 0; i <= 9; i++) {
    const revenue = breakEven * (i / 5);
    const variableRatio = indicators.totalRevenues > 0
      ? Math.max(0, indicators.totalCosts - fixedCosts) / indicators.totalRevenues
      : 0.6;
    const costs = fixedCosts + revenue * variableRatio;
    points.push({
      units: i === 5 ? 'تعادل' : `${(i * 20)}%`,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
    });
  }
  return points;
}
function buildSensitivityData(
  indicators: ReturnType<typeof calculateIndicators>,
  discountRate: number,
  _rate: number
): Array<{ scenario: string; npv: number }> {
  const baseFlows = indicators.netCashFlows;
  if (!baseFlows.length) return [];
  const initial = Math.abs(baseFlows[0] || 0);
  const yearly = baseFlows.slice(1);
  if (!yearly.length) return [];

  const calc = (factorRev: number, factorCost: number): number => {
    // تطبيق التغيير على الإيرادات (موجبة) والتكاليف (سالب)
    const adjusted = yearly.map((cf) => {
      if (cf >= 0) return cf * factorRev;
      return cf * factorCost;
    });
    const flows = [-initial, ...adjusted];
    return flows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + discountRate / 100, i), 0);
  };

  const isAr = document.documentElement.lang === 'ar';
  return [
    { scenario: isAr ? 'إيرادات -20%' : 'Rev -20%', npv: calc(0.8, 1) },
    { scenario: isAr ? 'إيرادات -10%' : 'Rev -10%', npv: calc(0.9, 1) },
    { scenario: isAr ? 'الأساسي' : 'Base', npv: indicators.npv },
    { scenario: isAr ? 'إيرادات +10%' : 'Rev +10%', npv: calc(1.1, 1) },
    { scenario: isAr ? 'تكاليف +10%' : 'Cost +10%', npv: calc(1, 1.1) },
    { scenario: isAr ? 'تكاليف +20%' : 'Cost +20%', npv: calc(1, 1.2) },
    { scenario: isAr ? 'أسوأ حالة' : 'Worst', npv: calc(0.8, 1.2) },
  ];
}
