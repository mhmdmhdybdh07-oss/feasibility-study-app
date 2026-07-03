'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { Users } from 'lucide-react';

export function SocialSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'jobsCreated', label: t('socialJobsCreated'), type: 'number', half: true },
    { key: 'indirectJobs', label: t('socialIndirectJobs'), type: 'number', half: true },
    { key: 'localEmployment', label: t('socialLocalEmployment'), type: 'number', unit: '%', half: true },
    { key: 'genderRatio', label: t('socialGenderRatio'), type: 'number', unit: '%', half: true },
    { key: 'foreignWorkers', label: t('socialForeignWorkers'), type: 'number', half: true },
    { key: 'annualWages', label: t('socialWages'), type: 'currency', half: true },
    { key: 'trainingPrograms', label: t('socialTraining'), type: 'textarea' },
    { key: 'communityImpact', label: t('socialCommunityImpact'), type: 'textarea' },
    { key: 'developmentImpact', label: t('socialDevelopmentImpact'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="socialStudy">
      {({ values, onChange }) => (
        <FormSection
          title={t('socialStudy')}
          description={t('appSubtitle')}
          icon={<Users className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
