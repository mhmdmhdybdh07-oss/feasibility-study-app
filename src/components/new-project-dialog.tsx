'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { CURRENCY_LIST, type CurrencyCode } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import { PROJECT_TEMPLATES, TEMPLATE_CATEGORIES, type ProjectTemplate } from '@/lib/templates';
import { Loader2, FileText, Sparkles, FilePlus2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [mode, setMode] = useState<'blank' | 'template'>('template');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(displayCurrency);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleBlankSubmit = async () => {
    if (!name.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        mainCurrency: 'YER',
        displayCurrency: currency,
      });
      setCurrentProjectId(project.id);
      setActiveSection('establishment');
      onOpenChange(false);
      resetForm();
      toast({ title: t('projectCreated') });
    } catch (e) {
      toast({ title: t('saveFailed'), variant: 'destructive' });
    }
  };

  const handleTemplateSubmit = async () => {
    if (!name.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    if (!selectedTemplate) {
      toast({ title: locale === 'ar' ? 'اختر قالباً' : 'Select a template', variant: 'destructive' });
      return;
    }
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || (locale === 'ar' ? selectedTemplate.descriptionAr : selectedTemplate.descriptionEn),
        mainCurrency: 'YER',
        displayCurrency: currency,
      });
      // تطبيق بيانات القالب على المشروع
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          establishment: selectedTemplate.defaultData.establishment,
          technicalStudy: selectedTemplate.defaultData.technicalStudy,
          marketStudy: selectedTemplate.defaultData.marketStudy,
        },
      });
      setCurrentProjectId(project.id);
      setActiveSection('establishment');
      onOpenChange(false);
      resetForm();
      toast({ title: t('projectCreated') });
    } catch (e) {
      toast({ title: t('saveFailed'), variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedTemplate(null);
    setCategoryFilter('all');
    setMode('template');
  };

  const filteredTemplates = categoryFilter === 'all'
    ? PROJECT_TEMPLATES
    : PROJECT_TEMPLATES.filter((t) => t.category === categoryFilter);

  const categories = ['all', ...Array.from(new Set(PROJECT_TEMPLATES.map((t) => t.category)))];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('newProject')}</DialogTitle>
          <DialogDescription>{t('appSubtitle')}</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'blank' | 'template')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">
              <Sparkles className="size-4 me-1.5" />
              {locale === 'ar' ? 'من قالب جاهز' : 'From Template'}
            </TabsTrigger>
            <TabsTrigger value="blank">
              <FilePlus2 className="size-4 me-1.5" />
              {locale === 'ar' ? 'مشروع فارغ' : 'Blank Project'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-3">
            {/* اختيار القالب */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {locale === 'ar' ? 'اختر نوع المشروع' : 'Choose project type'}
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md border transition-colors',
                      categoryFilter === c
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent'
                    )}
                  >
                    {c === 'all' ? (locale === 'ar' ? 'الكل' : 'All') : TEMPLATE_CATEGORIES[c as keyof typeof TEMPLATE_CATEGORIES][locale]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pe-1">
                {filteredTemplates.map((tmpl) => (
                  <Card
                    key={tmpl.id}
                    className={cn(
                      'p-3 cursor-pointer transition-all hover:shadow-md',
                      selectedTemplate?.id === tmpl.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => setSelectedTemplate(tmpl)}
                  >
                    <div className="text-2xl mb-1">{tmpl.icon}</div>
                    <div className="font-medium text-sm">
                      {locale === 'ar' ? tmpl.nameAr : tmpl.nameEn}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {locale === 'ar' ? tmpl.descriptionAr : tmpl.descriptionEn}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* اسم المشروع */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tp-name">{t('projectName')} *</Label>
                <Input
                  id="tp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedTemplate ? (locale === 'ar' ? selectedTemplate.nameAr : selectedTemplate.nameEn) : (locale === 'ar' ? 'مثال: مصنع الألبان' : 'e.g. Dairy Factory')}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('displayCurrency')}</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCY_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {locale === 'ar' ? c.nameAr : c.nameEn} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tp-desc">{t('description')}</Label>
              <Textarea
                id="tp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={selectedTemplate ? (locale === 'ar' ? selectedTemplate.descriptionAr : selectedTemplate.descriptionEn) : ''}
              />
            </div>

            {selectedTemplate && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-2">
                  <FileText className="size-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-medium">
                      {locale === 'ar' ? 'سيتم تطبيق بيانات افتراضية على:' : 'Default data will be applied to:'}
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {locale === 'ar' ? 'تأسيس المشروع + الدراسة الفنية + الدراسة التسويقية' : 'Establishment + Technical + Market Study'}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="blank" className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="bk-name">{t('projectName')} *</Label>
              <Input
                id="bk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: مصنع الألبان' : 'e.g. Dairy Factory'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-desc">{t('description')}</Label>
              <Textarea
                id="bk-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('displayCurrency')}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCY_LIST.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {locale === 'ar' ? c.nameAr : c.nameEn} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={mode === 'template' ? handleTemplateSubmit : handleBlankSubmit}
            disabled={createProject.isPending || updateProject.isPending}
          >
            {(createProject.isPending || updateProject.isPending) && <Loader2 className="size-4 me-2 animate-spin" />}
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
