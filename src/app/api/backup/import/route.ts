import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/backup/import - استيراد نسخة احتياطية
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'merge'; // merge | replace

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    let backup: any;
    try {
      backup = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    if (!backup.projects || !Array.isArray(backup.projects)) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    if (mode === 'replace') {
      await db.project.deleteMany();
    }

    for (const p of backup.projects) {
      try {
        // تحقق من التكرار في وضع merge
        if (mode === 'merge') {
          const existing = await db.project.findUnique({ where: { id: p.id } });
          if (existing) {
            // تجاوز أو حدّث
            await db.project.update({ where: { id: p.id }, data: { ...p, id: undefined } });
            imported++;
            continue;
          }
        }

        await db.project.create({
          data: {
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status ?? 'draft',
            mainCurrency: p.mainCurrency ?? 'YER',
            displayCurrency: p.displayCurrency ?? 'YER',
            exchangeRates: p.exchangeRates ?? null,
            language: p.language ?? 'ar',
            establishment: p.establishment ?? null,
            socialStudy: p.socialStudy ?? null,
            environmentalStudy: p.environmentalStudy ?? null,
            legalStudy: p.legalStudy ?? null,
            marketStudy: p.marketStudy ?? null,
            technicalStudy: p.technicalStudy ?? null,
            financialStudy: p.financialStudy ?? null,
            economicStudy: p.economicStudy ?? null,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(),
          },
        });
        imported++;
      } catch (e) {
        console.error('Failed to import project:', e);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: backup.projects.length,
    });
  } catch (error) {
    console.error('POST /backup/import:', error);
    return NextResponse.json({ error: 'Failed to import backup' }, { status: 500 });
  }
}
