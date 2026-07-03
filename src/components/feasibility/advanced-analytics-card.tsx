'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateTaxes, runScenarioAnalysis, calculateTornado, DEFAULT_SCENARIOS } from '@/lib/advanced-finance';
import { calculateNPV, calculateIRR, calculateIndicators } from '@/lib/calculations';
import { Receipt, Tornado, GitBranch, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, Cell,
} from 'recharts';

export function AdvancedAnalyticsCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);
  const cur = CURRENCIES[displayCurrency as CurrencyCode];

  const [vatRate, setVatRate] = useState(5);
  const [incomeTaxRate, setIncomeTaxRate] = useState(15);
  const [activeTab, setActiveTab] = useState<'tax' | 'tornado' | 'scenario'>('tax');

  const fin = (project?.financialStudy as any) ?? {};
  const eco = (project?.economicStudy as any) ?? {};
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
  const discountRate = Number(eco.discountRate) || 10;

  const annualRevenues = yearsData.length ? yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0) / yearsData.length : 0;
  const annualCosts = yearsData.length ? yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0) / yearsData.length : 0;

  // حسابات
  const tax = useMemo(() => calculateTaxes(annualRevenues, annualCosts, vatRate, incomeTaxRate), [annualRevenues, annualCosts, vatRate, incomeTaxRate]);

  const indicators = calculateIndicators({
    initialInvestment: Number(fin.initialInvestment) || 0,
    fixedAssets: Number(fin.fixedAssets) || 0,
    workingCapital: Number(fin.workingCapital) || 0,
    operatingCosts: Number(fin.operatingCosts) || 0,
    loans: Number(fin.loans) || 0,
    interestRate: Number(fin.interestRate) || 0,
    loanPeriod: Number(fin.loanPeriod) || 0,
    yearsData,
    discountRate,
  });

  // Tornado
  const tornadoData = useMemo(() => {
    const revenues = yearsData.map((y: any) => Number(y.revenues) || 0);
    const costs = yearsData.map((y: any) => Number(y.costs) || 0);
    if (!revenues.length) return [];
    return calculateTornado(
      { initialInvestment: Number(fin.initialInvestment) || 0, revenues, costs, discountRate },
      calculateNPV,
      [
        { variable: 'revenues', variableAr: locale === 'ar' ? 'الإيرادات' : 'Revenues', lowFactor: 0.9, highFactor: 1.1 },
        { variable: 'costs', variableAr: locale === 'ar' ? 'التكاليف' : 'Costs', lowFactor: 0.9, highFactor: 1.1 },
        { variable: 'initialInvestment', variableAr: locale === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment', lowFactor: 0.95, highFactor: 1.05 },
        { variable: 'discountRate', variableAr: locale === 'ar' ? 'معدل الخصم' : 'Discount Rate', lowFactor: 0.8, highFactor: 1.2 },
      ]
    );
  }, [fin, yearsData, discountRate, locale]);

  // Scenario
  const scenarioResult = useMemo(() => {
    if (!yearsData.length) return null;
    return runScenarioAnalysis(
      Number(fin.initialInvestment) || 0,
      yearsData.map((y: any) => ({ year: y.year, revenues: Number(y.revenues) || 0, costs: Number(y.costs) || 0 })),
      discountRate,
      DEFAULT_SCENARIOS,
      calculateNPV,
      calculateIRR
    );
  }, [fin, yearsData, discountRate]);

  if (!project) return null;

  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  // بيانات Tornado للرسم
  const tornadoChartData = tornadoData.map((item) => ({
    name: item.variableAr,
    low: Number((item.lowValue / cur.rateToYER).toFixed(2)),
    high: Number((item.highValue / cur.rateToYER).toFixed(2)),
    swing: Number((item.swing / cur.rateToYER).toFixed(2)),
  }));

  // بيانات السيناريوهات
  const scenarioChartData = (scenarioResult?.results ?? []).map((r) => ({
    name: locale === 'ar' ? r.scenario.name : r.scenario.nameEn,
    npv: Number((r.npv / cur.rateToYER).toFixed(2)),
    probability: r.scenario.probability * 100,
  }));

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tax">
            <Receipt className="size-4 me-1.5" />
            {locale === 'ar' ? 'الضرائب' : 'Taxes'}
          </TabsTrigger>
          <TabsTrigger value="tornado">
            <Tornado className="size-4 me-1.5" />
            {locale === 'ar' ? 'مخطط Tornado' : 'Tornado'}
          </TabsTrigger>
          <TabsTrigger value="scenario">
            <GitBranch className="size-4 me-1.5" />
            {locale === 'ar' ? 'السيناريوهات' : 'Scenarios'}
          </TabsTrigger>
        </TabsList>

        {/* تبويب الضرائب */}
        <TabsContent value="tax" className="space-y-4 mt-3">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
              <Receipt className="size-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold">{locale === 'ar' ? 'حاسبة الضرائب' : 'Tax Calculator'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'ضريبة القيمة المضافة (VAT) + ضريبة الدخل' : 'Value Added Tax (VAT) + Income Tax'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'معدل VAT %' : 'VAT Rate %'}</Label>
              <Input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value) || 0)} step="0.5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'ar' ? 'ضريبة الدخل %' : 'Income Tax %'}</Label>
              <Input type="number" value={incomeTaxRate} onChange={(e) => setIncomeTaxRate(Number(e.target.value) || 0)} step="0.5" />
            </div>
          </div>

          {/* نتائج VAT */}
          <div>
            <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'ضريبة القيمة المضافة (VAT)' : 'Value Added Tax (VAT)'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <TaxBox label={locale === 'ar' ? 'VAT على المبيعات' : 'VAT on Sales'} value={fmt(tax.vatOnSales)} color="text-red-600" />
              <TaxBox label={locale === 'ar' ? 'VAT قابل للخصم' : 'Deductible VAT'} value={fmt(tax.vatOnPurchases)} color="text-emerald-600" />
              <TaxBox label={locale === 'ar' ? 'VAT مستحق' : 'Net VAT Payable'} value={fmt(tax.vatNetPayable)} highlight />
            </div>
          </div>

          {/* نتائج ضريبة الدخل */}
          <div>
            <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'ضريبة الدخل' : 'Income Tax'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <TaxBox label={locale === 'ar' ? 'الدخل الخاضع' : 'Taxable Income'} value={fmt(tax.taxableIncome)} />
              <TaxBox label={locale === 'ar' ? 'ضريبة الدخل' : 'Income Tax'} value={fmt(tax.incomeTax)} color="text-red-600" />
              <TaxBox label={locale === 'ar' ? 'صافي بعد الضريبة' : 'Net After Tax'} value={fmt(tax.netProfitAfterTax)} color="text-emerald-600" />
            </div>
          </div>

          {/* التأثير الإجمالي */}
          <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'إجمالي التأثير النقدي' : 'Total Cash Impact'}</div>
                <div className="font-mono font-bold text-lg text-red-600">-{fmt(tax.cashFlowImpact)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'معدل الضريبة الفعلي' : 'Effective Tax Rate'}</div>
                <div className="font-mono font-bold text-lg text-amber-600">{tax.effectiveTaxRate.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* تبويب Tornado */}
        <TabsContent value="tornado" className="space-y-3 mt-3">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
              <Tornado className="size-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold">{locale === 'ar' ? 'مخطط Tornado - تحليل الحساسية المرئي' : 'Tornado Chart - Visual Sensitivity'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'تأثير ±10% في كل متغير على NPV (مرتب تنازلياً)' : 'Impact of ±10% change in each variable on NPV (sorted)'}
              </p>
            </div>
          </div>

          {tornadoChartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {locale === 'ar' ? 'أدخل بيانات مالية لعرض التحليل' : 'Enter financial data to see analysis'}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={tornadoChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 5 }}
                  barCategoryGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                  <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
                  <ReferenceLine x={Number((indicators.npv / cur.rateToYER).toFixed(2))} stroke="#0d9488" strokeDasharray="3 3" label={{ value: 'NPV', fontSize: 10, fill: '#0d9488' }} />
                  <Bar dataKey="low" name={locale === 'ar' ? 'الحد الأدنى' : 'Low'} fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="high" name={locale === 'ar' ? 'الحد الأقصى' : 'High'} fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* جدول التأثير */}
              <Card className="overflow-hidden p-0">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-2 text-start">{locale === 'ar' ? 'المتغير' : 'Variable'}</th>
                      <th className="p-2 text-end">{locale === 'ar' ? 'أدنى NPV' : 'Low NPV'}</th>
                      <th className="p-2 text-end">{locale === 'ar' ? 'أعلى NPV' : 'High NPV'}</th>
                      <th className="p-2 text-end">{locale === 'ar' ? 'مدى التأثير' : 'Swing'}</th>
                      <th className="p-2 text-end">{locale === 'ar' ? 'التأثير %' : 'Impact %'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tornadoData.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-medium">{item.variableAr}</td>
                        <td className="p-2 text-end font-mono text-red-600">{fmt(item.lowValue)}</td>
                        <td className="p-2 text-end font-mono text-emerald-600">{fmt(item.highValue)}</td>
                        <td className="p-2 text-end font-mono font-semibold">{fmt(item.swing)}</td>
                        <td className="p-2 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: `${item.impact}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{item.impact.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <div className="p-3 rounded-md bg-purple-500/5 border border-purple-500/20 text-xs">
                <b>{locale === 'ar' ? 'التفسير:' : 'Interpretation:'}</b>{' '}
                {locale === 'ar'
                  ? `أكثر متغير مؤثر هو "${tornadoData[0]?.variableAr ?? '—'}" بمدى تأثير ${fmt(tornadoData[0]?.swing ?? 0)}. هذا يعني أن تركيز جهود الإدارة يجب أن يكون على هذا المتغير أولاً.`
                  : `Most impactful variable is "${tornadoData[0]?.variableAr ?? '—'}" with swing of ${fmt(tornadoData[0]?.swing ?? 0)}. Management should focus on this variable first.`}
              </div>
            </>
          )}
        </TabsContent>

        {/* تبويب السيناريوهات */}
        <TabsContent value="scenario" className="space-y-3 mt-3">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">
              <GitBranch className="size-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold">{locale === 'ar' ? 'تحليل السيناريوهات' : 'Scenario Analysis'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'ثلاثة سيناريوهات مع احتمالات موزونة' : 'Three scenarios with weighted probabilities'}
              </p>
            </div>
          </div>

          {!scenarioResult ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {locale === 'ar' ? 'أدخل بيانات مالية لعرض التحليل' : 'Enter financial data to see analysis'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scenarioResult.results.map((r, i) => {
                  const isBest = scenarioResult.bestCase === r;
                  const isWorst = scenarioResult.worstCase === r;
                  const Icon = isBest ? TrendingUp : isWorst ? TrendingDown : Minus;
                  const color = isBest ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' :
                                isWorst ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
                  return (
                    <div key={i} className={`p-3 rounded-md border-2 ${color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`size-4 ${isBest ? 'text-emerald-600' : isWorst ? 'text-red-600' : 'text-blue-600'}`} />
                          <span className="font-semibold text-sm">{locale === 'ar' ? r.scenario.name : r.scenario.nameEn}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{(r.scenario.probability * 100).toFixed(0)}%</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NPV:</span>
                          <span className={`font-mono font-bold ${r.npv >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(r.npv)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IRR:</span>
                          <span className="font-mono">{r.irr !== null ? `${r.irr.toFixed(1)}%` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'صافي الربح' : 'Net Profit'}:</span>
                          <span className="font-mono">{fmt(r.netProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'الإيرادات' : 'Revenues'}:</span>
                          <span className="font-mono">{fmt(r.totalRevenues)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'التكاليف' : 'Costs'}:</span>
                          <span className="font-mono">{fmt(r.totalCosts)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* القيمة المتوقعة */}
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'NPV الموزون' : 'Weighted NPV'}</div>
                    <div className="font-mono font-bold text-lg">{fmt(scenarioResult.weightedNPV)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'مدى التذبذب' : 'Range'}</div>
                    <div className="font-mono font-bold text-lg text-amber-600">{fmt(scenarioResult.range)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'أفضل NPV' : 'Best NPV'}</div>
                    <div className="font-mono font-bold text-lg text-emerald-600">{fmt(scenarioResult.bestCase?.npv ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'أسوأ NPV' : 'Worst NPV'}</div>
                    <div className="font-mono font-bold text-lg text-red-600">{fmt(scenarioResult.worstCase?.npv ?? 0)}</div>
                  </div>
                </div>
              </div>

              {/* رسم NPV للسيناريوهات */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scenarioChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
                  <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
                  <ReferenceLine y={0} stroke="#666" />
                  <Bar dataKey="npv" name="NPV" radius={[4, 4, 0, 0]}>
                    {scenarioChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.npv >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="p-3 rounded-md bg-indigo-500/5 border border-indigo-500/20 text-xs">
                <b>{locale === 'ar' ? 'الخلاصة:' : 'Conclusion:'}</b>{' '}
                {locale === 'ar'
                  ? `القيمة المتوقعة الموزونة لـ NPV هي ${fmt(scenarioResult.weightedNPV)} مع مدى تذبذب ${fmt(scenarioResult.range)} بين أفضل وأسوأ سيناريو. ${scenarioResult.weightedNPV > 0 ? 'المشروع مجدي على المتوسط.' : 'المشروع غير مجدي على المتوسط.'}`
                  : `Weighted expected NPV is ${fmt(scenarioResult.weightedNPV)} with a range of ${fmt(scenarioResult.range)} between best and worst cases. ${scenarioResult.weightedNPV > 0 ? 'Project is viable on average.' : 'Project is not viable on average.'}`}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function TaxBox({ label, value, color = '', highlight = false }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-md ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold text-sm ${color || (highlight ? 'text-primary' : '')}`}>{value}</div>
    </div>
  );
}
