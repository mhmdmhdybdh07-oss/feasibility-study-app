'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';

interface SectionShellProps {
  studyKey: 'establishment' | 'socialStudy' | 'environmentalStudy' | 'legalStudy' | 'marketStudy' | 'technicalStudy' | 'financialStudy' | 'economicStudy';
  children: (props: { values: Record<string, any>; onChange: (key: string, value: any) => void }) => React.ReactNode;
}

export function SectionShell({ studyKey, children }: SectionShellProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project, isPending } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const [localOverrides, setLocalOverrides] = useState<Record<string, any> | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  // ادمج القيم المخزنة من المشروع مع التجاوزات المحلية
  const storedData = (project as any)?.[studyKey];
  const values: Record<string, any> = {
    ...(storedData && typeof storedData === 'object' ? storedData : {}),
    ...(localOverrides ?? {}),
  };

  const handleChange = useCallback(
    (key: string, value: any) => {
      setLocalOverrides((prev) => {
        const next = { ...(prev ?? {}), [key]: value };
        return next;
      });
      // حفظ تلقائي بعد تأخير قصير
      if (currentProjectId) {
        const merged = { ...values, [key]: value };
        setTimeout(() => {
          updateProject.mutate({ id: currentProjectId, data: { [studyKey]: merged } });
          setSavedTick(true);
          setTimeout(() => setSavedTick(false), 2000);
        }, 600);
      }
    },
    [currentProjectId, studyKey, updateProject, values]
  );

  const handleManualSave = () => {
    if (!currentProjectId) return;
    updateProject.mutate(
      { id: currentProjectId, data: { [studyKey]: values } },
      {
        onSuccess: () => {
          toast({ title: t('savedSuccess') });
          setSavedTick(true);
          setTimeout(() => setSavedTick(false), 2000);
        },
        onError: () => toast({ title: t('saveFailed'), variant: 'destructive' }),
      }
    );
  };

  if (!currentProjectId) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('selectProjectFirst')}</p>
      </Card>
    );
  }

  if (isPending || !project) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        {savedTick && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            {t('savedSuccess')}
          </span>
        )}
        <Button size="sm" onClick={handleManualSave} disabled={updateProject.isPending}>
          {updateProject.isPending ? <Loader2 className="size-4 me-1 animate-spin" /> : <Save className="size-4 me-1" />}
          {t('save')}
        </Button>
      </div>
      <Card className="p-6">
        {children({ values, onChange: handleChange })}
      </Card>
    </div>
  );
}
