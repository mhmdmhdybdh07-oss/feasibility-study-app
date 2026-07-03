'use client';

import { useAppStore } from '@/store/app-store';
import { useProjects } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Plus, FolderOpen, TrendingUp, Users, Leaf, Scale, ShoppingBag, Wrench, Wallet, FileText as FileTextIcon, Clock, ArrowLeft, Sparkles, Coins } from 'lucide-react';
import { useState } from 'react';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ProjectsDialog } from '@/components/projects-dialog';
import { ExchangeRatesDialog } from '@/components/exchange-rates-dialog';
import { SampleProjectsDialog } from '@/components/sample-projects-dialog';
import { ExecutiveDashboard } from '@/components/feasibility/executive-dashboard';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { PROJECT_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';
import { GraduationCap } from 'lucide-react';

const STUDY_CARDS = [
  { key: 'establishment', icon: FileText, color: 'bg-teal-500/10 text-teal-600' },
  { key: 'socialStudy', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
  { key: 'environmentalStudy', icon: Leaf, color: 'bg-green-500/10 text-green-600' },
  { key: 'legalStudy', icon: Scale, color: 'bg-purple-500/10 text-purple-600' },
  { key: 'marketStudy', icon: ShoppingBag, color: 'bg-orange-500/10 text-orange-600' },
  { key: 'technicalStudy', icon: Wrench, color: 'bg-amber-500/10 text-amber-600' },
  { key: 'financialStudy', icon: Wallet, color: 'bg-rose-500/10 text-rose-600' },
  { key: 'economicStudy', icon: TrendingUp, color: 'bg-indigo-500/10 text-indigo-600' },
] as const;

export function DashboardSection() {
  const { t, locale } = useTranslation();
  const { data: projects, isLoading } = useProjects();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const [newOpen, setNewOpen] = useState(false);
  const [openOpen, setOpenOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);

  const recentProjects = (projects ?? []).slice(0, 5);

  // إحصائيات
  const totalProjects = projects?.length ?? 0;
  const completedProjects = projects?.filter((p) => p.status === 'completed').length ?? 0;
  const inProgressProjects = projects?.filter((p) => p.status === 'in-progress').length ?? 0;
  const draftProjects = projects?.filter((p) => p.status === 'draft').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <BarChart3 className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('appTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('appSubtitle')}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {locale === 'ar'
                ? 'نظام متكامل لإعداد دراسات الجدوى يشمل ثمانية أنواع من الدراسات المتخصصة، يدعم اللغتين العربية والإنجليزية، مع الريال اليمني كعملة رئيسية وإمكانية التبديل بين 10 عملات. يحتوي على مكتبة قوالب جاهزة، تحليل حساسية، ملخص تنفيذي تلقائي، وتصدير بصيغ متعددة.'
                : 'Integrated system for preparing feasibility studies covering eight specialized study types, supports Arabic and English, with Yemeni Rial as the main currency and switching between 10 currencies. Includes templates library, sensitivity analysis, auto executive summary, and multi-format export.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="size-4 me-1" />
                {t('newProject')}
              </Button>
              <Button variant="outline" onClick={() => setOpenOpen(true)}>
                <FolderOpen className="size-4 me-1" />
                {t('openProject')}
              </Button>
              <Button variant="ghost" onClick={() => setRatesOpen(true)} className="text-muted-foreground">
                <Coins className="size-4 me-1" />
                {locale === 'ar' ? 'أسعار الصرف' : 'Exchange Rates'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* اللوحة التنفيذية */}
      {totalProjects > 0 && <ExecutiveDashboard />}

      {/* الإحصائيات */}
      {totalProjects > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={locale === 'ar' ? 'إجمالي المشاريع' : 'Total Projects'} value={totalProjects} icon={FileText} color="text-primary" />
          <StatCard label={locale === 'ar' ? 'مكتملة' : 'Completed'} value={completedProjects} icon={TrendingUp} color="text-emerald-600" />
          <StatCard label={locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'} value={inProgressProjects} icon={Clock} color="text-blue-600" />
          <StatCard label={locale === 'ar' ? 'مسودات' : 'Drafts'} value={draftProjects} icon={FileText} color="text-muted-foreground" />
        </div>
      )}

      {/* المشاريع النموذجية للتعلم */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="size-5 text-primary" />
          <h2 className="text-lg font-bold">{locale === 'ar' ? 'مشاريع نموذجية للتعلم' : 'Sample Projects for Learning'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_PROJECTS.map((s) => (
            <Card
              key={s.id}
              className="p-4 hover:bg-accent transition-all cursor-pointer hover:shadow-md"
              onClick={() => setSamplesOpen(true)}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{s.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{locale === 'ar' ? s.nameAr : s.nameEn}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {locale === 'ar' ? s.descriptionAr : s.descriptionEn}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* قوالب المشاريع الجاهزة */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-lg font-bold">{locale === 'ar' ? 'قوالب المشاريع الجاهزة' : 'Project Templates'}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROJECT_TEMPLATES.slice(0, 8).map((tmpl) => (
            <Card
              key={tmpl.id}
              className="p-4 hover:bg-accent transition-all cursor-pointer hover:shadow-md"
              onClick={() => setNewOpen(true)}
            >
              <div className="text-3xl mb-2">{tmpl.icon}</div>
              <div className="font-medium text-sm">{locale === 'ar' ? tmpl.nameAr : tmpl.nameEn}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {TEMPLATE_CATEGORIES[tmpl.category][locale]}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* أنواع الدراسات */}
      <div>
        <h2 className="text-lg font-bold mb-3">{locale === 'ar' ? 'أنواع الدراسات' : 'Study Types'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STUDY_CARDS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.key} className="p-4 hover:bg-accent transition-colors">
                <div className={`size-10 rounded-md flex items-center justify-center mb-2 ${s.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="font-medium text-sm">{t(s.key as any)}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* المشاريع الأخيرة */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{locale === 'ar' ? 'المشاريع الأخيرة' : 'Recent Projects'}</h2>
          {(projects?.length ?? 0) > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setOpenOpen(true)}>
              {t('myProjects')}
              <ArrowLeft className="size-4 ms-1 rtl:rotate-180" />
            </Button>
          )}
        </div>
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">{t('loading')}</Card>
        ) : recentProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="size-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">{locale === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet'}</p>
            <Button onClick={() => setNewOpen(true)} variant="outline">
              <Plus className="size-4 me-1" />
              {t('newProject')}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-2">
            {recentProjects.map((p) => (
              <Card
                key={p.id}
                className="p-3 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => {
                  setCurrentProjectId(p.id);
                  setActiveSection('establishment');
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileTextIcon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {t(p.status === 'in-progress' ? 'statusInProgress' : p.status === 'completed' ? 'statusCompleted' : 'statusDraft')}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="size-4 text-muted-foreground rotate-180 rtl:rotate-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
      <ProjectsDialog open={openOpen} onOpenChange={setOpenOpen} />
      <ExchangeRatesDialog open={ratesOpen} onOpenChange={setRatesOpen} />
      <SampleProjectsDialog open={samplesOpen} onOpenChange={setSamplesOpen} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof FileText; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
        <Icon className={`size-8 ${color} opacity-50`} />
      </div>
    </Card>
  );
}
