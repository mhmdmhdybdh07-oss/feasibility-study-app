'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import {
  LayoutDashboard, FileText, Users, Leaf, Scale, ShoppingBag,
  Wrench, Wallet, TrendingUp, BarChart3, Sparkles, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { key: 'dashboard', icon: LayoutDashboard, ar: 'الرئيسية', en: 'Dashboard', color: 'bg-blue-500/10 text-blue-600', needsProject: false },
  { key: 'samples', icon: Sparkles, ar: 'مشاريع نموذجية', en: 'Samples', color: 'bg-purple-500/10 text-purple-600', needsProject: false },
  { key: 'establishment', icon: FileText, ar: 'تأسيس المشروع', en: 'Establishment', color: 'bg-teal-500/10 text-teal-600', needsProject: true },
  { key: 'socialStudy', icon: Users, ar: 'الدراسة الاجتماعية', en: 'Social', color: 'bg-cyan-500/10 text-cyan-600', needsProject: true },
  { key: 'environmentalStudy', icon: Leaf, ar: 'الدراسة البيئية', en: 'Environmental', color: 'bg-green-500/10 text-green-600', needsProject: true },
  { key: 'legalStudy', icon: Scale, ar: 'الدراسة القانونية', en: 'Legal', color: 'bg-amber-500/10 text-amber-600', needsProject: true },
  { key: 'marketStudy', icon: ShoppingBag, ar: 'الدراسة التسويقية', en: 'Market', color: 'bg-orange-500/10 text-orange-600', needsProject: true },
  { key: 'technicalStudy', icon: Wrench, ar: 'الدراسة الفنية', en: 'Technical', color: 'bg-rose-500/10 text-rose-600', needsProject: true },
  { key: 'financialStudy', icon: Wallet, ar: 'الدراسة المالية', en: 'Financial', color: 'bg-indigo-500/10 text-indigo-600', needsProject: true },
  { key: 'economicStudy', icon: TrendingUp, ar: 'الدراسة الاقتصادية', en: 'Economic', color: 'bg-violet-500/10 text-violet-600', needsProject: true },
  { key: 'results', icon: BarChart3, ar: 'النتائج والتقارير', en: 'Results', color: 'bg-emerald-500/10 text-emerald-600', needsProject: true },
];

export function StudyNavigatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const handleNavigate = (key: string, needsProject: boolean) => {
    if (needsProject && !currentProjectId) return;
    setActiveSection(key);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{locale === 'ar' ? 'التنقل بين الأقسام' : 'Study Navigator'}</DialogTitle>
          <DialogDescription>
            {locale === 'ar' ? 'اختر القسم للانتقال السريع' : 'Select a section to navigate'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            const disabled = s.needsProject && !currentProjectId;
            return (
              <Card
                key={s.key}
                className={cn(
                  'p-3 cursor-pointer transition-all flex items-center gap-2',
                  isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50',
                  disabled && 'opacity-40 cursor-not-allowed'
                )}
                onClick={() => !disabled && handleNavigate(s.key, s.needsProject)}
              >
                <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', s.color)}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs">{locale === 'ar' ? s.ar : s.en}</div>
                  {isActive && <div className="text-[10px] text-primary">{locale === 'ar' ? 'نشط' : 'Active'}</div>}
                </div>
                {disabled ? (
                  <span className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'مطلوب مشروع' : 'Need project'}</span>
                ) : (
                  <ArrowRight className="size-3 text-muted-foreground rotate-180 rtl:rotate-0" />
                )}
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
