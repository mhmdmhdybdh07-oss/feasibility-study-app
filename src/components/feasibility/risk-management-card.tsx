'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { Plus, Trash2, ShieldAlert, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskItem {
  id: string;
  name: string;
  category: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
  status: 'open' | 'mitigated' | 'closed';
}

const RISK_CATEGORIES = [
  { ar: 'مالي', en: 'Financial' },
  { ar: 'تشغيلي', en: 'Operational' },
  { ar: 'سوقي', en: 'Market' },
  { ar: 'قانوني', en: 'Legal' },
  { ar: 'تقني', en: 'Technical' },
  { ar: 'بيئي', en: 'Environmental' },
  { ar: 'استراتيجي', en: 'Strategic' },
];

export function RiskManagementCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const risks: RiskItem[] = (project?.riskRegister as RiskItem[]) ?? [];
  const [showAdd, setShowAdd] = useState(false);
  const [newRisk, setNewRisk] = useState<Omit<RiskItem, 'id'>>({
    name: '', category: 'مالي', probability: 3, impact: 3, mitigation: '', status: 'open',
  });

  const handleAdd = () => {
    if (!newRisk.name.trim() || !currentProjectId) return;
    const item: RiskItem = { ...newRisk, id: Date.now().toString() };
    updateProject.mutate({ id: currentProjectId, data: { riskRegister: [...risks, item] } });
    setNewRisk({ name: '', category: 'مالي', probability: 3, impact: 3, mitigation: '', status: 'open' });
    setShowAdd(false);
  };

  const handleUpdate = (id: string, updates: Partial<RiskItem>) => {
    if (!currentProjectId) return;
    const updated = risks.map((r) => (r.id === id ? { ...r, ...updates } : r));
    updateProject.mutate({ id: currentProjectId, data: { riskRegister: updated } });
  };

  const handleDelete = (id: string) => {
    if (!currentProjectId) return;
    updateProject.mutate({ id: currentProjectId, data: { riskRegister: risks.filter((r) => r.id !== id) } });
  };

  const severity = (p: number, i: number) => p * i;
  const severityColor = (s: number) => {
    if (s >= 16) return 'bg-red-600 text-white';
    if (s >= 9) return 'bg-orange-500 text-white';
    if (s >= 4) return 'bg-amber-400 text-white';
    return 'bg-emerald-400 text-white';
  };

  const statusColor: Record<string, string> = {
    open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    mitigated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  if (!currentProjectId) return null;

  // مصفوفة المخاطر 5x5
  const matrix = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => {
      const p = i + 1; // probability
      const im = j + 1; // impact
      const count = risks.filter((r) => r.probability === p && r.impact === im).length;
      return { p, im, count, severity: severity(p, im) };
    })
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="size-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-md font-semibold">{t('riskManagement')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'ar' ? 'سجل المخاطر + مصفوفة + خريطة حرارية' : 'Risk Register + Matrix + Heatmap'}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="size-4 me-1" />
          {t('riskAdd')}
        </Button>
      </div>

      {/* نموذج إضافة */}
      {showAdd && (
        <div className="p-3 rounded-md border bg-secondary/30 space-y-2 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('riskName')}</Label>
              <Input
                value={newRisk.name}
                onChange={(e) => setNewRisk((p) => ({ ...p, name: e.target.value }))}
                placeholder={locale === 'ar' ? 'وصف الخطر...' : 'Risk description...'}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('riskCategory')}</Label>
              <Select value={newRisk.category} onValueChange={(v) => setNewRisk((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((c) => (
                    <SelectItem key={c.en} value={locale === 'ar' ? c.ar : c.en}>
                      {locale === 'ar' ? c.ar : c.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('riskProbability')} (1-5)</Label>
              <input
                type="range" min={1} max={5} value={newRisk.probability}
                onChange={(e) => setNewRisk((p) => ({ ...p, probability: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
              <div className="text-xs text-center text-muted-foreground">{newRisk.probability}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('riskImpact')} (1-5)</Label>
              <input
                type="range" min={1} max={5} value={newRisk.impact}
                onChange={(e) => setNewRisk((p) => ({ ...p, impact: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
              <div className="text-xs text-center text-muted-foreground">{newRisk.impact}</div>
            </div>
          </div>
          <Textarea
            value={newRisk.mitigation}
            onChange={(e) => setNewRisk((p) => ({ ...p, mitigation: e.target.value }))}
            placeholder={t('riskMitigation')}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
            <Button size="sm" onClick={handleAdd}>{t('save')}</Button>
          </div>
        </div>
      )}

      {/* مصفوفة حرارية */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Flame className="size-4 text-orange-500" />
          {t('riskHeatmap')}
        </h4>
        <div className="overflow-x-auto">
          <table className="text-xs border-separate" style={{ borderSpacing: '2px' }}>
            <thead>
              <tr>
                <th className="p-1"></th>
                <th colSpan={5} className="text-center font-medium p-1">{t('riskImpact')} →</th>
              </tr>
              <tr>
                <th className="p-1 text-muted-foreground text-[10px]">{t('riskProbability')} ↓</th>
                {[1, 2, 3, 4, 5].map((im) => (
                  <th key={im} className="p-1 text-[10px] font-medium w-12">{im}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[5, 4, 3, 2, 1].map((p) => (
                <tr key={p}>
                  <th className="p-1 text-[10px] font-medium text-center">{p}</th>
                  {[1, 2, 3, 4, 5].map((im) => {
                    const cell = matrix[p - 1][im - 1];
                    return (
                      <td
                        key={im}
                        className={cn('p-2 text-center font-mono text-xs cursor-default', severityColor(cell.severity))}
                        title={`${cell.count} ${locale === 'ar' ? 'مخاطر' : 'risks'}`}
                      >
                        {cell.count > 0 ? cell.count : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="size-3 bg-emerald-400"></span>{locale === 'ar' ? 'منخفض (1-3)' : 'Low (1-3)'}</span>
          <span className="flex items-center gap-1"><span className="size-3 bg-amber-400"></span>{locale === 'ar' ? 'متوسط (4-9)' : 'Medium (4-9)'}</span>
          <span className="flex items-center gap-1"><span className="size-3 bg-orange-500"></span>{locale === 'ar' ? 'عالي (10-15)' : 'High (10-15)'}</span>
          <span className="flex items-center gap-1"><span className="size-3 bg-red-600"></span>{locale === 'ar' ? 'حرج (16+)' : 'Critical (16+)'}</span>
        </div>
      </div>

      {/* سجل المخاطر */}
      <div className="space-y-2">
        {risks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <ShieldAlert className="size-8 mx-auto mb-2 opacity-50" />
            {locale === 'ar' ? 'لا توجد مخاطر مسجلة بعد' : 'No risks registered yet'}
          </div>
        ) : (
          risks.map((r) => (
            <div key={r.id} className="p-3 rounded-md border bg-background/50">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                    <Badge className={cn('text-[10px]', statusColor[r.status])}>
                      {t(`risk${r.status.charAt(0).toUpperCase() + r.status.slice(1)}` as any)}
                    </Badge>
                    <Badge className={cn('text-[10px]', severityColor(severity(r.probability, r.impact)))}>
                      {t('riskSeverity')}: {severity(r.probability, r.impact)}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm mt-1">{r.name}</div>
                  {r.mitigation && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{t('riskMitigation')}:</span> {r.mitigation}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Select value={r.status} onValueChange={(v) => handleUpdate(r.id, { status: v as RiskItem['status'] })}>
                    <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{t('riskOpen')}</SelectItem>
                      <SelectItem value="mitigated">{t('riskMitigated')}</SelectItem>
                      <SelectItem value="closed">{t('riskClosed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="size-7 p-0 text-destructive" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
