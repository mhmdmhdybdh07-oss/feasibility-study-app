import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';

// POST /api/projects/sample - إنشاء مشروع من العينات
export async function POST(req: NextRequest) {
  try {
    const { sampleId } = await req.json();
    const sample = SAMPLE_PROJECTS.find((s) => s.id === sampleId);
    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }

    const data = sample.data;
    const project = await db.project.create({
      data: {
        name: data.name!,
        description: data.description ?? null,
        mainCurrency: 'YER',
        displayCurrency: 'YER',
        establishment: data.establishment ?? null,
        socialStudy: data.socialStudy ?? null,
        environmentalStudy: data.environmentalStudy ?? null,
        legalStudy: data.legalStudy ?? null,
        marketStudy: data.marketStudy ?? null,
        technicalStudy: data.technicalStudy ?? null,
        financialStudy: data.financialStudy ?? null,
        economicStudy: data.economicStudy ?? null,
        riskRegister: (data as any).riskRegister ?? null,
        projectPhases: (data as any).projectPhases ?? null,
        swotAnalysis: (data as any).swotAnalysis ?? null,
      },
    });

    await db.activityLog.create({
      data: {
        projectId: project.id,
        action: 'create',
        entity: 'project',
        details: `Created from sample: ${sample.nameAr}`,
      },
    });

    return NextResponse.json({ project, sample }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/sample:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET - قائمة المشاريع النموذجية
export async function GET() {
  return NextResponse.json({
    samples: SAMPLE_PROJECTS.map((s) => ({
      id: s.id,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      icon: s.icon,
      descriptionAr: s.descriptionAr,
      descriptionEn: s.descriptionEn,
    })),
  });
}
