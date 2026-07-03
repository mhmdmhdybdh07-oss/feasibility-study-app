import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/projects - list all projects
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
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
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - create new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, mainCurrency = 'YER', displayCurrency = 'YER', language = 'ar' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        name,
        description: description ?? null,
        mainCurrency,
        displayCurrency,
        language,
        establishment: null,
        socialStudy: null,
        environmentalStudy: null,
        legalStudy: null,
        marketStudy: null,
        technicalStudy: null,
        financialStudy: null,
        economicStudy: null,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
