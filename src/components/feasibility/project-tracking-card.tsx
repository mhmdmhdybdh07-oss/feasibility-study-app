'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { Plus, Trash2, Calendar, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Phase {
  id: string;
  name: string;
  start: string; // ISO date
  end: string;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  dependencies?: string[];
}

export function ProjectTrackingCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const phases: Phase[] = (project?.projectPhases as Phase[]) ?? [];
  const [showAdd, setShowAdd] = useState(false);
  const [newPhase, setNewPhase] = useState<Omit<Phase, 'id'>>({
    name: '', start: '', end: '', progress: 0, status: 'not-started',
  });

  const handleAdd = () => {
    if (!newPhase.name.trim() || !currentProjectId) return;
    const status = computeStatus(newPhase.start, newPhase.end, newPhase.progress);
    const phase: Phase = { ...newPhase, status, id: Date.now().toString() };
    updateProject.mutate({ id: currentProjectId, data: { projectPhases: [...phases, phase] } });
    setNewPhase({ name: '', start: '', end: '', progress: 0, status: 'not-started' });
    setShowAdd(false);
  };

  const handleUpdate = (id: string, updates: Partial<Phase>) => {
    if (!currentProjectId) return;
    const updated = phases.map((p) => {
      if (p.id === id) {
        const merged = { ...p, ...updates };
        merged.status = computeStatus(merged.start, merged.end, merged.progress);
        return merged;
      }
      return p;
    });
    updateProject.mutate({ id: currentProjectId, data: { projectPhases: updated } });
  };

  const handleDelete = (id: string) => {
    if (!currentProjectId) return;
    updateProject.mutate({ id: currentProjectId, data: { projectPhases: phases.filter((p) => p.id !== id) } });
  };

  const computeStatus = (start: string, end: string, progress: number): Phase['status'] => {
    if (progress >= 100) return 'completed';
    const now = new Date();
    const startD = start ? new Date(start) : null;
    const endD = end ? new Date(end) : null;
    if (endD && now > endD && progress < 100) return 'delayed';
    if (startD && now < startD) return 'not-started';
    if (progress > 0 || (startD && now >= startD)) return 'in-progress';
    return 'not-started';
  };

  const overallProgress = phases.length
    ? Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length)
    : 0;

  // حساب نطاق Gantt
  const allDates = phases.flatMap((p) => [p.start, p.end].filter(Boolean).map((d) => new Date(d).getTime()));
  const minDate = allDates.length ? Math.min(...allDates) : Date.now();
  const maxDate = allDates.length ? Math.max(...allDates) : Date.now() + 30 * 86400000;
  const totalRange = Math.max(maxDate - minDate, 86400000);

  const statusColor: Record<string, string> = {
    'not-started': 'bg-muted text-muted-foreground',
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'completed': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    'delayed': 'bg-red-500/20 text-red-700 dark:text-red-300',
  };

  if (!currentProjectId) return null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
            <GitBranch className="size-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-md font-semibold">{t('projectTracking')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'ar' ? 'مراحل التنفيذ + مخطط Gantt' : 'Execution Phases + Gantt Chart'}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="size-4 me-1" />
          {t('phaseAdd')}
        </Button>
      </div>

      {/* التقدم الكلي */}
      <div className="mb-4 p-3 rounded-md bg-secondary/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{t('overallProgress')}</span>
          <span className="text-sm font-bold">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* نموذج إضافة */}
      {showAdd && (
        <div className="p-3 rounded-md border bg-secondary/30 space-y-2 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('phaseName')}</Label>
              <Input
                value={newPhase.name}
                onChange={(e) => setNewPhase((p) => ({ ...p, name: e.target.value }))}
                placeholder={locale === 'ar' ? 'مثال: الترخيص' : 'e.g. Licensing'}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('phaseProgress')} %</Label>
              <Input
                type="number" min={0} max={100} value={newPhase.progress}
                onChange={(e) => setNewPhase((p) => ({ ...p, progress: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('phaseStart')}</Label>
              <Input
                type="date" value={newPhase.start}
                onChange={(e) => setNewPhase((p) => ({ ...p, start: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('phaseEnd')}</Label>
              <Input
                type="date" value={newPhase.end}
                onChange={(e) => setNewPhase((p) => ({ ...p, end: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
            <Button size="sm" onClick={handleAdd}>{t('save')}</Button>
          </div>
        </div>
      )}

      {/* مخطط Gantt */}
      {phases.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Calendar className="size-4 text-cyan-600" />
            {t('ganttChart')}
          </h4>
          <div className="min-w-[500px] space-y-1.5">
            {/* خط الزمن */}
            <div className="flex text-[10px] text-muted-foreground border-b pb-1 mb-1">
              <div className="w-32 shrink-0"></div>
              <div className="flex-1 flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => {
                  const date = new Date(minDate + (i / 5) * totalRange);
                  return <span key={i}>{date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', { month: 'short', year: '2-digit' })}</span>;
                })}
              </div>
            </div>
            {/* صفوف المراحل */}
            {phases.map((p) => {
              const start = p.start ? new Date(p.start).getTime() : minDate;
              const end = p.end ? new Date(p.end).getTime() : start + 86400000;
              const leftPct = ((start - minDate) / totalRange) * 100;
              const widthPct = Math.max(((end - start) / totalRange) * 100, 2);
              return (
                <div key={p.id} className="flex items-center gap-2 group">
                  <div className="w-32 shrink-0 text-xs truncate" title={p.name}>{p.name}</div>
                  <div className="flex-1 relative h-6 bg-secondary/30 rounded">
                    <div
                      className={cn('absolute h-6 rounded flex items-center px-1.5 text-[10px] text-white font-medium',
                        p.status === 'completed' ? 'bg-emerald-500' :
                        p.status === 'delayed' ? 'bg-red-500' :
                        p.status === 'in-progress' ? 'bg-blue-500' : 'bg-muted-foreground'
                      )}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      {p.progress > 0 && `${p.progress}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* قائمة المراحل */}
      <div className="space-y-2">
        {phases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <GitBranch className="size-8 mx-auto mb-2 opacity-50" />
            {locale === 'ar' ? 'لا توجد مراحل بعد' : 'No phases yet'}
          </div>
        ) : (
          phases.map((p) => (
            <div key={p.id} className="p-3 rounded-md border bg-background/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{p.start || '—'}</span>
                    <span>←</span>
                    <span>{p.end || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={cn('text-[10px]', statusColor[p.status])}>
                    {t(`phase${p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('-', '')}` as any)}
                  </Badge>
                  <Button size="sm" variant="ghost" className="size-7 p-0 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="h-1.5 flex-1" />
                <Input
                  type="number" min={0} max={100} value={p.progress}
                  onChange={(e) => handleUpdate(p.id, { progress: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                  className="w-16 h-6 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
