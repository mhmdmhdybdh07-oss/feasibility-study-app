import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/activity-logs?projectId=xxx&limit=50
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);

    const where = projectId ? { projectId } : {};
    const logs = await db.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('GET activity-logs:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
