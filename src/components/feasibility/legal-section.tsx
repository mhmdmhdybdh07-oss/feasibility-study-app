'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { Scale } from 'lucide-react';

export function LegalSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'legalForm', label: t('legalForm'), type: 'text', half: true, placeholder: t('legalForm') },
    { key: 'complianceStatus', label: t('legalComplianceStatus'), type: 'text', half: true },
    { key: 'licenses', label: t('legalLicenses'), type: 'textarea' },
    { key: 'regulations', label: t('legalRegulations'), type: 'textarea' },
    { key: 'contracts', label: t('legalContracts'), type: 'textarea' },
    { key: 'intellectualProperty', label: t('legalIntellectualProperty'), type: 'textarea' },
    { key: 'taxObligations', label: t('legalTaxObligations'), type: 'textarea' },
    { key: 'insurance', label: t('legalInsurance'), type: 'textarea' },
    { key: 'governmentApprovals', label: t('legalGovernmentApprovals'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="legalStudy">
      {({ values, onChange }) => (
        <FormSection
          title={t('legalStudy')}
          description={t('appSubtitle')}
          icon={<Scale className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
