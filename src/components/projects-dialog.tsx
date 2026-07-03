'use client';

import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects, useDeleteProject, useDuplicateProject, type ProjectListItem } from '@/hooks/use-projects';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Trash2, Calendar, Copy, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
};

export function ProjectsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { data: projects, isLoading } = useProjects();
  const setCurrentProjectId = useAppStore((s) => s.setCurrentProjectId);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const deleteProject = useDeleteProject();
  const duplicateProject = useDuplicateProject();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleOpen = (id: string) => {
    setCurrentProjectId(id);
    setActiveSection('establishment');
    onOpenChange(false);
    toast({ title: t('openProject') });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete'))) {
      deleteProject.mutate(id);
    }
  };

  const handleDuplicate = (p: ProjectListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt(locale === 'ar' ? `اسم المشروع الجديد:` : 'New project name:', `${p.name} (نسخة)`);
    if (name) {
      duplicateProject.mutate({ id: p.id, name });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('myProjects')}</DialogTitle>
          <DialogDescription>{t('openProject')}</DialogDescription>
        </DialogHeader>

        {/* شريط البحث */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث بالاسم أو الوصف...' : 'Search by name or description...'}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="size-3.5 me-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="draft">{t('statusDraft')}</SelectItem>
              <SelectItem value="in-progress">{t('statusInProgress')}</SelectItem>
              <SelectItem value="completed">{t('statusCompleted')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* القائمة */}
        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-50" />
              <p>{search || statusFilter !== 'all' ? (locale === 'ar' ? 'لا توجد نتائج' : 'No results') : t('noData')}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filtered.map((p: ProjectListItem) => (
                <Card
                  key={p.id}
                  className="p-3 hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => handleOpen(p.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className={STATUS_COLORS[p.status] ?? ''}>
                            {t(p.status === 'in-progress' ? 'statusInProgress' : p.status === 'completed' ? 'statusCompleted' : 'statusDraft')}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDistanceToNow(new Date(p.updatedAt), {
                              addSuffix: true,
                              locale: locale === 'ar' ? ar : enUS,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleDuplicate(p, e)}
                        title={locale === 'ar' ? 'تكرار' : 'Duplicate'}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(p.id, e)}
                        title={t('delete')}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {(projects?.length ?? 0) > 0 && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {locale === 'ar' ? `عرض ${filtered.length} من ${projects?.length ?? 0} مشروع` : `Showing ${filtered.length} of ${projects?.length ?? 0} projects`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
