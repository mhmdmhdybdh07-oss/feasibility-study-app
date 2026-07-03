'use client';

import { SectionShell } from './section-shell';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FieldWithCurrency } from './field-with-currency';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currencies';
import type { ProjectFull } from '@/hooks/use-projects';

export function EconomicSection() {
  const { t, locale } = useTranslation();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const currentProjectId = useAppStore((s) => s.currentProjectId);

  return (
    <SectionShell studyKey="economicStudy">
      {({ values, onChange }) => (
        <EconomicForm
          values={values}
          onChange={onChange}
          displayCurrency={displayCurrency}
          locale={locale}
          t={t}
          projectId={currentProjectId}
        />
      )}
    </SectionShell>
  );
}

interface FormProps {
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  displayCurrency: any;
  locale: 'ar' | 'en';
  t: (k: any) => string;
  projectId: string | null;
}

function EconomicForm({ values, onChange, displayCurrency, locale, t, projectId }: FormProps) {
  // سيتم حساب المؤشرات من بيانات القسم المالي تلقائياً في صفحة النتائج
  const fields = [
    { key: 'discountRate', label: t('ecoDiscountRate'), type: 'number' as const, unit: '%' },
    { key: 'riskAnalysis', label: t('ecoRiskAnalysis'), type: 'textarea' as const },
    { key: 'sensitivity', label: t('ecoSensitivity'), type: 'textarea' as const },
    { key: 'economicImpact', label: t('ecoEconomicImpact'), type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <TrendingUp className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('economicStudy')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {locale === 'ar'
              ? 'تُحسب المؤشرات المالية (NPV/IRR/فترة الاسترداد/ROI) تلقائياً من بيانات الدراسة المالية'
              : 'Financial indicators (NPV/IRR/Payback/ROI) are calculated automatically from financial study data'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={`space-y-1.5 ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}>
            <Label className="text-sm font-medium">
              {f.label}
              {f.unit && <span className="text-muted-foreground text-xs me-1">({f.unit})</span>}
            </Label>
            {f.type === 'textarea' ? (
              <textarea
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              />
            ) : (
              <Input
                type="number"
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value === '' ? '' : Number(e.target.value))}
                step="0.01"
                placeholder="0.00"
              />
            )}
          </div>
        ))}
      </div>

      <Card className="p-4 bg-secondary/30">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {locale === 'ar'
            ? '💡 المؤشرات الاقتصادية التفصيلية (NPV, IRR, Payback Period, ROI, Profitability Index) تُعرض في صفحة "النتائج والتقارير" بناءً على بيانات التدفق النقدي المُدخلة في الدراسة المالية.'
            : '💡 Detailed economic indicators (NPV, IRR, Payback Period, ROI, Profitability Index) are displayed in the "Results & Reports" page based on the cash flow data entered in the financial study.'}
        </p>
      </Card>
    </div>
  );
}
