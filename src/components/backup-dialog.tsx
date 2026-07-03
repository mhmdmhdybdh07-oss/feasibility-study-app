'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Upload, Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function BackupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feasibility-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: t('backupExport') + ' ✓' });
    } catch (e) {
      toast({ title: t('backupExport'), description: (e as Error).message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', mode);
      const res = await fetch('/api/backup/import', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: t('backupImport') + ' ✓',
        description: locale === 'ar'
          ? `تم استيراد ${data.imported} مشروع`
          : `Imported ${data.imported} projects`,
      });
      onOpenChange(false);
    } catch (e) {
      toast({ title: t('backupImport'), description: (e as Error).message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="size-5 text-primary" />
            {t('backup')}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'نسخ احتياطي كامل لجميع المشاريع والإعدادات'
              : 'Full backup of all projects and settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* تصدير */}
          <Card className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Download className="size-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('backupExport')}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'ar' ? 'حفظ جميع المشاريع في ملف JSON' : 'Save all projects to JSON file'}
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              </Button>
            </div>
          </Card>

          {/* استيراد */}
          <Card className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="size-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                <Upload className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{t('backupImport')}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'ar' ? 'استعادة المشاريع من ملف JSON' : 'Restore projects from JSON file'}
                </div>
              </div>
            </div>

            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'merge' | 'replace')} className="mb-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="text-xs cursor-pointer flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  {locale === 'ar' ? 'دمج (تحديث الموجود وإضافة الجديد)' : 'Merge (update existing, add new)'}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="text-xs cursor-pointer flex items-center gap-1">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  {locale === 'ar' ? 'استبدال (حذف الكل ثم الاستيراد)' : 'Replace (delete all then import)'}
                </Label>
              </div>
            </RadioGroup>

            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = '';
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              {importing ? <Loader2 className="size-4 me-2 animate-spin" /> : <Upload className="size-4 me-2" />}
              {locale === 'ar' ? 'اختر ملف النسخة الاحتياطية' : 'Select backup file'}
            </Button>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
