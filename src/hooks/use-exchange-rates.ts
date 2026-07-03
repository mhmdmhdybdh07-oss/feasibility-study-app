'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { toast } from 'sonner';

export function useExchangeRates() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const res = await fetch('/api/settings/exchange-rates');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.rates as Record<string, number>;
    },
    initialData: Object.fromEntries(
      Object.entries(CURRENCIES).map(([k, v]) => [k, v.rateToYER])
    ),
  });

  const update = useMutation({
    mutationFn: async (rates: Record<string, number>) => {
      const res = await fetch('/api/settings/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchange-rates'] });
      toast.success('تم تحديث أسعار الصرف');
    },
    onError: () => toast.error('فشل تحديث أسعار الصرف'),
  });

  return { rates: query.data, ...query, update };
}
