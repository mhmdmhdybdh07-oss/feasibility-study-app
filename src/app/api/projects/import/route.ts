import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

// POST /api/projects/import - استيراد مشروع من ملف Excel
// expects multipart/form-data with file field and optional name field
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || '';
    const displayCurrency = (formData.get('displayCurrency') as string) || 'YER';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });

    // خريطة أسماء الأوراق (عربي/إنجليزي) إلى مفاتيح الدراسة
    const sheetMap: Record<string, string> = {
      'تأسيس المشروع': 'establishment',
      'Establishment': 'establishment',
      'الدراسة الاجتماعية': 'socialStudy',
      'Social Study': 'socialStudy',
      'الدراسة البيئية': 'environmentalStudy',
      'Environmental Study': 'environmentalStudy',
      'الدراسة القانونية': 'legalStudy',
      'Legal Study': 'legalStudy',
      'الدراسة التسويقية': 'marketStudy',
      'Market Study': 'marketStudy',
      'الدراسة الفنية': 'technicalStudy',
      'Technical Study': 'technicalStudy',
      'الدراسة الاقتصادية': 'economicStudy',
      'Economic Study': 'economicStudy',
      'الدراسة المالية': 'financialStudy',
      'Financial Study': 'financialStudy',
    };

    const studies: Record<string, any> = {};
    let projectName = name;

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
      if (!json.length) continue;

      // ورقة معلومات المشروع
      if (sheetName.includes('معلومات') || sheetName.toLowerCase().includes('info')) {
        for (const row of json) {
          if (Array.isArray(row) && row[0] === 'اسم المشروع' && !projectName) {
            projectName = String(row[1] ?? '');
          }
        }
        continue;
      }

      const studyKey = sheetMap[sheetName];
      if (!studyKey) continue;

      // الصف الأول = عناوين الأعمدة [الحقل، القيمة]
      const data: Record<string, any> = {};
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!Array.isArray(row) || !row[0]) continue;
        const key = String(row[0]).trim();
        const val = row[1];
        if (val === undefined || val === null || val === '') continue;

        // محاولة تحويل الأرقام
        if (typeof val === 'number') {
          data[key] = val;
        } else if (typeof val === 'string') {
          const num = Number(val.replace(/,/g, '').replace(/[^\d.-]/g, ''));
          if (!isNaN(num) && val.match(/-?\d/)) {
            data[key] = num;
          } else {
            data[key] = val;
          }
        } else {
          data[key] = val;
        }
      }

      if (Object.keys(data).length) {
        studies[studyKey] = data;
      }
    }

    if (!projectName) {
      projectName = 'مشروع مستورد';
    }

    // إنشاء المشروع
    const project = await db.project.create({
      data: {
        name: projectName,
        description: `مشروع مستورد من ملف Excel - ${new Date().toLocaleString('ar')}`,
        mainCurrency: 'YER',
        displayCurrency,
        establishment: studies.establishment ?? null,
        socialStudy: studies.socialStudy ?? null,
        environmentalStudy: studies.environmentalStudy ?? null,
        legalStudy: studies.legalStudy ?? null,
        marketStudy: studies.marketStudy ?? null,
        technicalStudy: studies.technicalStudy ?? null,
        financialStudy: studies.financialStudy ?? null,
        economicStudy: studies.economicStudy ?? null,
      },
    });

    return NextResponse.json({ project, importedStudies: Object.keys(studies) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/import error:', error);
    return NextResponse.json({ error: 'Failed to import: ' + (error as Error).message }, { status: 500 });
  }
}
