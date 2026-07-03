'use client';

import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/use-translation';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES, type GlossaryTerm } from '@/lib/glossary';
import { BookOpen, Search, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlossaryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { locale } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchesSearch = !search ||
        t.term.includes(search) ||
        t.termEn.toLowerCase().includes(search.toLowerCase()) ||
        t.definitionAr.includes(search);
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            {locale === 'ar' ? 'قاموس المصطلحات المالية والاقتصادية' : 'Financial & Economic Glossary'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? `${GLOSSARY_TERMS.length} مصطلح مالي واقتصادي مع التعريفات والصيغ`
              : `${GLOSSARY_TERMS.length} financial and economic terms with definitions and formulas`}
          </DialogDescription>
        </DialogHeader>

        {/* البحث والفلترة */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث عن مصطلح...' : 'Search term...'}
              className="ps-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="all">{locale === 'ar' ? 'الكل' : 'All'}</option>
            {Object.entries(GLOSSARY_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{locale === 'ar' ? v.ar : v.en}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
          {/* قائمة المصطلحات */}
          <ScrollArea className="h-[60vh] pe-2">
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="size-8 mx-auto mb-2 opacity-50" />
                  {locale === 'ar' ? 'لا توجد نتائج' : 'No results'}
                </div>
              ) : (
                filtered.map((t) => (
                  <Card
                    key={t.id}
                    className={cn(
                      'p-3 cursor-pointer transition-all',
                      selectedTerm?.id === t.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                    )}
                    onClick={() => setSelectedTerm(t)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{locale === 'ar' ? t.term : t.termEn}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {locale === 'ar' ? t.termEn : t.term}
                        </div>
                      </div>
                      <Badge className={cn('text-[9px] h-5', GLOSSARY_CATEGORIES[t.category].color)}>
                        {locale === 'ar' ? GLOSSARY_CATEGORIES[t.category].ar : GLOSSARY_CATEGORIES[t.category].en}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* تفاصيل المصطلح */}
          <ScrollArea className="h-[60vh] ps-2">
            {selectedTerm ? (
              <Card className="p-4">
                <h3 className="text-lg font-bold mb-1">
                  {locale === 'ar' ? selectedTerm.term : selectedTerm.termEn}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {locale === 'ar' ? selectedTerm.termEn : selectedTerm.term}
                </p>

                <Badge className={cn('mb-3', GLOSSARY_CATEGORIES[selectedTerm.category].color)}>
                  {locale === 'ar' ? GLOSSARY_CATEGORIES[selectedTerm.category].ar : GLOSSARY_CATEGORIES[selectedTerm.category].en}
                </Badge>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground mb-1">
                      {locale === 'ar' ? 'التعريف:' : 'Definition:'}
                    </div>
                    <p className="leading-relaxed">
                      {locale === 'ar' ? selectedTerm.definitionAr : selectedTerm.definitionEn}
                    </p>
                  </div>

                  {selectedTerm.formula && (
                    <div>
                      <div className="font-semibold text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calculator className="size-3" />
                        {locale === 'ar' ? 'الصيغة:' : 'Formula:'}
                      </div>
                      <div className="p-2 rounded-md bg-secondary/50 font-mono text-xs" dir="ltr">
                        {selectedTerm.formula}
                      </div>
                    </div>
                  )}

                  {selectedTerm.example && (
                    <div>
                      <div className="font-semibold text-xs text-muted-foreground mb-1">
                        {locale === 'ar' ? 'مثال:' : 'Example:'}
                      </div>
                      <p className="leading-relaxed text-xs p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border-s-2 border-amber-500">
                        {selectedTerm.example}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="size-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {locale === 'ar' ? 'اختر مصطلحاً لعرض تعريفه' : 'Select a term to view its definition'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {locale === 'ar' ? `عرض ${filtered.length} من ${GLOSSARY_TERMS.length} مصطلح` : `Showing ${filtered.length} of ${GLOSSARY_TERMS.length} terms`}
        </div>
      </DialogContent>
    </Dialog>
  );
}
