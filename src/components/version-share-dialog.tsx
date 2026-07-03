'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  History, RotateCcw, Camera, Trash2, Clock, FileText, Share2, Copy, Mail, Link2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Snapshot {
  id: string;
  timestamp: string;
  label: string;
  data: Record<string, any>;
}

export function VersionHistoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  // تحميل النسخ من localStorage
  const storageKey = `project-snapshots-${currentProjectId}`;

  const loadSnapshots = () => {
    if (!currentProjectId) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setSnapshots(JSON.parse(stored));
    } catch {}
  };

  // حفظ لقطة
  const handleSaveSnapshot = () => {
    if (!project || !currentProjectId) return;
    const snapshot: Snapshot = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      label: `نسخة ${snapshots.length + 1}`,
      data: {
        establishment: project.establishment,
        socialStudy: project.socialStudy,
        environmentalStudy: project.environmentalStudy,
        legalStudy: project.legalStudy,
        marketStudy: project.marketStudy,
        technicalStudy: project.technicalStudy,
        financialStudy: project.financialStudy,
        economicStudy: project.economicStudy,
      },
    };
    const updated = [snapshot, ...snapshots].slice(0, 20); // حد أقصى 20 نسخة
    setSnapshots(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast({ title: locale === 'ar' ? 'تم حفظ النسخة' : 'Snapshot saved' });
  };

  // استعادة نسخة
  const handleRestore = (snapshot: Snapshot) => {
    if (!currentProjectId) return;
    if (!confirm(locale === 'ar' ? 'سيتم استبدال البيانات الحالية. متابعة؟' : 'Current data will be replaced. Continue?')) return;
    updateProject.mutate({ id: currentProjectId, data: snapshot.data }, {
      onSuccess: () => toast({ title: locale === 'ar' ? 'تمت الاستعادة' : 'Restored' }),
    });
  };

  // حذف نسخة
  const handleDelete = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // تحميل عند الفتح
  if (open && snapshots.length === 0 && currentProjectId) {
    loadSnapshots();
  }

  // === مشاركة المشروع ===
  const shareUrl = currentProjectId ? `${window.location.origin}/?project=${currentProjectId}` : '';
  const shareText = project ? `${locale === 'ar' ? 'دراسة جدوى' : 'Feasibility Study'}: ${project.name}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied' });
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  const handleShareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(locale === 'ar' ? 'يمكنك عرض دراسة الجدوى على الرابط:\n' + shareUrl : 'View the feasibility study:\n' + shareUrl)}`, '_blank');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSnapshots([]); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              {locale === 'ar' ? 'سجل النسخ + المشاركة' : 'Version History + Share'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ar' ? 'حفظ واستعادة نسخ + مشاركة المشروع' : 'Save/restore versions + share project'}
            </DialogDescription>
          </DialogHeader>

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button size="sm" onClick={handleSaveSnapshot} disabled={!project}>
              <Camera className="size-4 me-1.5" />
              {locale === 'ar' ? 'حفظ نسخة' : 'Save Snapshot'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShareOpen(!shareOpen)} disabled={!project}>
              <Share2 className="size-4 me-1.5" />
              {locale === 'ar' ? 'مشاركة' : 'Share'}
            </Button>
          </div>

          {/* قسم المشاركة */}
          {shareOpen && project && (
            <Card className="p-3 bg-primary/5 border-primary/20 mb-3">
              <div className="text-xs font-medium mb-2">{locale === 'ar' ? 'مشاركة المشروع:' : 'Share project:'}</div>
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-[10px] p-1.5 rounded border bg-background font-mono"
                />
                <Button size="sm" variant="ghost" className="size-7 p-0" onClick={handleCopyLink}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={handleShareWhatsApp}>
                  <span className="me-1">💬</span> WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={handleShareEmail}>
                  <Mail className="size-3 me-1" /> {locale === 'ar' ? 'بريد' : 'Email'}
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={handleCopyLink}>
                  <Link2 className="size-3 me-1" /> {locale === 'ar' ? 'نسخ' : 'Copy'}
                </Button>
              </div>
            </Card>
          )}

          {/* قائمة النسخ */}
          <ScrollArea className="flex-1 max-h-[50vh] pe-1">
            {snapshots.length === 0 ? (
              <div className="text-center py-8">
                <History className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'لا توجد نسخ محفوظة. اضغط "حفظ نسخة"' : 'No snapshots. Click "Save Snapshot"'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="flex items-center gap-2 p-2 rounded-md border bg-background/50">
                    <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{snap.label}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(snap.timestamp), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => handleRestore(snap)}>
                      <RotateCcw className="size-3 me-1" />
                      {locale === 'ar' ? 'استعادة' : 'Restore'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(snap.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
            {locale === 'ar' ? '💡 تُحفظ النسخ محلياً (حد أقصى 20)' : '💡 Stored locally (max 20)'}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
