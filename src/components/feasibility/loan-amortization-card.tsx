'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateAmortization } from '@/lib/advanced-finance';
import { Calculator, Table2, Calendar } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line,
} from 'recharts';

export function LoanAmortizationCard() {
  const { t, locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const cur = CURRENCIES[displayCurrency as CurrencyCode];

  const [loanYER, setLoanYER] = useState<number>(50000000); // 50 مليون ريال يمني افتراضياً
  const [interestRate, setInterestRate] = useState<number>(8);
  const [years, setYears] = useState<number>(5);

  // تحويل القرض من عملة العرض إلى YER
  const [displayAmount, setDisplayAmount] = useState<string>(
    (50000000 / cur.rateToYER).toFixed(0)
  );

  const handleAmountChange = (val: string) => {
    setDisplayAmount(val);
    const num = Number(val);
    if (!isNaN(num)) setLoanYER(num * cur.rateToYER);
  };

  const result = useMemo(
    () => calculateAmortization(loanYER, interestRate, years, 12),
    [loanYER, interestRate, years]
  );

  const fmt = (yer: number) => formatCurrency(yer, displayCurrency, locale);

  // بيانات الرسم
  const chartData = result.yearlySummary.map((y) => ({
    year: `${t('finYear')} ${y.year}`,
    [locale === 'ar' ? 'فائدة' : 'Interest']: Number((y.interest / cur.rateToYER).toFixed(2)),
    [locale === 'ar' ? 'أصل' : 'Principal']: Number((y.principal / cur.rateToYER).toFixed(2)),
    [locale === 'ar' ? 'رصيد' : 'Balance']: Number((y.balanceEnd / cur.rateToYER).toFixed(2)),
  }));

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
          <Calculator className="size-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold">
            {locale === 'ar' ? 'جدول إهلاك القروض' : 'Loan Amortization Schedule'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar' ? 'جدول تفصيلي للدفعات الشهرية والفوائد والأصل المتبقي' : 'Detailed monthly payment, interest, and principal schedule'}
          </p>
        </div>
      </div>

      {/* مدخلات القرض */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs">
            {locale === 'ar' ? 'مبلغ القرض' : 'Loan Amount'} ({cur.symbol})
          </Label>
          <Input
            type="number"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'ar' ? 'معدل الفائدة السنوي %' : 'Annual Interest Rate %'}</Label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
            step="0.1"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'ar' ? 'مدة القرض (سنوات)' : 'Loan Period (years)'}</Label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Math.max(1, Number(e.target.value) || 1))}
            min={1}
            max={30}
          />
        </div>
      </div>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <StatBox
          label={locale === 'ar' ? 'الدفعة الشهرية' : 'Monthly Payment'}
          value={fmt(result.monthlyPayment)}
          highlight
        />
        <StatBox
          label={locale === 'ar' ? 'إجمالي المدفوعات' : 'Total Payment'}
          value={fmt(result.totalPayment)}
        />
        <StatBox
          label={locale === 'ar' ? 'إجمالي الفوائد' : 'Total Interest'}
          value={fmt(result.totalInterest)}
          color="text-red-600"
        />
        <StatBox
          label={locale === 'ar' ? 'نسبة الفائدة' : 'Interest Ratio'}
          value={result.totalPayment > 0 ? `${((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%` : '0%'}
          color="text-amber-600"
        />
      </div>

      {/* رسم بياني */}
      {result.yearlySummary.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Calendar className="size-4 text-blue-600" />
            {locale === 'ar' ? 'الفائدة والأصل والرصيد السنوي' : 'Yearly Interest, Principal & Balance'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', { notation: 'compact' }).format(v)} />
              <Tooltip formatter={(v: number) => fmt(v * cur.rateToYER)} />
              <Legend />
              <Bar dataKey={locale === 'ar' ? 'فائدة' : 'Interest'} stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey={locale === 'ar' ? 'أصل' : 'Principal'} stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line dataKey={locale === 'ar' ? 'رصيد' : 'Balance'} stroke="#0d9488" strokeWidth={2} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* جدول الملخص السنوي */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">{locale === 'ar' ? 'الملخص السنوي' : 'Yearly Summary'}</h4>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-2 text-start">{t('finYear')}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'الدفعة' : 'Payment'}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'فائدة' : 'Interest'}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'أصل' : 'Principal'}</th>
                  <th className="p-2 text-end">{locale === 'ar' ? 'رصيد نهاية' : 'Balance End'}</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlySummary.map((y) => (
                  <tr key={y.year} className="border-t hover:bg-accent/30">
                    <td className="p-2 font-medium">{y.year}</td>
                    <td className="p-2 text-end font-mono">{fmt(y.payment)}</td>
                    <td className="p-2 text-end font-mono text-red-600">{fmt(y.interest)}</td>
                    <td className="p-2 text-end font-mono text-emerald-600">{fmt(y.principal)}</td>
                    <td className="p-2 text-end font-mono">{fmt(y.balanceEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* جدول الدفعات الشهرية (يمكن طيه) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium flex items-center gap-1.5 hover:text-primary">
          <Table2 className="size-4" />
          {locale === 'ar' ? `جدول الدفعات الشهرية (${result.schedule.length} شهر)` : `Monthly Payment Schedule (${result.schedule.length} months)`}
          <Badge variant="secondary" className="ms-2 text-[10px]">{locale === 'ar' ? 'انقر للتوسيع' : 'Click to expand'}</Badge>
        </summary>
        <Card className="overflow-hidden p-0 mt-2 max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50 sticky top-0">
              <tr>
                <th className="p-2 text-start">#</th>
                <th className="p-2 text-end">{locale === 'ar' ? 'دفعة' : 'Payment'}</th>
                <th className="p-2 text-end">{locale === 'ar' ? 'فائدة' : 'Interest'}</th>
                <th className="p-2 text-end">{locale === 'ar' ? 'أصل' : 'Principal'}</th>
                <th className="p-2 text-end">{locale === 'ar' ? 'رصيد' : 'Balance'}</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.month} className="border-t hover:bg-accent/30">
                  <td className="p-2 font-medium">{row.month}</td>
                  <td className="p-2 text-end font-mono">{fmt(row.payment)}</td>
                  <td className="p-2 text-end font-mono text-red-600">{fmt(row.interest)}</td>
                  <td className="p-2 text-end font-mono text-emerald-600">{fmt(row.principal)}</td>
                  <td className="p-2 text-end font-mono">{fmt(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </details>
    </Card>
  );
}

function StatBox({ label, value, color = '', highlight = false }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-md ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold text-sm ${color || (highlight ? 'text-primary' : '')}`}>{value}</div>
    </div>
  );
}
