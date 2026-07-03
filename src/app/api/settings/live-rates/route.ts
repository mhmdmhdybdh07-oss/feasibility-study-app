import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CURRENCIES } from '@/lib/currencies';

// GET /api/settings/live-rates - جلب أسعار صرف حية من API مجاني
export async function GET() {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        rates: Object.fromEntries(
          Object.entries(CURRENCIES).map(([k, v]) => [k, v.rateToYER])
        ),
        source: 'default',
        message: 'Live API unavailable',
      });
    }

    const data = await res.json();
    const usdRates = data.rates;
    const usdToYer = usdRates['YER'] ?? 530;

    const liveRates: Record<string, number> = { YER: 1, USD: usdToYer };

    for (const code of Object.keys(CURRENCIES)) {
      if (code === 'YER' || code === 'USD') continue;
      const rateVsUsd = usdRates[code];
      if (rateVsUsd && rateVsUsd > 0) {
        liveRates[code] = usdToYer / rateVsUsd;
      } else {
        liveRates[code] = CURRENCIES[code as keyof typeof CURRENCIES].rateToYER;
      }
    }

    await db.setting.upsert({
      where: { id: 'singleton' },
      update: { data: { rates: liveRates, source: 'live', updatedAt: new Date().toISOString() } },
      create: { id: 'singleton', data: { rates: liveRates, source: 'live', updatedAt: new Date().toISOString() } },
    });

    return NextResponse.json({
      success: true,
      rates: liveRates,
      source: 'live',
      timestamp: data.time_last_update_utc || new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/settings/live-rates:', error);
    return NextResponse.json({
      success: false,
      rates: Object.fromEntries(
        Object.entries(CURRENCIES).map(([k, v]) => [k, v.rateToYER])
      ),
      source: 'default',
      message: 'Live API unavailable',
    });
  }
}
