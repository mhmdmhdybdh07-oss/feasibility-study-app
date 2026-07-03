'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';
import { runMonteCarlo, type MonteCarloResult } from '@/lib/monte-carlo';
import { Loader2, Play, Dice5, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Cell, ReferenceLine,
} from 'recharts';

export function MonteCarloCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);

  const [iterations, setIterations] = useState(1000);
  const [revVol, setRevVol] = useState(20);
  const [costVol, setCostVol] = useState(15);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    if (!project) return;
    setRunning(true);
    setResult(null);
    // حرّك الحساب إلى next tick لتفادي تجميد الواجهة
    await new Promise((r) => setTimeout(r, 50));

    try {
      const fin = (project.financialStudy as any) ?? {};
      const eco = (project.economicStudy as any) ?? {};
      const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];

      const res = runMonteCarlo({
        initialInvestment: Number(fin.initialInvestment) || 0,
        yearsData,
        discountRate: Number(eco.discountRate) || 10,
        revenueVolatility: revVol / 100,
        costVolatility: costVol / 100,
        iterations,
      });
      setResult(res);
    } finally {
      setRunning(false);
    }
  };

  const cur = CURRENCIES[displayCurrency as CurrencyCode];
  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);
  const fmtShort = (yer: number) => {
    const v = yer / cur.rateToYER;
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toFixed(0);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-10 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
          <Dice5 className="size-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-md font-semibold">{t('monteCarloTitle')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar'
              ? 'تحليل كمي للمخاطر عبر آلاف السيناريوهات العشوائية المبنية على توزيع طبيعي'
              : 'Quantitative risk analysis through thousands of random scenarios based on normal distribution'}
          </p>
        </div>
      </div>

      {/* عناصر التحكم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs">{t('monteCarloIterations')}</Label>
          <Input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(Math.min(10000, Math.max(100, Number(e.target.value) || 1000)))}
            min={100}
            max={10000}
            step={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t('monteCarloRevenueVol')}</Label>
          <Input
            type="number"
            value={revVol}
            onChange={(e) => setRevVol(Math.min(100, Math.max(1, Number(e.target.value) || 20)))}
            min={1}
            max={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t('monteCarloCostVol')}</Label>
          <Input
            type="number"
            value={costVol}
            onChange={(e) => setCostVol(Math.min(100, Math.max(1, Number(e.target.value) || 15)))}
            min={1}
            max={100}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleRun} disabled={running} className="w-full">
            {running ? <Loader2 className="size-4 me-2 animate-spin" /> : <Play className="size-4 me-2" />}
            {t('monteCarloRun')}
          </Button>
        </div>
      </div>

      {running && (
        <div className="space-y-2">
          <div className="text-sm text-center text-muted-foreground">{t('monteCarloRun')}...</div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 bg-muted/50 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
          ))}
        </div>
      )}

      {result && !running && (
        <div className="space-y-4">
          {/* المؤشرات الرئيسية */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBox
              icon={<TrendingUp className="size-4" />}
              label={t('monteCarloProbNPV')}
              value={`${(result.probNPVPositive * 100).toFixed(1)}%`}
              color={result.probNPVPositive > 0.7 ? 'emerald' : result.probNPVPositive > 0.4 ? 'amber' : 'red'}
            />
            <MetricBox
              icon={<ShieldCheck className="size-4" />}
              label={t('monteCarloProbIRR')}
              value={`${(result.probIRRDiscount * 100).toFixed(1)}%`}
              color={result.probIRRDiscount > 0.7 ? 'emerald' : result.probIRRDiscount > 0.4 ? 'amber' : 'red'}
            />
            <MetricBox
              icon={<AlertTriangle className="size-4" />}
              label={t('monteCarloVar')}
              value={fmt(result.var95)}
              color="red"
            />
            <MetricBox
              icon={<AlertTriangle className="size-4" />}
              label={t('monteCarloCvar')}
              value={fmt(result.cvar95)}
              color="red"
            />
          </div>

          {/* النسب المئوية */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <StatBox label={t('monteCarloP5')} value={fmt(result.npvP5)} color="text-red-600" />
            <StatBox label={t('monteCarloP25') + ' (25%)'} value={fmt(result.npvP25)} color="text-amber-600" />
            <StatBox label={t('monteCarloMedian')} value={fmt(result.npvMedian)} color="text-blue-600" />
            <StatBox label={'75%'} value={fmt(result.npvP75)} color="text-emerald-600" />
            <StatBox label={t('monteCarloP95')} value={fmt(result.npvP95)} color="text-emerald-700" />
          </div>

          {/* المتوسط والانحراف */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <StatBox label={t('monteCarloMean')} value={fmt(result.npvMean)} />
            <StatBox label={t('monteCarloStd')} value={fmt(result.npvStd)} />
            <StatBox label={t('monteCarloRiskAdjusted')} value={fmt(result.riskAdjustedNPV)} color={result.riskAdjustedNPV > 0 ? 'text-emerald-600' : 'text-red-600'} />
            <StatBox label={t('monteCarloExpectedShortfall')} value={fmt(result.expectedShortfall)} color="text-red-600" />
          </div>

          {/* توزيع NPV */}
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('monteCarloDistribution')} ({cur.symbol})</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.distribution} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="bin" fontSize={9} angle={-30} textAnchor="end" height={50} />
                <YAxis fontSize={11} />
                <Tooltip
                  formatter={(v: number) => [`${v} ${locale === 'ar' ? 'تجربة' : 'iterations'}`, t('monteCarlo')]}
                  labelFormatter={(l) => `${locale === 'ar' ? 'المدى' : 'Range'}: ${l}`}
                />
                <ReferenceLine x={result.distribution.findIndex(d => d.npv >= 0)?.toString()} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'NPV=0', fontSize: 10, fill: '#10b981' }} />
                <Bar dataKey="count" name={locale === 'ar' ? 'عدد التجارب' : 'Count'}>
                  {result.distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.npv >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* مسارات NPV */}
          {result.samplePaths.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">{t('monteCarloSamplePaths')}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={buildPathData(result.samplePaths)}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="year" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => fmtShort(v * cur.rateToYER)} />
                  <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
                  <ReferenceLine y={0} stroke="#10b981" strokeDasharray="3 3" />
                  {result.samplePaths.slice(0, 20).map((_, i) => (
                    <Line
                      key={i}
                      dataKey={`path${i}`}
                      stroke={`hsl(${(i * 17) % 360}, 60%, 60%)`}
                      strokeWidth={1}
                      dot={false}
                      type="monotone"
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* التفسير */}
          <div className={`p-3 rounded-md text-sm ${result.probNPVPositive > 0.7 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : result.probNPVPositive > 0.4 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
            <div className="font-medium mb-1">{locale === 'ar' ? 'التفسير:' : 'Interpretation:'}</div>
            <p className="text-xs leading-relaxed">
              {locale === 'ar'
                ? `بناءً على ${result.iterations} تجربة عشوائية مع تذبذب ${revVol}% في الإيرادات و${costVol}% في التكاليف، هناك احتمال ${(result.probNPVPositive * 100).toFixed(1)}% أن يكون NPV موجباً. متوسط NPV المتوقع ${fmt(result.npvMean)}. في أسوأ 5% من الحالات، قد تصل الخسارة إلى ${fmt(result.cvar95)}.`
                : `Based on ${result.iterations} random iterations with ${revVol}% revenue volatility and ${costVol}% cost volatility, there is a ${(result.probNPVPositive * 100).toFixed(1)}% probability that NPV will be positive. Expected mean NPV is ${fmt(result.npvMean)}. In the worst 5% of cases, losses could reach ${fmt(result.cvar95)}.`}
            </p>
          </div>
        </div>
      )}

      {!result && !running && (
        <p className="text-xs text-muted-foreground italic">
          {locale === 'ar'
            ? '💡 اضبط معاملات التذبذب وعدد التجارب ثم اضغط "تشغيل المحاكاة" لتقدير درجة المخاطرة في المشروع.'
            : '💡 Adjust volatility parameters and iteration count, then click "Run Simulation" to estimate project risk.'}
        </p>
      )}
    </Card>
  );
}

function MetricBox({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'red' | 'blue';
}) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    red: 'bg-red-500/10 text-red-700 dark:text-red-300',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  };
  return (
    <div className={`p-3 rounded-md ${colors[color]}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function StatBox({ label, value, color = '' }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-2 rounded-md bg-secondary/50">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold text-sm ${color}`}>{value}</div>
    </div>
  );
}

function buildPathData(paths: number[][]) {
  if (!paths.length) return [];
  const len = paths[0].length;
  const data: any[] = [];
  for (let i = 0; i < len; i++) {
    const row: any = { year: i === 0 ? 'Start' : `Year ${i}` };
    paths.slice(0, 20).forEach((p, idx) => {
      row[`path${idx}`] = Number((p[i] / 1).toFixed(0)); // YER
    });
    data.push(row);
  }
  return data;
}
