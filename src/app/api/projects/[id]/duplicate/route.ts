import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/projects/[id]/duplicate - تكرار مشروع موجود
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newName = body.name;
    const original = await db.project.findUnique({ where: { id } });
    if (!original) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const duplicate = await db.project.create({
      data: {
        name: newName || `${original.name} (نسخة)`,
        description: original.description,
        status: 'draft',
        mainCurrency: original.mainCurrency,
        displayCurrency: original.displayCurrency,
        exchangeRates: original.exchangeRates as any,
        language: original.language,
        establishment: original.establishment as any,
        socialStudy: original.socialStudy as any,
        environmentalStudy: original.environmentalStudy as any,
        legalStudy: original.legalStudy as any,
        marketStudy: original.marketStudy as any,
        technicalStudy: original.technicalStudy as any,
        financialStudy: original.financialStudy as any,
        economicStudy: original.economicStudy as any,
      },
    });
    return NextResponse.json({ project: duplicate }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[id]/duplicate error:', error);
    return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 500 });
  }
}
