import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PUT /api/projects/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allowedFields = [
      'name', 'description', 'status', 'establishment', 'socialStudy',
      'environmentalStudy', 'legalStudy', 'marketStudy', 'technicalStudy',
      'financialStudy', 'economicStudy', 'mainCurrency', 'displayCurrency',
      'exchangeRates', 'language',
      'swotAnalysis', 'porterAnalysis', 'riskRegister', 'projectPhases', 'kpiData',
      'customFields', 'resources',
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (f in body) data[f] = body[f];
    }
    const project = await db.project.update({ where: { id }, data });

    // سجل النشاط: حدّث المجالات التي تغيرت
    const changedFields = Object.keys(data);
    if (changedFields.length > 0) {
      try {
        await db.activityLog.create({
          data: {
            projectId: id,
            action: 'update',
            entity: changedFields.length === 1 ? changedFields[0] : 'project',
            details: `Updated: ${changedFields.join(', ')}`,
          },
        });
      } catch (e) {
        console.error('Activity log failed:', e);
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
