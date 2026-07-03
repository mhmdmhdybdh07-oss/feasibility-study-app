'use client';

import { SectionShell } from './section-shell';
import { FormSection, type FieldDef } from './form-section';
import { useTranslation } from '@/hooks/use-translation';
import { FileText } from 'lucide-react';

export function EstablishmentSection() {
  const { t } = useTranslation();

  const fields: FieldDef[] = [
    { key: 'projectName', label: t('projectName'), type: 'text', required: true },
    { key: 'projectType', label: t('projectType'), type: 'text', placeholder: t('projectType') },
    { key: 'projectSector', label: t('projectSector'), type: 'text' },
    { key: 'projectLocation', label: t('projectLocation'), type: 'text' },
    { key: 'projectOwner', label: t('projectOwner'), type: 'text' },
    { key: 'projectCapital', label: t('projectCapital'), type: 'currency', required: true },
    { key: 'projectDuration', label: t('projectDuration'), type: 'number', unit: t('projectDuration').match(/\((.*?)\)/)?.[1] || '' },
    { key: 'projectStartDate', label: t('projectStartDate'), type: 'date' },
    { key: 'projectDescription', label: t('projectDescription'), type: 'textarea' },
    { key: 'projectGoals', label: t('projectGoals'), type: 'textarea' },
    { key: 'projectJustification', label: t('projectJustification'), type: 'textarea' },
  ];

  return (
    <SectionShell studyKey="establishment">
      {({ values, onChange }) => (
        <FormSection
          title={t('establishment')}
          description={t('appSubtitle')}
          icon={<FileText className="size-5 text-primary" />}
          fields={fields}
          values={values}
          onChange={onChange}
        />
      )}
    </SectionShell>
  );
}
