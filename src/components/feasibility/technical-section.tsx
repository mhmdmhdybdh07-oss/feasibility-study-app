'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { Wrench } from 'lucide-react';

export function TechnicalSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'productionCapacity', label: t('techProductionCapacity'), type: 'text', half: true, unit: 'unit/year' },
    { key: 'productionVolume', label: t('techProductionVolume'), type: 'number', half: true, unit: 'unit/year' },
    { key: 'productionCost', label: t('techProductionCost'), type: 'currency', half: true },
    { key: 'laborRequired', label: t('techLaborRequired'), type: 'number', half: true, unit: 'persons' },
    { key: 'location', label: t('techLocation'), type: 'text', half: true },
    { key: 'utilities', label: t('techUtilities'), type: 'text', half: true },
    { key: 'productionProcess', label: t('techProductionProcess'), type: 'textarea' },
    { key: 'rawMaterials', label: t('techRawMaterials'), type: 'textarea' },
    { key: 'equipment', label: t('techEquipment'), type: 'textarea' },
    { key: 'machinery', label: t('techMachinery'), type: 'textarea' },
    { key: 'qualityControl', label: t('techQualityControl'), type: 'textarea' },
    { key: 'maintenance', label: t('techMaintenance'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="technicalStudy">
      {({ values, onChange }) => (
        <FormSection
          title={t('technicalStudy')}
          description={t('appSubtitle')}
          icon={<Wrench className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
