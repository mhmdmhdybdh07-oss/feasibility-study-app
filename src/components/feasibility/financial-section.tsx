'use client';

import { SectionShell } from './section-shell';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldWithCurrency } from './field-with-currency';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, convertFromYER, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { useState } from 'react';

export interface YearRow {
  year: number;
  revenues: number; // YER
  costs: number; // YER
}

export function FinancialSection() {
  const { t, locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);

  return (
    <SectionShell studyKey="financialStudy">
      {({ values, onChange }) => (
        <FinancialForm
          values={values}
          onChange={onChange}
          displayCurrency={displayCurrency}
          locale={locale}
          t={t}
        />
      )}
    </SectionShell>
  );
}

interface FormProps {
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  displayCurrency: CurrencyCode;
  locale: 'ar' | 'en';
  t: (k: any) => string;
}

function FinancialForm({ values, onChange, displayCurrency, locale, t }: FormProps) {
  const cur = CURRENCIES[displayCurrency];
  const [years, setYears] = useState<YearRow[]>(() => {
    if (Array.isArray(values.yearsData) && values.yearsData.length) {
      return values.yearsData;
    }
    return [
      { year: 1, revenues: 0, costs: 0 },
      { year: 2, revenues: 0, costs: 0 },
      { year: 3, revenues: 0, costs: 0 },
      { year: 4, revenues: 0, costs: 0 },
      { year: 5, revenues: 0, costs: 0 },
    ];
  });

  const simpleFields: { key: string; label: string }[] = [
    { key: 'initialInvestment', label: t('finInitialInvestment') },
    { key: 'fixedAssets', label: t('finFixedAssets') },
    { key: 'workingCapital', label: t('finWorkingCapital') },
    { key: 'operatingCosts', label: t('finOperatingCosts') },
    { key: 'loans', label: t('finLoans') },
  ];

  const updateYears = (newYears: YearRow[]) => {
    setYears(newYears);
    onChange('yearsData', newYears);
  };

  const updateYear = (i: number, field: keyof YearRow, value: number) => {
    const next = [...years];
    next[i] = { ...next[i], [field]: value };
    updateYears(next);
  };

  const addYear = () => {
    const lastYear = years[years.length - 1]?.year ?? 0;
    updateYears([...years, { year: lastYear + 1, revenues: 0, costs: 0 }]);
  };

  const removeYear = (i: number) => {
    updateYears(years.filter((_, idx) => idx !== i));
  };

  const totalRevenues = years.reduce((s, y) => s + (Number(y.revenues) || 0), 0);
  const totalCosts = years.reduce((s, y) => s + (Number(y.costs) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Wallet className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('financialStudy')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {locale === 'ar'
              ? `جميع المبالغ معروضة بـ ${cur.nameAr} (${cur.symbol}) ويتم حفظها بالريال اليمني تلقائياً`
              : `All amounts displayed in ${cur.nameEn} (${cur.symbol}) and stored in YER automatically`}
          </p>
        </div>
      </div>

      {/* الحقول الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simpleFields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-sm font-medium">{f.label}</Label>
            <FieldWithCurrency
              value={values[f.key] ?? ''}
              onChange={(v) => onChange(f.key, v)}
              placeholder="0.00"
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{t('finInterestRate')}</Label>
          <Input
            type="number"
            value={values.interestRate ?? ''}
            onChange={(e) => onChange('interestRate', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            step="0.01"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{t('finLoanPeriod')}</Label>
          <Input
            type="number"
            value={values.loanPeriod ?? ''}
            onChange={(e) => onChange('loanPeriod', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      {/* جدول السنوات */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold">{t('finCashFlow')} - {t('yearsAnalysis')}</h3>
          <Button size="sm" variant="outline" onClick={addYear}>
            <Plus className="size-4 me-1" />
            {t('add')}
          </Button>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-2 text-start font-medium">{t('finYear')}</th>
                  <th className="p-2 text-end font-medium">{t('finRevenuesYear')} ({cur.symbol})</th>
                  <th className="p-2 text-end font-medium">{t('finCostsYear')} ({cur.symbol})</th>
                  <th className="p-2 text-end font-medium">{locale === 'ar' ? 'الصافي' : 'Net'} ({cur.symbol})</th>
                  <th className="p-2 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {years.map((y, i) => {
                  const net = (Number(y.revenues) || 0) - (Number(y.costs) || 0);
                  return (
                    <tr key={i} className="border-t hover:bg-accent/30">
                      <td className="p-2 font-medium">{y.year}</td>
                      <td className="p-2">
                        <YearCurrencyInput
                          yerValue={y.revenues}
                          onChange={(v) => updateYear(i, 'revenues', v)}
                        />
                      </td>
                      <td className="p-2">
                        <YearCurrencyInput
                          yerValue={y.costs}
                          onChange={(v) => updateYear(i, 'costs', v)}
                        />
                      </td>
                      <td className={`p-2 text-end font-mono tabular-nums ${net >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {formatCurrency(net, displayCurrency, locale)}
                      </td>
                      <td className="p-1 text-center no-print">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeYear(i)}
                          disabled={years.length <= 1}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-secondary/30 font-semibold">
                <tr>
                  <td className="p-2">{t('total')}</td>
                  <td className="p-2 text-end font-mono tabular-nums text-emerald-600">
                    {formatCurrency(totalRevenues, displayCurrency, locale)}
                  </td>
                  <td className="p-2 text-end font-mono tabular-nums text-destructive">
                    {formatCurrency(totalCosts, displayCurrency, locale)}
                  </td>
                  <td className="p-2 text-end font-mono tabular-nums">
                    {formatCurrency(totalRevenues - totalCosts, displayCurrency, locale)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// حقل إدخال مبالغ للجدول بعملة العرض
function YearCurrencyInput({ yerValue, onChange }: { yerValue: number; onChange: (yer: number) => void }) {
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const cur = CURRENCIES[displayCurrency];
  const displayValue = !yerValue ? '' : (yerValue / cur.rateToYER).toFixed(2);

  return (
    <Input
      type="number"
      value={displayValue}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') {
          onChange(0);
          return;
        }
        const num = Number(v);
        if (!isNaN(num)) onChange(num * cur.rateToYER);
      }}
      className="text-end font-mono tabular-nums h-8"
      placeholder="0.00"
      step="0.01"
    />
  );
}
