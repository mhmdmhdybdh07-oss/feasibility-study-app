'use client';

import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { useTranslation } from '@/hooks/use-translation';
import { Coins } from 'lucide-react';

interface Props {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
}

// حقل إدخال مبالغ بعملة العرض - يحفظ القيمة بالريال اليمني خلف الكواليس
export function FieldWithCurrency({ value, onChange, placeholder }: Props) {
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { locale } = useTranslation();
  const cur = CURRENCIES[displayCurrency as CurrencyCode];

  // value مخزّن بالريال اليمني دائماً. نعرضه محوّلاً لعملة العرض عند التحرير نتعامل مع القيمة المعروضة
  const displayValue = value === '' || value == null ? '' : String((Number(value) / cur.rateToYER).toFixed(2));

  const handleChange = (v: string) => {
    if (v === '') {
      onChange('');
      return;
    }
    const num = Number(v);
    if (isNaN(num)) return;
    // حوّل من عملة العرض إلى الريال اليمني
    const yer = num * cur.rateToYER;
    onChange(String(yer));
  };

  return (
    <div className="relative">
      <Input
        type="number"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pe-20"
        step="0.01"
      />
      <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-xs text-muted-foreground pointer-events-none">
        <Coins className="size-3 me-1" />
        {cur.symbol}
      </div>
    </div>
  );
}
