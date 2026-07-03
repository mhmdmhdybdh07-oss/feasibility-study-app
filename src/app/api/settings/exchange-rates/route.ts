import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

// GET /api/settings/exchange-rates
export async function GET() {
  try {
    const setting = await db.setting.findUnique({ where: { id: 'singleton' } });
    const storedRates = (setting?.data as any)?.rates ?? {};
    // ادمج المعدلات الافتراضية مع المخزنة
    const rates: Record<string, number> = {};
    for (const code of Object.keys(CURRENCIES)) {
      rates[code] = storedRates[code] ?? CURRENCIES[code as CurrencyCode].rateToYER;
    }
    return NextResponse.json({ rates });
  } catch (error) {
    console.error('GET /api/settings/exchange-rates:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/settings/exchange-rates
export async function PUT(req: NextRequest) {
  try {
    const { rates } = await req.json();
    if (!rates || typeof rates !== 'object') {
      return NextResponse.json({ error: 'Invalid rates' }, { status: 400 });
    }
    // تحقق من القيم
    const validRates: Record<string, number> = {};
    for (const [code, val] of Object.entries(rates)) {
      if (code in CURRENCIES) {
        const n = Number(val);
        if (!isNaN(n) && n > 0) validRates[code] = n;
      }
    }
    const setting = await db.setting.upsert({
      where: { id: 'singleton' },
      update: { data: { rates: validRates } },
      create: { id: 'singleton', data: { rates: validRates } },
    });
    return NextResponse.json({ rates: (setting.data as any).rates });
  } catch (error) {
    console.error('PUT /api/settings/exchange-rates:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
