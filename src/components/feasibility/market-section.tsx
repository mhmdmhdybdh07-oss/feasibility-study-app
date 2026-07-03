'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { ShoppingBag } from 'lucide-react';

export function MarketSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'targetCustomers', label: t('marketTargetCustomers'), type: 'textarea' },
    { key: 'marketSize', label: t('marketSize'), type: 'currency', half: true },
    { key: 'expectedShare', label: t('marketShare'), type: 'number', unit: '%', half: true },
    { key: 'growthRate', label: t('marketGrowthRate'), type: 'number', unit: '%', half: true },
    { key: 'productPrice', label: t('marketProductPrice'), type: 'currency', half: true },
    { key: 'competitors', label: t('marketCompetitors'), type: 'textarea' },
    { key: 'competitiveAdvantage', label: t('marketCompetitiveAdvantage'), type: 'textarea' },
    { key: 'segments', label: t('marketSegments'), type: 'textarea' },
    { key: 'pricingStrategy', label: t('marketPricingStrategy'), type: 'textarea' },
    { key: 'distribution', label: t('marketDistribution'), type: 'textarea' },
    { key: 'promotion', label: t('marketPromotion'), type: 'textarea' },
    { key: 'demandForecast', label: t('marketDemandForecast'), type: 'textarea' },
    { key: 'swot', label: t('marketSWOT'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="marketStudy">
      {({ values, onChange }) => (
        <FormSection
          title={t('marketStudy')}
          description={t('appSubtitle')}
          icon={<ShoppingBag className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
