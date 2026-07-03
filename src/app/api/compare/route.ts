import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';

// POST /api/compare - مقارنة عدة مشاريع
// body: { ids: string[], currency: 'YER' }
export async function POST(req: NextRequest) {
  try {
    const { ids, currency = 'YER' } = await req.json();
    if (!Array.isArray(ids) || ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 project IDs required' }, { status: 400 });
    }

    const projects = await db.project.findMany({ where: { id: { in: ids } } });
    if (projects.length < 2) {
      return NextResponse.json({ error: 'Not enough projects found' }, { status: 404 });
    }

    const cur = CURRENCIES[currency as CurrencyCode] ?? CURRENCIES.YER;
    const rate = cur.rateToYER;

    const comparison = projects.map((p) => {
      const fin = (p.financialStudy as any) ?? {};
      const eco = (p.economicStudy as any) ?? {};
      const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
      const indicators = calculateIndicators({
        initialInvestment: Number(fin.initialInvestment) || 0,
        fixedAssets: Number(fin.fixedAssets) || 0,
        workingCapital: Number(fin.workingCapital) || 0,
        operatingCosts: Number(fin.operatingCosts) || 0,
        loans: Number(fin.loans) || 0,
        interestRate: Number(fin.interestRate) || 0,
        loanPeriod: Number(fin.loanPeriod) || 0,
        yearsData,
        discountRate: Number(eco.discountRate) || 10,
      });

      return {
        id: p.id,
        name: p.name,
        status: p.status,
        initialInvestment: Number(fin.initialInvestment) || 0,
        totalRevenues: indicators.totalRevenues,
        totalCosts: indicators.totalCosts,
        netProfit: indicators.totalNetProfit,
        npv: indicators.npv,
        irr: indicators.irr,
        paybackPeriod: indicators.paybackPeriod,
        roi: indicators.roi,
        profitabilityIndex: indicators.profitabilityIndex,
        isViable: indicators.isViable,
        yearsCount: yearsData.length,
      };
    });

    // إيجاد الأفضل لكل مؤشر
    const findBest = (key: keyof typeof comparison[0], higherIsBetter: boolean) => {
      const values = comparison.filter((c) => typeof c[key] === 'number' && c[key] !== null);
      if (!values.length) return null;
      const sorted = values.sort((a, b) => {
        const av = a[key] as number;
        const bv = b[key] as number;
        return higherIsBetter ? bv - av : av - bv;
      });
      return sorted[0].id;
    };

    const bestIds = {
      npv: findBest('npv', true),
      irr: findBest('irr', true),
      paybackPeriod: findBest('paybackPeriod', false),
      roi: findBest('roi', true),
      profitabilityIndex: findBest('profitabilityIndex', true),
      netProfit: findBest('netProfit', true),
    };

    return NextResponse.json({
      currency,
      currencyInfo: { name: cur.nameAr, symbol: cur.symbol, rate },
      projects: comparison,
      best: bestIds,
    });
  } catch (error) {
    console.error('POST /api/compare error:', error);
    return NextResponse.json({ error: 'Failed to compare' }, { status: 500 });
  }
}
