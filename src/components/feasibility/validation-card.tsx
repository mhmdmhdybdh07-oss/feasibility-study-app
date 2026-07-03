'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { validateProject } from '@/lib/validation';
import { useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ValidationCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => project ? validateProject(project) : null, [project]);

  if (!project || !result) return null;

  const severityConfig = {
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900' },
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'size-10 rounded-md flex items-center justify-center shrink-0',
            result.isReady ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            {result.isReady
              ? <ShieldCheck className="size-5 text-emerald-600" />
              : <AlertCircle className="size-5 text-red-600" />
            }
          </div>
          <div>
            <h3 className="text-md font-semibold">
              {locale === 'ar' ? 'فحص جودة البيانات' : 'Data Quality Check'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {result.isReady
                ? (locale === 'ar' ? 'البيانات جاهزة ومتناسقة' : 'Data is ready and consistent')
                : (locale === 'ar' ? `يوجد ${result.errorCount} خطأ يجب معالجته` : `${result.errorCount} errors need attention`)
              }
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? (locale === 'ar' ? 'طي' : 'Collapse') : (locale === 'ar' ? 'تفاصيل' : 'Details')}
        </Button>
      </div>

      {/* نسبة الاكتمال */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{locale === 'ar' ? 'نسبة اكتمال البيانات' : 'Data completeness'}</span>
          <span className="text-xs font-bold">{result.completeness}%</span>
        </div>
        <Progress value={result.completeness} className="h-2" />
      </div>

      {/* ملخص الأخطاء */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className={cn('p-2 rounded-md text-center border', severityConfig.error.bg, severityConfig.error.border)}>
          <div className={cn('text-xl font-bold', severityConfig.error.color)}>{result.errorCount}</div>
          <div className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'أخطاء' : 'Errors'}</div>
        </div>
        <div className={cn('p-2 rounded-md text-center border', severityConfig.warning.bg, severityConfig.warning.border)}>
          <div className={cn('text-xl font-bold', severityConfig.warning.color)}>{result.warningCount}</div>
          <div className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'تحذيرات' : 'Warnings'}</div>
        </div>
        <div className={cn('p-2 rounded-md text-center border', severityConfig.info.bg, severityConfig.info.border)}>
          <div className={cn('text-xl font-bold', severityConfig.info.color)}>{result.infoCount}</div>
          <div className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'ملاحظات' : 'Info'}</div>
        </div>
      </div>

      {/* قائمة الأخطاء */}
      {expanded && result.issues.length > 0 && (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pe-1">
          {result.issues.map((issue, i) => {
            const cfg = severityConfig[issue.severity];
            const Icon = cfg.icon;
            return (
              <div key={i} className={cn('p-2 rounded-md flex items-start gap-2 border', cfg.bg, cfg.border)}>
                <Icon className={cn('size-4 shrink-0 mt-0.5', cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs">{locale === 'ar' ? issue.messageAr : issue.messageEn}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="outline" className="text-[9px] h-4">{issue.study}</Badge>
                    <Badge variant="ghost" className="text-[9px] h-4 font-mono">{issue.field}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && result.issues.length === 0 && (
        <div className="text-center py-6">
          <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'لا توجد مشاكل في البيانات' : 'No issues found'}
          </p>
        </div>
      )}
    </Card>
  );
}
