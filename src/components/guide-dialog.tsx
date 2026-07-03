'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

export function GuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const steps = [t('guideStep1'), t('guideStep2'), t('guideStep3'), t('guideStep4'), t('guideStep5')];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('guideTitle')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 py-2 pe-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Check className="size-3.5" />
                </div>
                <p className="text-sm leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
