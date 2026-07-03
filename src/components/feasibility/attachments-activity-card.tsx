'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download, Paperclip, History, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'general', ar: 'عام', en: 'General', icon: '📄' },
  { value: 'contract', ar: 'عقد', en: 'Contract', icon: '📋' },
  { value: 'license', ar: 'ترخيص', en: 'License', icon: '📜' },
  { value: 'photo', ar: 'صورة', en: 'Photo', icon: '🖼️' },
  { value: 'document', ar: 'مستند', en: 'Document', icon: '📎' },
  { value: 'financial', ar: 'مالي', en: 'Financial', icon: '💰' },
];

export function AttachmentsAndActivityCard() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const currentProjectId = useAppStore((s) => s.currentProjectId);

  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // جلب المرفقات
  const { data: attachments = [], isLoading: attLoading } = useQuery({
    queryKey: ['attachments', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return [];
      const res = await fetch(`/api/projects/${currentProjectId}/attachments`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.attachments ?? [];
    },
    enabled: !!currentProjectId,
  });

  // جلب سجل النشاطات
  const { data: logs = [] } = useQuery({
    queryKey: ['activity-logs', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return [];
      const res = await fetch(`/api/activity-logs?projectId=${currentProjectId}&limit=30`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs ?? [];
    },
    enabled: !!currentProjectId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category);
      fd.append('description', description);
      const res = await fetch(`/api/projects/${currentProjectId}/attachments`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', currentProjectId] });
      qc.invalidateQueries({ queryKey: ['activity-logs', currentProjectId] });
      toast({ title: locale === 'ar' ? 'تم رفع الملف' : 'File uploaded' });
      setDescription('');
    },
    onError: () => toast({ title: locale === 'ar' ? 'فشل الرفع' : 'Upload failed', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${currentProjectId}/attachments?attachmentId=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', currentProjectId] });
      toast({ title: locale === 'ar' ? 'تم الحذف' : 'Deleted' });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!currentProjectId) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* المرفقات */}
      <Card className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Paperclip className="size-5 text-cyan-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-md font-semibold">
              {locale === 'ar' ? 'مرفقات المستندات' : 'Document Attachments'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'ar' ? 'عقود، تراخيص، صور، مستندات (حد أقصى 10MB)' : 'Contracts, licenses, photos (max 10MB)'}
            </p>
          </div>
        </div>

        {/* رفع ملف */}
        <div className="space-y-2 mb-4 p-3 rounded-md bg-secondary/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{locale === 'ar' ? 'الفئة' : 'Category'}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.icon} {locale === 'ar' ? c.ar : c.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{locale === 'ar' ? 'وصف (اختياري)' : 'Description'}</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm h-8" placeholder="..." />
            </div>
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
          <Button size="sm" variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? '...' : <Upload className="size-4 me-1.5" />}
            {locale === 'ar' ? 'رفع ملف' : 'Upload File'}
          </Button>
        </div>

        {/* قائمة المرفقات */}
        <div className="space-y-2 max-h-72 overflow-y-auto pe-1">
          {attLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">{t('loading')}</div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Paperclip className="size-8 mx-auto mb-2 opacity-50" />
              {locale === 'ar' ? 'لا توجد مرفقات' : 'No attachments'}
            </div>
          ) : (
            attachments.map((att: any) => {
              const cat = CATEGORIES.find((c) => c.value === att.category) ?? CATEGORIES[0];
              return (
                <div key={att.id} className="flex items-start gap-2 p-2 rounded-md border bg-background/50">
                  <div className="text-xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{att.fileName}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[9px] h-4">{locale === 'ar' ? cat.ar : cat.en}</Badge>
                      <span>{formatSize(att.fileSize)}</span>
                      <span>{formatDistanceToNow(new Date(att.uploadedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}</span>
                    </div>
                    {att.description && <div className="text-[10px] text-muted-foreground mt-0.5">{att.description}</div>}
                  </div>
                  <Button size="sm" variant="ghost" className="size-6 p-0 text-destructive" onClick={() => deleteMutation.mutate(att.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* سجل النشاطات */}
      <Card className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
            <History className="size-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-md font-semibold">
              {locale === 'ar' ? 'سجل النشاطات' : 'Activity Log'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'ar' ? 'آخر التغييرات على المشروع (Audit Trail)' : 'Recent project changes (Audit Trail)'}
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pe-1">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Activity className="size-8 mx-auto mb-2 opacity-50" />
              {locale === 'ar' ? 'لا توجد نشاطات بعد' : 'No activities yet'}
            </div>
          ) : (
            logs.map((log: any) => {
              const actionColor: Record<string, string> = {
                create: 'bg-emerald-500/10 text-emerald-700',
                update: 'bg-blue-500/10 text-blue-700',
                delete: 'bg-red-500/10 text-red-700',
                upload: 'bg-cyan-500/10 text-cyan-700',
                export: 'bg-amber-500/10 text-amber-700',
                login: 'bg-purple-500/10 text-purple-700',
              };
              const actionIcon: Record<string, string> = {
                create: '✨',
                update: '✏️',
                delete: '🗑️',
                upload: '📎',
                export: '📤',
                login: '🔑',
              };
              return (
                <div key={log.id} className="flex items-start gap-2 p-2 rounded-md border bg-background/50">
                  <div className={`size-7 rounded-md flex items-center justify-center text-sm shrink-0 ${actionColor[log.action] ?? 'bg-muted'}`}>
                    {actionIcon[log.action] ?? '•'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs">
                      <Badge variant="outline" className={`text-[9px] h-4 me-1 ${actionColor[log.action] ?? ''}`}>
                        {log.action}
                      </Badge>
                      <span className="text-muted-foreground">{log.entity}</span>
                    </div>
                    {log.details && <div className="text-[11px] mt-0.5 truncate">{log.details}</div>}
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {log.userName && <span>{log.userName} • </span>}
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
