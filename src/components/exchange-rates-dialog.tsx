'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useTranslation } from '@/hooks/use-translation';
import { CURRENCIES, setCustomRates } from '@/lib/currencies';
import { Loader2, RefreshCw, Save, Coins, TrendingUp } from 'lucide-react';

export function ExchangeRatesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, locale } = useTranslation();
  const { rates, isLoading, update } = useExchangeRates();
  // قاموس مؤقت للتعديلات المحلية
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [fetchingLive, setFetchingLive] = useState(false);

  const getCurrent = (code: string): number => {
    if (code in overrides) return overrides[code];
    if (rates && code in rates) return rates[code];
    return CURRENCIES[code as keyof typeof CURRENCIES]?.rateToYER ?? 1;
  };

  const handleChange = (code: string, value: string) => {
    const n = value === '' ? 0 : Number(value);
    if (!isNaN(n)) {
      setOverrides((prev) => ({ ...prev, [code]: n }));
    }
  };

  const handleSave = () => {
    // ادمج المعدلات الحالية مع التجاوزات
    const merged: Record<string, number> = {};
    for (const code of Object.keys(CURRENCIES)) {
      if (code === 'YER') continue;
      merged[code] = getCurrent(code);
    }
    update.mutate(merged, {
      onSuccess: () => {
        setCustomRates(merged);
        setOverrides({});
        onOpenChange(false);
      },
    });
  };

  const handleReset = () => {
    const defaults: Record<string, number> = {};
    for (const [k, v] of Object.entries(CURRENCIES)) defaults[k] = v.rateToYER;
    setOverrides(defaults);
  };

  const editableCurrencies = Object.values(CURRENCIES).filter((c) => c.code !== 'YER');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-primary" />
            {locale === 'ar' ? 'أسعار الصرف' : 'Exchange Rates'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'حدّث أسعار الصرف مقابل الريال اليمني (YER). القيم الافتراضية تقريبية.'
              : 'Update exchange rates against Yemeni Rial (YER). Default values are approximate.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : (
          <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto pe-1">
            {editableCurrencies.map((c) => {
              const current = getCurrent(c.code);
              const default_ = c.rateToYER;
              const isModified = current !== default_;
              return (
                <Card key={c.code} className={`p-3 ${isModified ? 'ring-1 ring-primary/30' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {c.symbol}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{locale === 'ar' ? c.nameAr : c.nameEn}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.code}
                          {isModified && <span className="text-primary ms-1">• {locale === 'ar' ? 'معدّل' : 'modified'}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={current}
                        onChange={(e) => handleChange(c.code, e.target.value)}
                        className="w-28 text-end font-mono"
                        step="0.01"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {locale === 'ar' ? 'ريال يمني' : 'YER'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter className="justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              <RefreshCw className="size-4 me-1.5" />
              {locale === 'ar' ? 'استعادة الافتراضي' : 'Reset'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setFetchingLive(true);
                try {
                  const res = await fetch('/api/settings/live-rates');
                  const data = await res.json();
                  if (data.success) {
                    setOverrides(data.rates);
                    toast({ title: locale === 'ar' ? '✅ تم جلب الأسعار الحية' : '✅ Live rates fetched', description: locale === 'ar' ? `مصدر: ${data.source}` : `Source: ${data.source}` });
                  } else {
                    toast({ title: locale === 'ar' ? '⚠️ استخدام القيم الافتراضية' : '⚠️ Using defaults', variant: 'destructive' });
                  }
                } catch {
                  toast({ title: locale === 'ar' ? 'فشل جلب الأسعار' : 'Failed', variant: 'destructive' });
                }
                setFetchingLive(false);
              }}
              disabled={fetchingLive}
            >
              {fetchingLive ? <Loader2 className="size-4 me-1.5 animate-spin" /> : <TrendingUp className="size-4 me-1.5" />}
              {locale === 'ar' ? 'أسعار حية' : 'Live Rates'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setOverrides({}); onOpenChange(false); }}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="size-4 me-1.5 animate-spin" /> : <Save className="size-4 me-1.5" />}
              {t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
