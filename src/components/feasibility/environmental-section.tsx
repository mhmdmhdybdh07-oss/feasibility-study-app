'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { Leaf } from 'lucide-react';

export function EnvironmentalSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'airEmissions', label: t('envAirEmissions'), type: 'textarea' },
    { key: 'waterUsage', label: t('envWaterUsage'), type: 'text', unit: 'm³/year', half: true },
    { key: 'energyConsumption', label: t('envEnergyConsumption'), type: 'text', unit: 'kWh/year', half: true },
    { key: 'noiseLevel', label: t('envNoiseLevel'), type: 'text', unit: 'dB', half: true },
    { key: 'wasteManagement', label: t('envWasteManagement'), type: 'textarea' },
    { key: 'mitigationMeasures', label: t('envMitigationMeasures'), type: 'textarea' },
    { key: 'greenMeasures', label: t('envGreenMeasures'), type: 'textarea' },
    { key: 'impactAssessment', label: t('envImpactAssessment'), type: 'textarea' },
    { key: 'compliance', label: t('envCompliance'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="environmentalStudy">
      {({ values, onChange }) => (
        <FormSection
          title={t('environmentalStudy')}
          description={t('appSubtitle')}
          icon={<Leaf className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
