import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/stats - إحصائيات عامة للوحة المطورين
export async function GET() {
  try {
    const [projectCount, userCount, attachmentCount, activityCount] = await Promise.all([
      db.project.count(),
      db.user.count(),
      db.attachment.count(),
      db.activityLog.count(),
    ]);

    const projectsByStatus = await db.project.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const recentActivities = await db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, action: true, entity: true, details: true, createdAt: true },
    });

    return NextResponse.json({
      totals: {
        projects: projectCount,
        users: userCount,
        attachments: attachmentCount,
        activities: activityCount,
      },
      projectsByStatus: projectsByStatus.map((p) => ({ status: p.status, count: p._count.status })),
      recentActivities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/v1/stats:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
