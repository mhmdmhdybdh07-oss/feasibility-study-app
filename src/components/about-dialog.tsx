'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { BarChart3, Coins, Languages, FileDown } from 'lucide-react';

export function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('helpAbout')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 text-center">
          <div className="size-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mx-auto">
            <BarChart3 className="size-9" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('appTitle')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('appSubtitle')}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {locale === 'ar' ? 'الإصدار 1.0.0' : 'Version 1.0.0'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
              <Languages className="size-4 text-primary" />
              <span>{locale === 'ar' ? 'عربي / إنجليزي' : 'Arabic / English'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
              <Coins className="size-4 text-primary" />
              <span>{locale === 'ar' ? 'ريال يمني + تبديل' : 'YER + switching'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
              <FileDown className="size-4 text-primary" />
              <span>{locale === 'ar' ? 'تصدير متعدد' : 'Multi export'}</span>
            </div>
          </div>
          <DialogDescription className="text-[11px] leading-relaxed">
            {locale === 'ar'
              ? 'برنامج متكامل لإعداد دراسات الجدوى يشمل الدراسات التأسيسية والاجتماعية والبيئية والقانونية والتسويقية والفنية والمالية والاقتصادية.'
              : 'Comprehensive feasibility study builder covering establishment, social, environmental, legal, market, technical, financial and economic studies.'}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
