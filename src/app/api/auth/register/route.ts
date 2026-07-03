import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// POST /api/auth/register - تسجيل مستخدم جديد
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // أول مستخدم = admin
    const userCount = await db.user.count();
    const role = userCount === 0 ? 'admin' : 'analyst';

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { email, password: hashed, name: name || email.split('@')[0], role },
    });

    // إنشاء جلسة
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 يوم
    await db.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /auth/register:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
