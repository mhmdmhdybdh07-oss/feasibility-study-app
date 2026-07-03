'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function SampleProjectsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const { toast } = useToast();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLoad = async (sampleId: string) => {
    setLoading(sampleId);
    try {
      const res = await fetch('/api/projects/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ['projects'] });
      setCurrentProjectId(data.project.id);
      setActiveSection('results');
      onOpenChange(false);
      toast({
        title: locale === 'ar' ? 'تم تحميل المشروع النموذجي' : 'Sample project loaded',
        description: locale === 'ar' ? 'انتقل لصفحة النتائج لرؤية التحليل الكامل' : 'Go to results page to see full analysis',
      });
    } catch (e) {
      toast({ title: locale === 'ar' ? 'فشل التحميل' : 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            {locale === 'ar' ? 'مشاريع نموذجية للتعلم' : 'Sample Projects for Learning'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'مشاريع جاهزة كاملة لتتعلم منها - تتضمن بيانات واقعية ونتائج محسوبة'
              : 'Complete ready-made projects to learn from - with realistic data and computed results'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {SAMPLE_PROJECTS.map((s) => (
            <Card key={s.id} className="p-4 hover:bg-accent/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-4xl shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base">{locale === 'ar' ? s.nameAr : s.nameEn}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === 'ar' ? s.descriptionAr : s.descriptionEn}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {s.id === 'sample-bakery' && (
                      <Badge className="bg-emerald-500 text-white text-[10px]">
                        {locale === 'ar' ? '✓ مجدي' : '✓ Viable'}
                      </Badge>
                    )}
                    {s.id === 'sample-laundry' && (
                      <Badge className="bg-red-500 text-white text-[10px]">
                        {locale === 'ar' ? '✗ غير مجدي' : '✗ Not Viable'}
                      </Badge>
                    )}
                    {s.id === 'sample-poultry' && (
                      <Badge className="bg-amber-500 text-white text-[10px]">
                        {locale === 'ar' ? '⚠ متوازن' : '⚠ Balanced'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {locale === 'ar' ? `${(s.data.financialStudy as any)?.yearsData?.length ?? 0} سنوات` : `${(s.data.financialStudy as any)?.yearsData?.length ?? 0} years`}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLoad(s.id)}
                  disabled={loading === s.id}
                >
                  {loading === s.id ? <Loader2 className="size-4 animate-spin" /> : <ArrowLeft className="size-4 rtl:rotate-180" />}
                  <span className="ms-1">{locale === 'ar' ? 'تحميل' : 'Load'}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-xs">
          <b>{locale === 'ar' ? '💡 فكرة التعلم:' : '💡 Learning tip:'}</b>{' '}
          {locale === 'ar'
            ? 'حمّل المشاريع الثلاثة وقارن بينها في صفحة "النتائج والتقارير" لفهم كيف تؤثر البيانات على المؤشرات.'
            : 'Load all three projects and compare them in the Results page to understand how data affects indicators.'}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
