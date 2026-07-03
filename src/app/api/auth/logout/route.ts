import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// POST /api/auth/logout - تسجيل الخروج
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (token) {
      await db.session.deleteMany({ where: { token } });
    }
    cookieStore.delete('session_token');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /auth/logout:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
