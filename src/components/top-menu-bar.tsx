'use client';

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar';
import {
  FilePlus2,
  FolderOpen,
  Save,
  FileDown,
  Printer,
  Languages,
  Coins,
  Moon,
  Sun,
  HelpCircle,
  Info,
  BookOpen,
  Trash2,
  LayoutDashboard,
  ScrollText,
  Users,
  Leaf,
  Scale,
  ShoppingBag,
  Wrench,
  Wallet,
  TrendingUp,
  BarChart3,
  FileText,
  Upload,
  GitCompare,
  Database,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useProject, useDeleteProject } from '@/hooks/use-projects';
import { CURRENCY_LIST, type CurrencyCode } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { NewProjectDialog } from './new-project-dialog';
import { ProjectsDialog } from './projects-dialog';
import { GuideDialog } from './guide-dialog';
import { AboutDialog } from './about-dialog';
import { ExportDialog } from './export-dialog';
import { ExchangeRatesDialog } from './exchange-rates-dialog';
import { ImportExcelDialog } from './import-excel-dialog';
import { CompareDialog } from './compare-dialog';
import { BackupDialog } from './backup-dialog';
import { AuthDialog } from './auth-dialog';
import { CustomReportDialog } from './custom-report-dialog';
import { GlossaryDialog } from './glossary-dialog';
import { SampleProjectsDialog } from './sample-projects-dialog';
import { CropsLibraryDialog } from './crops-library-dialog';
import { FactoriesLibraryDialog } from './factories-library-dialog';
import { EnergyLibraryDialog } from './energy-library-dialog';
import { SettingsDialog } from './settings-dialog';
import { ProjectInfoDialog } from './project-info-dialog';
import { NotificationsDialog } from './notifications-dialog';
import { StudyNavigatorDialog } from './study-navigator-dialog';
import { VersionHistoryDialog } from './version-share-dialog';
import { CommandPalette } from './command-palette';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { GraduationCap, Command as CommandIcon, Sprout, Factory, Sliders, Sparkles, Zap, Bell, Info as InfoIcon, Compass, History, Monitor } from 'lucide-react';

const SECTIONS = [
  { key: 'dashboard', icon: LayoutDashboard, tKey: 'dashboard' as const },
  { key: 'samples', icon: Sparkles, tKey: 'samples' as any },
  { key: 'establishment', icon: FileText, tKey: 'establishment' as const },
  { key: 'socialStudy', icon: Users, tKey: 'socialStudy' as const },
  { key: 'environmentalStudy', icon: Leaf, tKey: 'environmentalStudy' as const },
  { key: 'legalStudy', icon: Scale, tKey: 'legalStudy' as const },
  { key: 'marketStudy', icon: ShoppingBag, tKey: 'marketStudy' as const },
  { key: 'technicalStudy', icon: Wrench, tKey: 'technicalStudy' as const },
  { key: 'financialStudy', icon: Wallet, tKey: 'financialStudy' as const },
  { key: 'economicStudy', icon: TrendingUp, tKey: 'economicStudy' as const },
  { key: 'results', icon: BarChart3, tKey: 'results' as const },
];

export function TopMenuBar() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const setDisplayCurrency = useAppStore((s) => s.setDisplayCurrency);
  const theme = useAppStore((s) => s.theme);
  const displayMode = useAppStore((s) => s.displayMode);
  const setTheme = useAppStore((s) => s.setTheme);
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const { data: project } = useProject(currentProjectId);
  const deleteProject = useDeleteProject();

  const [newOpen, setNewOpen] = useState(false);
  const [openOpen, setOpenOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [customReportOpen, setCustomReportOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [cropsOpen, setCropsOpen] = useState(false);
  const [factoriesOpen, setFactoriesOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleNew = () => setNewOpen(true);
  const handleOpen = () => setOpenOpen(true);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      // F1 - دليل الاستخدام
      if (e.key === 'F1') {
        e.preventDefault();
        setGuideOpen(true);
        return;
      }
      // Ctrl+G - القاموس
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setGlossaryOpen(true);
        return;
      }
      // تجاهل إذا كان المستخدم يكتب في حقل
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      // اختصارات بدون Ctrl
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        setNewOpen(true);
      } else if (e.key === 'o' && !e.ctrlKey && !e.metaKey) {
        setOpenOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const paletteActions = {
    newProject: () => setNewOpen(true),
    openProject: () => setOpenOpen(true),
    save: () => toast({ title: t('savedSuccess') }),
    export: () => {
      if (!currentProjectId) {
        toast({ title: t('selectProjectFirst'), variant: 'destructive' });
        return;
      }
      setExportOpen(true);
    },
    print: () => {
      if (!currentProjectId) {
        toast({ title: t('selectProjectFirst'), variant: 'destructive' });
        return;
      }
      setActiveSection('results');
      setTimeout(() => window.print(), 300);
    },
    importExcel: () => setImportOpen(true),
    compare: () => setCompareOpen(true),
    backup: () => setBackupOpen(true),
    rates: () => setRatesOpen(true),
    glossary: () => setGlossaryOpen(true),
    customReport: () => {
      if (!currentProjectId) {
        toast({ title: t('selectProjectFirst'), variant: 'destructive' });
        return;
      }
      setCustomReportOpen(true);
    },
    auth: () => setAuthOpen(true),
    guide: () => setGuideOpen(true),
    about: () => setAboutOpen(true),
  };

  const handleSave = () => {
    // الحفظ يتم تلقائياً من خلال نماذج الأقسام؛ هذه رسالة تأكيد فقط
    toast({ title: t('savedSuccess') });
  };
  const handleExport = () => {
    if (!currentProjectId) {
      toast({ title: t('selectProjectFirst'), variant: 'destructive' });
      return;
    }
    setExportOpen(true);
  };
  const handlePrint = () => {
    if (!currentProjectId) {
      toast({ title: t('selectProjectFirst'), variant: 'destructive' });
      return;
    }
    setActiveSection('results');
    setTimeout(() => window.print(), 300);
  };
  const handleDelete = () => {
    if (!currentProjectId) return;
    if (confirm(t('confirmDelete'))) {
      deleteProject.mutate(currentProjectId);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b no-print">
        {/* الصف العلوي: القوائم */}
        <div className="flex items-center justify-between px-3 pt-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2">
              <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <BarChart3 className="size-5" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold leading-tight">{t('appTitle')}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{t('appSubtitle')}</div>
              </div>
            </div>
          </div>

          {project && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/50 text-xs">
              <FileText className="size-3.5 text-primary" />
              <span className="font-medium">{project.name}</span>
            </div>
          )}

          <Menubar className="h-9">
            <MenubarMenu>
              <MenubarTrigger className="text-sm">{t('file')}</MenubarTrigger>
              <MenubarContent align="start">
                <MenubarItem onClick={handleNew}>
                  <FilePlus2 className="size-4 me-2" />
                  {t('fileNew')}
                </MenubarItem>
                <MenubarItem onClick={handleOpen}>
                  <FolderOpen className="size-4 me-2" />
                  {t('fileOpen')}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleSave} disabled={!currentProjectId}>
                  <Save className="size-4 me-2" />
                  {t('fileSave')}
                </MenubarItem>
                <MenubarItem onClick={handleExport} disabled={!currentProjectId}>
                  <FileDown className="size-4 me-2" />
                  {t('fileExport')}
                </MenubarItem>
                <MenubarItem onClick={() => setCustomReportOpen(true)} disabled={!currentProjectId}>
                  <FileText className="size-4 me-2" />
                  {t('customReportBuilder')}
                </MenubarItem>
                <MenubarItem onClick={handlePrint} disabled={!currentProjectId}>
                  <Printer className="size-4 me-2" />
                  {t('filePrint')}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setImportOpen(true)}>
                  <Upload className="size-4 me-2" />
                  {t('importExcel')}
                </MenubarItem>
                <MenubarItem onClick={() => setCompareOpen(true)}>
                  <GitCompare className="size-4 me-2" />
                  {t('compareProjects')}
                </MenubarItem>
                <MenubarItem onClick={() => setBackupOpen(true)}>
                  <Database className="size-4 me-2" />
                  {t('backup')}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleDelete} disabled={!currentProjectId} className="text-destructive">
                  <Trash2 className="size-4 me-2" />
                  {t('delete')}
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-sm">{t('view')}</MenubarTrigger>
              <MenubarContent align="start">
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Languages className="size-4 me-2" />
                    {t('viewLanguage')}
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarRadioGroup value={locale} onValueChange={(v) => setLocale(v as 'ar' | 'en')}>
                      <MenubarRadioItem value="ar">العربية</MenubarRadioItem>
                      <MenubarRadioItem value="en">English</MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Coins className="size-4 me-2" />
                    {t('viewCurrency')}
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarRadioGroup
                      value={displayCurrency}
                      onValueChange={(v) => setDisplayCurrency(v as CurrencyCode)}
                    >
                      {CURRENCY_LIST.map((c) => (
                        <MenubarRadioItem key={c.code} value={c.code}>
                          {locale === 'ar' ? c.nameAr : c.nameEn} ({c.symbol})
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarItem onClick={() => setRatesOpen(true)}>
                  <Coins className="size-4 me-2" />
                  {locale === 'ar' ? 'تعديل أسعار الصرف' : 'Edit Exchange Rates'}
                </MenubarItem>
                <MenubarItem onClick={() => setSettingsOpen(true)}>
                  <Sliders className="size-4 me-2" />
                  {locale === 'ar' ? 'الإعدادات والثيمات' : 'Settings & Themes'}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem
                  checked={theme === 'dark'}
                  onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
                >
                  {theme === 'dark' ? <Moon className="size-4 me-2" /> : <Sun className="size-4 me-2" />}
                  {t('viewTheme')}
                </MenubarCheckboxItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-sm">{t('studies')}</MenubarTrigger>
              <MenubarContent align="start">
                {SECTIONS.filter((s) => s.key !== 'dashboard' && s.key !== 'results').map((s) => {
                  const Icon = s.icon;
                  return (
                    <MenubarItem
                      key={s.key}
                      onClick={() => {
                        if (!currentProjectId) {
                          toast({ title: t('selectProjectFirst'), variant: 'destructive' });
                          return;
                        }
                        setActiveSection(s.key);
                      }}
                    >
                      <Icon className="size-4 me-2" />
                      {t(s.tKey)}
                    </MenubarItem>
                  );
                })}
                <MenubarSeparator />
                <MenubarItem onClick={() => currentProjectId && setActiveSection('results')}>
                  <BarChart3 className="size-4 me-2" />
                  {t('results')}
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-sm">{t('help')}</MenubarTrigger>
              <MenubarContent align="end">
                <MenubarItem onClick={() => setGuideOpen(true)}>
                  <BookOpen className="size-4 me-2" />
                  {t('helpGuide')}
                  <kbd className="ms-auto text-[10px] text-muted-foreground">F1</kbd>
                </MenubarItem>
                <MenubarItem onClick={() => setGlossaryOpen(true)}>
                  <BookOpen className="size-4 me-2" />
                  {locale === 'ar' ? 'قاموس المصطلحات' : 'Glossary'}
                  <kbd className="ms-auto text-[10px] text-muted-foreground">Ctrl+G</kbd>
                </MenubarItem>
                <MenubarItem onClick={() => setSamplesOpen(true)}>
                  <GraduationCap className="size-4 me-2" />
                  {locale === 'ar' ? 'مشاريع نموذجية' : 'Sample Projects'}
                </MenubarItem>
                <MenubarItem onClick={() => setCropsOpen(true)}>
                  <Sprout className="size-4 me-2" />
                  {locale === 'ar' ? 'مكتبة المحاصيل اليمنية' : 'Crops Library'}
                </MenubarItem>
                <MenubarItem onClick={() => setFactoriesOpen(true)}>
                  <Factory className="size-4 me-2" />
                  {locale === 'ar' ? 'مكتبة مصانع الصناعات التحويلية' : 'Factories Library'}
                </MenubarItem>
                <MenubarItem onClick={() => setEnergyOpen(true)}>
                  <Zap className="size-4 me-2" />
                  {locale === 'ar' ? 'مكتبة مشاريع الطاقة المتجددة' : 'Energy Projects'}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setAboutOpen(true)}>
                  <Info className="size-4 me-2" />
                  {t('helpAbout')}
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* أزرار سريعة */}
            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => setNavigatorOpen(true)} title={locale === 'ar' ? 'تنقل' : 'Navigate'}>
              <Compass className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="size-8 p-0 relative" onClick={() => setNotifOpen(true)} title={locale === 'ar' ? 'إشعارات' : 'Notifications'}>
              <Bell className="size-4" />
              <span className="absolute top-1 end-1 size-1.5 bg-red-500 rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => setInfoOpen(true)} disabled={!currentProjectId} title={locale === 'ar' ? 'معلومات' : 'Info'}>
              <InfoIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => setVersionOpen(true)} disabled={!currentProjectId} title={locale === 'ar' ? 'نسخ ومشاركة' : 'Versions & Share'}>
              <History className="size-4" />
            </Button>
            {/* أوضاع العرض */}
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => {
                const modes: Array<'light' | 'dark' | 'auto' | 'reading'> = ['light', 'dark', 'auto', 'reading'];
                const idx = modes.indexOf(useAppStore.getState().displayMode);
                const next = modes[(idx + 1) % modes.length];
                useAppStore.getState().setDisplayMode(next);
                toast({ title: next === 'light' ? '☀️ فاتح' : next === 'dark' ? '🌙 داكن' : next === 'auto' ? '🖥️ تلقائي' : '📖 قراءة' });
              }}
              title={locale === 'ar' ? 'تبديل الوضع' : 'Toggle Mode'}
            >
              {displayMode === 'light' ? <Sun className="size-4" /> : displayMode === 'dark' ? <Moon className="size-4" /> : displayMode === 'reading' ? <BookOpen className="size-4" /> : <Monitor className="size-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="ms-1 gap-1.5"
              onClick={() => setPaletteOpen(true)}
              title="Ctrl+K"
            >
              <CommandIcon className="size-4" />
              <kbd className="text-[10px] text-muted-foreground hidden sm:inline">Ctrl+K</kbd>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setAuthOpen(true)}
            >
              <Shield className="size-4" />
              <span className="hidden sm:inline">{t('login')}</span>
            </Button>
          </Menubar>
        </div>

        {/* الصف السفلي: تبويب الأقسام */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-thin">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            const isDashboard = s.key === 'dashboard';
            const isSamples = s.key === 'samples';
            return (
              <button
                key={s.key}
                onClick={() => {
                  if (!isDashboard && !isSamples && !currentProjectId) {
                    toast({ title: t('selectProjectFirst'), variant: 'destructive' });
                    return;
                  }
                  setActiveSection(s.key);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="size-3.5" />
                {t(s.tKey)}
              </button>
            );
          })}
        </div>
      </div>

      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
      <ProjectsDialog open={openOpen} onOpenChange={setOpenOpen} />
      <GuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ExchangeRatesDialog open={ratesOpen} onOpenChange={setRatesOpen} />
      <ImportExcelDialog open={importOpen} onOpenChange={setImportOpen} />
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <CustomReportDialog open={customReportOpen} onOpenChange={setCustomReportOpen} />
      <GlossaryDialog open={glossaryOpen} onOpenChange={setGlossaryOpen} />
      <SampleProjectsDialog open={samplesOpen} onOpenChange={setSamplesOpen} />
      <CropsLibraryDialog open={cropsOpen} onOpenChange={setCropsOpen} />
      <FactoriesLibraryDialog open={factoriesOpen} onOpenChange={setFactoriesOpen} />
      <EnergyLibraryDialog open={energyOpen} onOpenChange={setEnergyOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProjectInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
      <NotificationsDialog open={notifOpen} onOpenChange={setNotifOpen} />
      <StudyNavigatorDialog open={navigatorOpen} onOpenChange={setNavigatorOpen} />
      <VersionHistoryDialog open={versionOpen} onOpenChange={setVersionOpen} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} actions={paletteActions} />
    </>
  );
}
