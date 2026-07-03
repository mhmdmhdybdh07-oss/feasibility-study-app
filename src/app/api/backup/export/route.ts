import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/backup/export - تصدير جميع المشاريع كملف JSON واحد
export async function GET() {
  try {
    const projects = await db.project.findMany();
    const settings = await db.setting.findUnique({ where: { id: 'singleton' } });

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projectsCount: projects.length,
      projects,
      settings: settings?.data ?? null,
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    return new NextResponse(jsonStr, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="feasibility-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('GET /backup/export:', error);
    return NextResponse.json({ error: 'Failed to export backup' }, { status: 500 });
  }
}
