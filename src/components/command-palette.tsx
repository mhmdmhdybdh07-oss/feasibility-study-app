'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import {
  FilePlus2, FolderOpen, Save, FileDown, Printer, Upload, GitCompare, Database,
  Languages, Coins, BookOpen, Info, LayoutDashboard, FileText, Users, Leaf,
  Scale, ShoppingBag, Wrench, Wallet, TrendingUp, BarChart3, Sparkles,
  Calculator, Search, Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: typeof FilePlus2;
  action: () => void;
  shortcut?: string;
  category: 'file' | 'view' | 'study' | 'tools' | 'help';
  needsProject?: boolean;
}

export function CommandPalette({
  open,
  onOpenChange,
  actions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actions: Record<string, () => void>;
}) {
  const { locale } = useTranslation();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    // ملف
    { id: 'new', labelAr: 'مشروع جديد', labelEn: 'New Project', icon: FilePlus2, action: actions.newProject, shortcut: 'Ctrl+N', category: 'file' },
    { id: 'open', labelAr: 'فتح مشروع', labelEn: 'Open Project', icon: FolderOpen, action: actions.openProject, shortcut: 'Ctrl+O', category: 'file' },
    { id: 'save', labelAr: 'حفظ', labelEn: 'Save', icon: Save, action: actions.save, shortcut: 'Ctrl+S', category: 'file', needsProject: true },
    { id: 'export', labelAr: 'تصدير', labelEn: 'Export', icon: FileDown, action: actions.export, shortcut: 'Ctrl+E', category: 'file', needsProject: true },
    { id: 'print', labelAr: 'طباعة', labelEn: 'Print', icon: Printer, action: actions.print, shortcut: 'Ctrl+P', category: 'file', needsProject: true },
    { id: 'import', labelAr: 'استيراد Excel', labelEn: 'Import Excel', icon: Upload, action: actions.importExcel, category: 'file' },
    { id: 'compare', labelAr: 'مقارنة المشاريع', labelEn: 'Compare Projects', icon: GitCompare, action: actions.compare, category: 'file' },
    { id: 'backup', labelAr: 'النسخ الاحتياطي', labelEn: 'Backup', icon: Database, action: actions.backup, category: 'file' },
    // عرض
    { id: 'lang-ar', labelAr: 'التبديل للعربية', labelEn: 'Switch to Arabic', icon: Languages, action: () => useAppStore.getState().setLocale('ar'), category: 'view' },
    { id: 'lang-en', labelAr: 'التبديل للإنجليزية', labelEn: 'Switch to English', icon: Languages, action: () => useAppStore.getState().setLocale('en'), category: 'view' },
    { id: 'rates', labelAr: 'تعديل أسعار الصرف', labelEn: 'Edit Exchange Rates', icon: Coins, action: actions.rates, category: 'view' },
    // الأقسام
    { id: 'dashboard', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: LayoutDashboard, action: () => setActiveSection('dashboard'), category: 'study' },
    { id: 'establishment', labelAr: 'تأسيس المشروع', labelEn: 'Establishment', icon: FileText, action: () => setActiveSection('establishment'), category: 'study', needsProject: true },
    { id: 'social', labelAr: 'الدراسة الاجتماعية', labelEn: 'Social Study', icon: Users, action: () => setActiveSection('socialStudy'), category: 'study', needsProject: true },
    { id: 'environmental', labelAr: 'الدراسة البيئية', labelEn: 'Environmental Study', icon: Leaf, action: () => setActiveSection('environmentalStudy'), category: 'study', needsProject: true },
    { id: 'legal', labelAr: 'الدراسة القانونية', labelEn: 'Legal Study', icon: Scale, action: () => setActiveSection('legalStudy'), category: 'study', needsProject: true },
    { id: 'market', labelAr: 'الدراسة التسويقية', labelEn: 'Market Study', icon: ShoppingBag, action: () => setActiveSection('marketStudy'), category: 'study', needsProject: true },
    { id: 'technical', labelAr: 'الدراسة الفنية', labelEn: 'Technical Study', icon: Wrench, action: () => setActiveSection('technicalStudy'), category: 'study', needsProject: true },
    { id: 'financial', labelAr: 'الدراسة المالية', labelEn: 'Financial Study', icon: Wallet, action: () => setActiveSection('financialStudy'), category: 'study', needsProject: true },
    { id: 'economic', labelAr: 'الدراسة الاقتصادية', labelEn: 'Economic Study', icon: TrendingUp, action: () => setActiveSection('economicStudy'), category: 'study', needsProject: true },
    { id: 'results', labelAr: 'النتائج والتقارير', labelEn: 'Results & Reports', icon: BarChart3, action: () => setActiveSection('results'), category: 'study', needsProject: true },
    // أدوات
    { id: 'glossary', labelAr: 'قاموس المصطلحات', labelEn: 'Glossary', icon: BookOpen, action: actions.glossary, shortcut: 'Ctrl+G', category: 'tools' },
    { id: 'custom-report', labelAr: 'منشئ التقرير المخصص', labelEn: 'Custom Report', icon: Sparkles, action: actions.customReport, category: 'tools', needsProject: true },
    { id: 'auth', labelAr: 'تسجيل الدخول', labelEn: 'Login', icon: Sparkles, action: actions.auth, category: 'tools' },
    // مساعدة
    { id: 'guide', labelAr: 'دليل الاستخدام', labelEn: 'User Guide', icon: Info, action: actions.guide, shortcut: 'F1', category: 'help' },
    { id: 'about', labelAr: 'حول البرنامج', labelEn: 'About', icon: Info, action: actions.about, category: 'help' },
  ], [actions, setActiveSection]);

  const filtered = useMemo(() => {
    return commands.filter((c) => {
      if (c.needsProject && !currentProjectId) return false;
      const q = search.toLowerCase();
      const matches = !search ||
        c.labelAr.includes(search) ||
        c.labelEn.toLowerCase().includes(q) ||
        c.id.includes(q);
      return matches;
    });
  }, [commands, search, currentProjectId]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) {
        cmd.action();
        onOpenChange(false);
      }
    }
  };

  // تجميع حسب الفئة
  const grouped = useMemo(() => {
    const g: Record<string, CommandItem[]> = {};
    filtered.forEach((c) => {
      if (!g[c.category]) g[c.category] = [];
      g[c.category].push(c);
    });
    return g;
  }, [filtered]);

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    file: { ar: 'ملف', en: 'File' },
    view: { ar: 'عرض', en: 'View' },
    study: { ar: 'الأقسام', en: 'Sections' },
    tools: { ar: 'أدوات', en: 'Tools' },
    help: { ar: 'مساعدة', en: 'Help' },
  };

  let runningIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0" onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'ar' ? 'اكتب أمراً أو ابحث...' : 'Type a command or search...'}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] rounded border bg-muted text-muted-foreground">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Command className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{locale === 'ar' ? 'لا توجد أوامر مطابقة' : 'No matching commands'}</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-2">
                <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  {locale === 'ar' ? categoryLabels[cat].ar : categoryLabels[cat].en}
                </div>
                {items.map((cmd) => {
                  const Icon = cmd.icon;
                  const idx = runningIndex++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 text-start">
                        {locale === 'ar' ? cmd.labelAr : cmd.labelEn}
                      </span>
                      {cmd.shortcut && (
                        <kbd className={cn(
                          'px-1.5 py-0.5 text-[10px] rounded border',
                          isSelected ? 'border-primary-foreground/30' : 'bg-muted text-muted-foreground'
                        )}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border bg-background">↑↓</kbd>
              {locale === 'ar' ? 'تنقل' : 'Navigate'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border bg-background">↵</kbd>
              {locale === 'ar' ? 'اختيار' : 'Select'}
            </span>
          </div>
          <span>{filtered.length} {locale === 'ar' ? 'أمر' : 'commands'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
