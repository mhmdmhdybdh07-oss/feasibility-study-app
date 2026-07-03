'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY_LIST, type CurrencyCode } from '@/lib/currencies';
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function ImportExcelDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(displayCurrency);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!projectName) {
        setProjectName(f.name.replace(/\.(xlsx|xls|csv)$/i, ''));
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({ title: t('selectExcelFile'), variant: 'destructive' });
      return;
    }
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', projectName);
      fd.append('displayCurrency', currency);
      const res = await fetch('/api/projects/import', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: t('importSuccess'),
        description: locale === 'ar'
          ? `تم استيراد ${data.importedStudies.length} دراسة`
          : `Imported ${data.importedStudies.length} studies`,
      });
      setCurrentProjectId(data.project.id);
      setActiveSection('establishment');
      onOpenChange(false);
      setFile(null);
      setProjectName('');
    } catch (e) {
      toast({ title: t('importFailed'), description: (e as Error).message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            {t('importExcel')}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'استورد بيانات المشروع من ملف Excel تم تصديره مسبقاً من البرنامج'
              : 'Import project data from an Excel file exported by this app'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Card
            className="p-6 border-dashed border-2 hover:bg-accent/50 cursor-pointer transition-colors text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">
              {file ? file.name : (locale === 'ar' ? 'اضغط لاختيار ملف' : 'Click to select file')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {locale === 'ar' ? 'Excel (.xlsx, .xls, .csv)' : 'Excel (.xlsx, .xls, .csv)'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </Card>

          <div className="space-y-1.5">
            <Label htmlFor="imp-name">{t('projectName')}</Label>
            <Input
              id="imp-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={locale === 'ar' ? 'اسم المشروع' : 'Project name'}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? <Loader2 className="size-4 me-2 animate-spin" /> : <Upload className="size-4 me-2" />}
            {t('importExcel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
