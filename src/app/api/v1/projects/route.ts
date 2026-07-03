import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// REST API للمطورين: GET /api/v1/projects?key=API_KEY
export async function GET(req: NextRequest) {
  try {
    // تحقق من API key (بسيط - يمكن تطويره)
    const apiKey = req.headers.get('x-api-key') || new URL(req.url).searchParams.get('key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required. Pass via x-api-key header or ?key= param' }, { status: 401 });
    }

    const projects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        mainCurrency: true,
        displayCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('GET /api/v1/projects:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// إنشاء مشروع جديد عبر API
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        mainCurrency: body.mainCurrency ?? 'YER',
        displayCurrency: body.displayCurrency ?? 'YER',
        establishment: body.establishment ?? null,
        socialStudy: body.socialStudy ?? null,
        environmentalStudy: body.environmentalStudy ?? null,
        legalStudy: body.legalStudy ?? null,
        marketStudy: body.marketStudy ?? null,
        technicalStudy: body.technicalStudy ?? null,
        financialStudy: body.financialStudy ?? null,
        economicStudy: body.economicStudy ?? null,
      },
    });

    await db.activityLog.create({
      data: {
        projectId: project.id,
        action: 'create',
        entity: 'project',
        details: `Created via API: ${body.name}`,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/projects:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
