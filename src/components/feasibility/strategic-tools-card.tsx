'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Target, Swords, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwotItem {
  id: string;
  text: string;
}

interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

interface PorterData {
  supplier: number; // 1-5
  buyer: number;
  newEntrants: number;
  substitutes: number;
  rivalry: number;
  notes: Record<string, string>;
}

const SWOT_SECTIONS = [
  { key: 'strengths' as const, color: 'bg-emerald-500/10 border-emerald-500/30', icon: TrendingUp, iconColor: 'text-emerald-600' },
  { key: 'weaknesses' as const, color: 'bg-red-500/10 border-red-500/30', icon: TrendingDown, iconColor: 'text-red-600' },
  { key: 'opportunities' as const, color: 'bg-blue-500/10 border-blue-500/30', icon: Lightbulb, iconColor: 'text-blue-600' },
  { key: 'threats' as const, color: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, iconColor: 'text-amber-600' },
];

export function StrategicToolsCard() {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const swotData = (project?.swotAnalysis as SwotData) ?? { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const porterData = (project?.porterAnalysis as PorterData) ?? {
    supplier: 3, buyer: 3, newEntrants: 3, substitutes: 3, rivalry: 3, notes: {},
  };

  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'swot' | 'porter'>('swot');

  const handleAddItem = (section: keyof SwotData) => {
    const text = newItems[section]?.trim();
    if (!text || !currentProjectId) return;
    const updated: SwotData = {
      ...swotData,
      [section]: [...swotData[section], { id: Date.now().toString(), text }],
    };
    updateProject.mutate({ id: currentProjectId, data: { swotAnalysis: updated } });
    setNewItems((prev) => ({ ...prev, [section]: '' }));
  };

  const handleRemoveItem = (section: keyof SwotData, id: string) => {
    if (!currentProjectId) return;
    const updated: SwotData = {
      ...swotData,
      [section]: swotData[section].filter((i) => i.id !== id),
    };
    updateProject.mutate({ id: currentProjectId, data: { swotAnalysis: updated } });
  };

  const handlePorterChange = (key: keyof PorterData, value: number) => {
    if (!currentProjectId) return;
    const updated = { ...porterData, [key]: value };
    updateProject.mutate({ id: currentProjectId, data: { porterAnalysis: updated } });
  };

  const handlePorterNote = (key: string, value: string) => {
    if (!currentProjectId) return;
    const updated = {
      ...porterData,
      notes: { ...porterData.notes, [key]: value },
    };
    updateProject.mutate({ id: currentProjectId, data: { porterAnalysis: updated } });
  };

  const porterForces: Array<{ key: keyof PorterData; label: string; description: string }> = [
    { key: 'rivalry', label: t('porterRivalry'), description: locale === 'ar' ? 'شدة المنافسة في السوق' : 'Intensity of market competition' },
    { key: 'newEntrants', label: t('porterNewEntrants'), description: locale === 'ar' ? 'سهولة دخول منافسين جدد' : 'Ease of new competitors entering' },
    { key: 'substitutes', label: t('porterSubstitutes'), description: locale === 'ar' ? 'توفر منتجات بديلة' : 'Availability of substitute products' },
    { key: 'supplier', label: t('porterSupplier'), description: locale === 'ar' ? 'قدرة الموردين على رفع الأسعار' : 'Suppliers ability to raise prices' },
    { key: 'buyer', label: t('porterBuyer'), description: locale === 'ar' ? 'قدرة المشترين على خفض الأسعار' : 'Buyers ability to lower prices' },
  ];

  if (!currentProjectId) return null;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Target className="size-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-md font-semibold">{t('strategicTools')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'ar' ? 'SWOT وقوى بورتر الخمس للتحليل الاستراتيجي' : 'SWOT and Porter\'s Five Forces for strategic analysis'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant={activeTab === 'swot' ? 'default' : 'outline'} onClick={() => setActiveTab('swot')}>
            {t('swotAnalysis')}
          </Button>
          <Button size="sm" variant={activeTab === 'porter' ? 'default' : 'outline'} onClick={() => setActiveTab('porter')}>
            {t('porterFive')}
          </Button>
        </div>
      </div>

      {activeTab === 'swot' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SWOT_SECTIONS.map((s) => {
            const Icon = s.icon;
            const items = swotData[s.key] ?? [];
            return (
              <div key={s.key} className={cn('p-3 rounded-md border', s.color)}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${s.iconColor}`} />
                  <h4 className="font-semibold text-sm">{t(`swot${s.key.charAt(0).toUpperCase() + s.key.slice(1)}` as any)}</h4>
                  <Badge variant="secondary" className="ms-auto text-[10px]">{items.length}</Badge>
                </div>
                <div className="space-y-1.5 mb-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-xs bg-background/50 p-2 rounded">
                      <span className="flex-1">{item.text}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-5 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(s.key, item.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                  {!items.length && (
                    <div className="text-[11px] text-muted-foreground italic py-2 text-center">
                      {locale === 'ar' ? 'لا توجد عناصر بعد' : 'No items yet'}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Input
                    value={newItems[s.key] ?? ''}
                    onChange={(e) => setNewItems((prev) => ({ ...prev, [s.key]: e.target.value }))}
                    placeholder={t('swotAddItem')}
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(s.key)}
                  />
                  <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => handleAddItem(s.key)}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {porterForces.map((f) => {
              const value = porterData[f.key] ?? 3;
              const color = value >= 4 ? 'text-red-600' : value >= 3 ? 'text-amber-600' : 'text-emerald-600';
              return (
                <div key={f.key} className="p-3 rounded-md border bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{f.label}</div>
                    <Badge variant={value >= 4 ? 'destructive' : value >= 3 ? 'secondary' : 'default'}>
                      {value >= 4 ? t('porterHigh') : value >= 3 ? t('porterMedium') : t('porterLow')}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mb-2">{f.description}</div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(e) => handlePorterChange(f.key, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>{t('porterLow')}</span>
                    <span>{t('porterHigh')}</span>
                  </div>
                  <Textarea
                    value={porterData.notes?.[f.key] ?? ''}
                    onChange={(e) => handlePorterNote(f.key, e.target.value)}
                    placeholder={locale === 'ar' ? 'ملاحظات...' : 'Notes...'}
                    rows={2}
                    className="text-xs mt-2"
                  />
                </div>
              );
            })}
          </div>
          <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
            <div className="text-xs font-medium mb-1">
              {locale === 'ar' ? 'الخلاصة الاستراتيجية' : 'Strategic Summary'}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'ar'
                ? `متوسط قوة التنافس: ${((porterData.rivalry + porterData.newEntrants + porterData.substitutes + porterData.supplier + porterData.buyer) / 5).toFixed(1)}/5 — ${((porterData.rivalry + porterData.newEntrants + porterData.substitutes + porterData.supplier + porterData.buyer) / 5) >= 3.5 ? 'بيئة تنافسية قوية تتطلب استراتيجية دفاعية' : 'بيئة تنافسية معتدلة'}`
                : `Average competitive force: ${((porterData.rivalry + porterData.newEntrants + porterData.substitutes + porterData.supplier + porterData.buyer) / 5).toFixed(1)}/5`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
