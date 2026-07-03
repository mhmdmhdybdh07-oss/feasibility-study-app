import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// GET - list attachments
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const attachments = await db.attachment.findMany({
      where: { projectId: id },
      orderBy: { uploadedAt: 'desc' },
    });
    return NextResponse.json({ attachments });
  } catch (error) {
    console.error('GET attachments:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST - upload attachment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';
    const description = (formData.get('description') as string) || '';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // حجم أقصى 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // التأكد من وجود مجلد الرفع
    const uploadDir = path.join(process.cwd(), 'uploads', id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // حفظ الملف
    const safeName = file.name.replace(/[^\w\.\-]/g, '_');
    const fileName = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // حفظ في قاعدة البيانات
    const attachment = await db.attachment.create({
      data: {
        projectId: id,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        filePath: `uploads/${id}/${fileName}`,
        category,
        description,
      },
    });

    // سجل النشاط
    await db.activityLog.create({
      data: {
        projectId: id,
        action: 'upload',
        entity: 'attachment',
        details: `Uploaded ${file.name} (${category})`,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error('POST attachment:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

// DELETE - remove attachment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const attachmentId = url.searchParams.get('attachmentId');
    if (!attachmentId) return NextResponse.json({ error: 'attachmentId required' }, { status: 400 });

    await db.attachment.delete({ where: { id: attachmentId, projectId: id } });
    await db.activityLog.create({
      data: { projectId: id, action: 'delete', entity: 'attachment', details: 'Deleted attachment' },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE attachment:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
