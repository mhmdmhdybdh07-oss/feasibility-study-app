'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';
import {
  Info, MapPin, Calendar, User, DollarSign, TrendingUp, TrendingDown,
  FileText, Users, Leaf, Scale, ShoppingBag, Wrench, Wallet, BarChart3,
  CheckCircle2, AlertCircle, Clock, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectInfoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);

  if (!project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'معلومات المشروع' : 'Project Info'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center py-8">{t('selectProjectFirst')}</p>
        </DialogContent>
      </Dialog>
    );
  }

  const est = (project.establishment as any) ?? {};
  const fin = (project.financialStudy as any) ?? {};
  const eco = (project.economicStudy as any) ?? {};
  const social = (project.socialStudy as any) ?? {};
  const tech = (project.technicalStudy as any) ?? {};
  const market = (project.marketStudy as any) ?? {};
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];

  const indicators = calculateIndicators({
    initialInvestment: Number(fin.initialInvestment) || 0,
    fixedAssets: Number(fin.fixedAssets) || 0,
    workingCapital: Number(fin.workingCapital) || 0,
    operatingCosts: Number(fin.operatingCosts) || 0,
    loans: Number(fin.loans) || 0,
    interestRate: Number(fin.interestRate) || 0,
    loanPeriod: Number(fin.loanPeriod) || 0,
    yearsData,
    discountRate: Number(eco.discountRate) || 10,
  });

  const fmt = (v: number) => formatCurrency(v, displayCurrency, locale);

  // حساب نسب الاكتمال لكل دراسة
  const studies = [
    { key: 'establishment', label: locale === 'ar' ? 'تأسيس' : 'Establishment', data: project.establishment, icon: FileText },
    { key: 'socialStudy', label: locale === 'ar' ? 'اجتماعية' : 'Social', data: project.socialStudy, icon: Users },
    { key: 'environmentalStudy', label: locale === 'ar' ? 'بيئية' : 'Environmental', data: project.environmentalStudy, icon: Leaf },
    { key: 'legalStudy', label: locale === 'ar' ? 'قانونية' : 'Legal', data: project.legalStudy, icon: Scale },
    { key: 'marketStudy', label: locale === 'ar' ? 'تسويقية' : 'Market', data: project.marketStudy, icon: ShoppingBag },
    { key: 'technicalStudy', label: locale === 'ar' ? 'فنية' : 'Technical', data: project.technicalStudy, icon: Wrench },
    { key: 'financialStudy', label: locale === 'ar' ? 'مالية' : 'Financial', data: project.financialStudy, icon: Wallet },
    { key: 'economicStudy', label: locale === 'ar' ? 'اقتصادية' : 'Economic', data: project.economicStudy, icon: TrendingUp },
  ];

  const studyStats = studies.map((s) => {
    const data = s.data as any;
    if (!data || typeof data !== 'object') return { ...s, filled: 0, total: 0, pct: 0 };
    const keys = Object.keys(data);
    const filled = keys.filter((k) => {
      const v = data[k];
      return v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && v === 0);
    }).length;
    return { ...s, filled, total: keys.length, pct: keys.length > 0 ? Math.round((filled / keys.length) * 100) : 0 };
  });

  const overallPct = Math.round(studyStats.reduce((s, st) => s + st.pct, 0) / studyStats.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            {locale === 'ar' ? 'معلومات المشروع' : 'Project Info'}
          </DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        {/* بطاقة معلومات أساسية */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow icon={Building2} label={locale === 'ar' ? 'النوع' : 'Type'} value={est.projectType || '—'} />
            <InfoRow icon={MapPin} label={locale === 'ar' ? 'الموقع' : 'Location'} value={est.projectLocation || '—'} />
            <InfoRow icon={User} label={locale === 'ar' ? 'المالك' : 'Owner'} value={est.projectOwner || '—'} />
            <InfoRow icon={Calendar} label={locale === 'ar' ? 'المدة' : 'Duration'} value={`${est.projectDuration || '—'} ${locale === 'ar' ? 'سنة' : 'yr'}`} />
            <InfoRow icon={DollarSign} label={locale === 'ar' ? 'رأس المال' : 'Capital'} value={fmt(Number(est.projectCapital) || 0)} />
            <InfoRow icon={Clock} label={locale === 'ar' ? 'الحالة' : 'Status'} value={project.status === 'completed' ? (locale === 'ar' ? 'مكتمل' : 'Completed') : project.status === 'in-progress' ? (locale === 'ar' ? 'قيد التنفيذ' : 'In Progress') : (locale === 'ar' ? 'مسودة' : 'Draft')} />
          </div>
        </Card>

        {/* المؤشرات المالية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <MiniStat label="NPV" value={fmt(indicators.npv)} positive={indicators.npv >= 0} />
          <MiniStat label="IRR" value={indicators.irr !== null ? `${indicators.irr.toFixed(1)}%` : '—'} positive={indicators.irr !== null && indicators.irr > (Number(eco.discountRate) || 10)} />
          <MiniStat label="ROI" value={`${indicators.roi.toFixed(0)}%`} positive={indicators.roi >= 0} />
          <MiniStat label={locale === 'ar' ? 'استرداد' : 'Payback'} value={indicators.paybackPeriod !== null ? `${indicators.paybackPeriod.toFixed(1)} ${locale === 'ar' ? 'سنة' : 'yr'}` : '—'} />
        </div>

        {/* شارة الجدوى */}
        <div className={cn('p-3 rounded-lg text-center font-bold', indicators.isViable ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700')}>
          {indicators.isViable ? `✓ ${locale === 'ar' ? 'المشروع مجدي' : 'Project is Viable'}` : `✗ ${locale === 'ar' ? 'المشروع غير مجدي' : 'Project is Not Viable'}`}
        </div>

        {/* نسب إكمال الدراسات */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">{locale === 'ar' ? 'نسبة إكمال الدراسات' : 'Studies Completion'}</h4>
            <Badge variant="secondary">{overallPct}%</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {studyStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className={cn('p-2 rounded-md text-center', s.pct === 0 ? 'bg-muted/30' : s.pct >= 80 ? 'bg-emerald-500/10' : s.pct >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10')}>
                  <Icon className={cn('size-4 mx-auto mb-1', s.pct >= 80 ? 'text-emerald-600' : s.pct >= 40 ? 'text-amber-600' : 'text-muted-foreground')} />
                  <div className="text-[10px] font-medium">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground">{s.filled}/{s.total}</div>
                  <div className={cn('text-sm font-bold', s.pct >= 80 ? 'text-emerald-600' : s.pct >= 40 ? 'text-amber-600' : 'text-muted-foreground')}>{s.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">{locale === 'ar' ? 'العمالة' : 'Workers'}: </span>
            <span className="font-bold">{tech.laborRequired || social.jobsCreated || 0}</span>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">{locale === 'ar' ? 'الحصة السوقية' : 'Market Share'}: </span>
            <span className="font-bold">{market.expectedShare || 0}%</span>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">{locale === 'ar' ? 'سنوات مالية' : 'Financial Years'}: </span>
            <span className="font-bold">{yearsData.length}</span>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">{locale === 'ar' ? 'معدل الخصم' : 'Discount Rate'}: </span>
            <span className="font-bold">{eco.discountRate || 10}%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs">{label}:</span>
      <span className="font-medium text-xs truncate">{value}</span>
    </div>
  );
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="p-2 rounded-md bg-secondary/30 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-bold text-sm', positive ? 'text-emerald-600' : 'text-red-600')}>{value}</div>
    </div>
  );
}
