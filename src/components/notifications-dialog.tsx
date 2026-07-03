'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useProjects } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  Bell, CheckCircle2, AlertCircle, Info, Clock, FileText,
  TrendingUp, TrendingDown, Wallet, Trash2, FolderOpen, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  time: string;
  action?: string;
}

export function NotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { data: projects } = useProjects();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  // توليد إشعارات ذكية بناءً على حالة المشاريع
  const notifs = useMemo(() => {
    if (!projects) return [];
    const result: Notification[] = [];
    const now = new Date().toISOString();

    projects.forEach((p) => {
      const createdHours = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60);
      if (createdHours < 24) {
        result.push({ id: `new-${p.id}`, type: 'success', title: locale === 'ar' ? 'مشروع جديد' : 'New Project', description: `"${p.name}" ${locale === 'ar' ? 'تم إنشاؤه' : 'was created'}`, time: p.createdAt });
      }
      const updatedHours = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60);
      if (updatedHours > 72 && p.status === 'draft') {
        result.push({ id: `stale-${p.id}`, type: 'warning', title: locale === 'ar' ? 'مشروع غير محدّث' : 'Stale Project', description: `"${p.name}" ${locale === 'ar' ? 'لم يُحدث منذ 3 أيام' : 'not updated for 3+ days'}`, time: p.updatedAt });
      }
      if (p.status === 'completed') {
        result.push({ id: `done-${p.id}`, type: 'info', title: locale === 'ar' ? 'مشروع مكتمل' : 'Completed', description: `"${p.name}" ${locale === 'ar' ? 'اكتملت دراسته' : 'study is complete'}`, time: p.updatedAt });
      }
    });

    if (projects.length === 0) {
      result.push({ id: 'welcome', type: 'info', title: locale === 'ar' ? 'مرحباً!' : 'Welcome!', description: locale === 'ar' ? 'ابدأ بإنشاء مشروعك الأول' : 'Start by creating your first project', time: now });
    } else if (projects.length >= 5) {
      result.push({ id: 'milestone', type: 'success', title: locale === 'ar' ? 'إنجاز!' : 'Milestone!', description: locale === 'ar' ? `لديك ${projects.length} مشاريع! جرّب المقارنة` : `You have ${projects.length} projects! Try compare`, time: now });
    }

    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [projects, locale]);

  useEffect(() => {
    if (open) {
      setNotifications(notifs);
      setUnread(notifs.length);
    }
  }, [open, notifs]);

  const config = {
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900' },
    warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
            {unread > 0 && <Badge className="bg-red-500 text-white text-[10px]">{unread}</Badge>}
          </DialogTitle>
          <DialogDescription>
            {notifications.length} {locale === 'ar' ? 'إشعار' : 'notifications'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pe-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="size-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const cfg = config[n.type];
                const Icon = cfg.icon;
                return (
                  <div key={n.id} className={cn('p-3 rounded-lg border flex items-start gap-2', cfg.bg, cfg.border)}>
                    <Icon className={cn('size-5 shrink-0 mt-0.5', cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.description}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(n.time), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* إجراءات سريعة */}
        <div className="pt-2 border-t flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => { onOpenChange(false); }}>
            <Plus className="size-4 me-1" />
            {locale === 'ar' ? 'مشروع جديد' : 'New'}
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => { onOpenChange(false); }}>
            <FolderOpen className="size-4 me-1" />
            {locale === 'ar' ? 'فتح' : 'Open'}
          </Button>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setUnread(0); }}>
              <CheckCircle2 className="size-4 me-1" />
              {locale === 'ar' ? 'تم' : 'Done'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
