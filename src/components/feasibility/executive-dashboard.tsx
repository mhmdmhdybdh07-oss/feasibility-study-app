'use client';

import { useProjects } from '@/hooks/use-projects';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';
import { AnimatedNumber, Reveal, AnimatedProgress } from './animations';
import {
  TrendingUp, TrendingDown, Wallet, FileText, Users, BarChart3,
  CheckCircle2, Clock, AlertCircle, Target, Award, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#0d9488', '#facc15', '#f97316', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899'];

export function ExecutiveDashboard() {
  const { t, locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: projects, isLoading } = useProjects();

  if (isLoading || !projects || projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="size-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {locale === 'ar' ? 'أنشئ مشاريع لعرض اللوحة التنفيذية' : 'Create projects to view executive dashboard'}
        </p>
      </Card>
    );
  }

  // حساب المؤشرات الإجمالية
  const stats = projects.map((p) => {
    const fin = (p as any).financialStudy ?? {};
    const eco = (p as any).economicStudy ?? {};
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
    const est = (p as any).establishment ?? {};
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      investment: Number(fin.initialInvestment) || 0,
      npv: indicators.npv,
      irr: indicators.irr,
      roi: indicators.roi,
      payback: indicators.paybackPeriod,
      netProfit: indicators.totalNetProfit,
      viable: indicators.isViable,
      sector: est.projectSector || 'عام',
      duration: est.projectDuration || 5,
    };
  });

  const totalInvestment = stats.reduce((s, p) => s + p.investment, 0);
  const totalProfit = stats.reduce((s, p) => s + p.netProfit, 0);
  const viableCount = stats.filter((p) => p.viable).length;
  const avgROI = stats.length > 0 ? stats.reduce((s, p) => s + p.roi, 0) / stats.length : 0;
  const avgPayback = stats.filter(p => p.payback).length > 0
    ? stats.filter(p => p.payback).reduce((s, p) => s + (p.payback || 0), 0) / stats.filter(p => p.payback).length
    : 0;

  // توزيع المشاريع حسب القطاع
  const sectorMap: Record<string, number> = {};
  stats.forEach((p) => {
    const sector = p.sector || 'عام';
    sectorMap[sector] = (sectorMap[sector] || 0) + 1;
  });
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

  // توزيع المشاريع حسب الحالة
  const statusData = [
    { name: locale === 'ar' ? 'مسودة' : 'Draft', value: stats.filter(p => p.status === 'draft').length, color: '#94a3b8' },
    { name: locale === 'ar' ? 'قيد التنفيذ' : 'In Progress', value: stats.filter(p => p.status === 'in-progress').length, color: '#3b82f6' },
    { name: locale === 'ar' ? 'مكتمل' : 'Completed', value: stats.filter(p => p.status === 'completed').length, color: '#10b981' },
  ].filter(s => s.value > 0);

  // أعلى المشاريع ربحية
  const topProjects = [...stats].sort((a, b) => b.netProfit - a.netProfit).slice(0, 5);
  const topChartData = topProjects.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    profit: Number((p.netProfit / 1000000).toFixed(1)),
    investment: Number((p.investment / 1000000).toFixed(1)),
  }));

  // توزيع المجدي/غير مجدي
  const viabilityData = [
    { name: locale === 'ar' ? 'مجدي' : 'Viable', value: viableCount, color: '#10b981' },
    { name: locale === 'ar' ? 'غير مجدي' : 'Not Viable', value: stats.length - viableCount, color: '#ef4444' },
  ].filter(s => s.value > 0);

  const fmt = (v: number) => formatCurrency(v, displayCurrency, locale);

  return (
    <div className="space-y-4">
      {/* رأس */}
      <Reveal>
        <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <BarChart3 className="size-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{locale === 'ar' ? 'اللوحة التنفيذية' : 'Executive Dashboard'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? `نظرة شاملة على ${projects.length} مشروع` : `Overview of ${projects.length} projects`}
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* بطاقات KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Reveal delay={0}>
          <KPICard
            icon={<Wallet className="size-5" />}
            label={locale === 'ar' ? 'إجمالي الاستثمار' : 'Total Investment'}
            value={fmt(totalInvestment)}
            color="primary"
          />
        </Reveal>
        <Reveal delay={100}>
          <KPICard
            icon={totalProfit >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
            label={locale === 'ar' ? 'إجمالي الأرباح' : 'Total Profit'}
            value={fmt(totalProfit)}
            color={totalProfit >= 0 ? 'emerald' : 'red'}
          />
        </Reveal>
        <Reveal delay={200}>
          <KPICard
            icon={<Award className="size-5" />}
            label={locale === 'ar' ? 'مشاريع مجدية' : 'Viable Projects'}
            value={`${viableCount}/${stats.length}`}
            color="emerald"
          />
        </Reveal>
        <Reveal delay={300}>
          <KPICard
            icon={<Target className="size-5" />}
            label={locale === 'ar' ? 'متوسط ROI' : 'Avg ROI'}
            value={`${avgROI.toFixed(1)}%`}
            color={avgROI >= 0 ? 'emerald' : 'red'}
          />
        </Reveal>
      </div>

      {/* صف الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* أعلى 5 مشاريع ربحية */}
        <Reveal delay={100}>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-600" />
              {locale === 'ar' ? 'أعلى 5 مشاريع ربحية (مليون)' : 'Top 5 Profitable (Million)'}
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={9} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={9} />
                <Tooltip formatter={(v: number) => `${v}M ﷼`} />
                <Legend />
                <Bar dataKey="investment" name={locale === 'ar' ? 'استثمار' : 'Investment'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name={locale === 'ar' ? 'ربح' : 'Profit'} fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Reveal>

        {/* توزيع القطاعات */}
        <Reveal delay={200}>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Activity className="size-4 text-blue-600" />
              {locale === 'ar' ? 'توزيع القطاعات' : 'Sector Distribution'}
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(e: any) => `${e.name}: ${e.value}`}
                >
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Reveal>

        {/* حالة المشاريع */}
        <Reveal delay={300}>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="size-4 text-amber-600" />
              {locale === 'ar' ? 'حالة المشاريع' : 'Project Status'}
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Reveal>

        {/* الجدوى */}
        <Reveal delay={400}>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {locale === 'ar' ? 'تحليل الجدوى' : 'Viability Analysis'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="relative size-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[{ name: 'viable', value: stats.length > 0 ? (viableCount / stats.length) * 100 : 0, fill: '#10b981' }]}
                      startAngle={90}
                      endAngle={-270}
                      innerRadius="70%"
                      outerRadius="100%"
                    >
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e5e7eb' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{viableCount}</div>
                      <div className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'مجدي' : 'Viable'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2">
                {viabilityData.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-sm font-medium">{v.name}</span>
                    <span className="text-sm font-bold ms-auto">{v.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'متوسط فترة الاسترداد' : 'Avg Payback'}</div>
                  <div className="text-lg font-bold text-primary">{avgPayback.toFixed(1)} {locale === 'ar' ? 'سنة' : 'yr'}</div>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* جدول محفظة المشاريع */}
      <Reveal delay={200}>
        <Card className="overflow-hidden p-0">
          <div className="p-3 border-b">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              {locale === 'ar' ? 'محفظة المشاريع' : 'Project Portfolio'}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50 sticky top-0">
                <tr>
                  <th className="p-2 text-start">{locale === 'ar' ? 'المشروع' : 'Project'}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'استثمار' : 'Investment'}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'ربح' : 'Profit'}</th>
                  <th className="p-2 text-end">ROI</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'استرداد' : 'Payback'}</th>
                  <th className="p-2 text-center">{locale === 'ar' ? 'الجدوى' : 'Viability'}</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-accent/30">
                    <td className="p-2 font-medium truncate max-w-32">{p.name}</td>
                    <td className="p-2 text-end font-mono">{fmt(p.investment)}</td>
                    <td className={cn('p-2 text-end font-mono', p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(p.netProfit)}</td>
                    <td className={cn('p-2 text-end font-mono', p.roi >= 0 ? 'text-emerald-600' : 'text-red-600')}>{p.roi.toFixed(1)}%</td>
                    <td className="p-2 text-end font-mono">{p.payback !== null ? `${p.payback.toFixed(1)}` : '—'}</td>
                    <td className="p-2 text-center">
                      <Badge className={p.viable ? 'bg-emerald-500 text-white text-[9px]' : 'bg-red-500 text-white text-[9px]'}>
                        {p.viable ? '✓' : '✗'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/30 font-bold">
                <tr>
                  <td className="p-2">{locale === 'ar' ? 'الإجمالي' : 'Total'}</td>
                  <td className="p-2 text-end font-mono">{fmt(totalInvestment)}</td>
                  <td className={cn('p-2 text-end font-mono', totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(totalProfit)}</td>
                  <td className="p-2 text-end font-mono">{avgROI.toFixed(1)}%</td>
                  <td className="p-2 text-end font-mono">{avgPayback.toFixed(1)}</td>
                  <td className="p-2 text-center">{viableCount}/{stats.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

function KPICard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'emerald' | 'red' | 'amber';
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
    amber: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className={`text-base font-bold font-mono tabular-nums mt-1 ${color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-600' : color === 'amber' ? 'text-amber-600' : ''}`}>
            {value}
          </div>
        </div>
        <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', colors[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
