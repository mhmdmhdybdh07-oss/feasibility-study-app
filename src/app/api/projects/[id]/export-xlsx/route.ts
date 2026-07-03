import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

// GET /api/projects/[id]/export-xlsx?currency=YER
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const currency = (url.searchParams.get('currency') || 'YER') as CurrencyCode;
    const cur = CURRENCIES[currency] ?? CURRENCIES.YER;
    const rate = cur.rateToYER;

    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const wb = XLSX.utils.book_new();

    // ورقة 1: معلومات المشروع
    const infoData = [
      ['اسم المشروع', project.name],
      ['الوصف', project.description ?? ''],
      ['التاريخ', new Date().toLocaleString('ar')],
      ['العملة', `${cur.nameAr} (${cur.symbol})`],
      ['معدل الصرف مقابل الريال اليمني', rate],
      [],
      ['مؤشرات الاقتصادية', ''],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, infoSheet, 'معلومات المشروع');

    // دالة مساعدة لتحويل مبلغ YER إلى عملة العرض
    const convert = (yer: number) => Number((yer / rate).toFixed(2));

    // أوراق الدراسات
    const studySheets: Array<[string, any]> = [
      ['تأسيس المشروع', project.establishment],
      ['الدراسة الاجتماعية', project.socialStudy],
      ['الدراسة البيئية', project.environmentalStudy],
      ['الدراسة القانونية', project.legalStudy],
      ['الدراسة التسويقية', project.marketStudy],
      ['الدراسة الفنية', project.technicalStudy],
      ['الدراسة الاقتصادية', project.economicStudy],
    ];

    for (const [sheetName, data] of studySheets) {
      if (data && typeof data === 'object') {
        const rows: any[][] = [['الحقل', 'القيمة']];
        for (const [k, v] of Object.entries(data)) {
          if (v === null || v === undefined || v === '') continue;
          let displayVal: any = v;
          // المبالغ المخزنة كـ YER - حوّلها
          if (typeof v === 'number' && v > 1000 && (
            k.toLowerCase().includes('capital') ||
            k.toLowerCase().includes('cost') ||
            k.toLowerCase().includes('revenue') ||
            k.toLowerCase().includes('investment') ||
            k.toLowerCase().includes('wages') ||
            k.toLowerCase().includes('assets') ||
            k.toLowerCase().includes('price')
          )) {
            displayVal = convert(v);
          }
          rows.push([k, displayVal]);
        }
        const sheet = XLSX.utils.aoa_to_sheet(rows);
        sheet['!cols'] = [{ wch: 30 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, sheet, sheetName);
      }
    }

    // ورقة الدراسة المالية - جدول السنوات
    const fin = project.financialStudy as any;
    if (fin && Array.isArray(fin.yearsData) && fin.yearsData.length) {
      const finRows: any[][] = [
        ['البند', ...fin.yearsData.map((_: any, i: number) => `السنة ${i + 1}`), 'الإجمالي'],
        ['الإيرادات', ...fin.yearsData.map((y: any) => convert(Number(y.revenues) || 0)), convert(fin.yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0), 0))],
        ['التكاليف', ...fin.yearsData.map((y: any) => convert(Number(y.costs) || 0)), convert(fin.yearsData.reduce((s: number, y: any) => s + (Number(y.costs) || 0), 0))],
        ['صافي التدفق', ...fin.yearsData.map((y: any) => convert((Number(y.revenues) || 0) - (Number(y.costs) || 0))), convert(fin.yearsData.reduce((s: number, y: any) => s + (Number(y.revenues) || 0) - (Number(y.costs) || 0), 0))],
        [],
        ['الاستثمار الأولي', convert(Number(fin.initialInvestment) || 0)],
        ['الأصول الثابتة', convert(Number(fin.fixedAssets) || 0)],
        ['رأس المال العامل', convert(Number(fin.workingCapital) || 0)],
        ['التكاليف التشغيلية', convert(Number(fin.operatingCosts) || 0)],
        ['القروض', convert(Number(fin.loans) || 0)],
        ['معدل الفائدة %', fin.interestRate ?? ''],
        ['مدة القرض', fin.loanPeriod ?? ''],
      ];
      const finSheet = XLSX.utils.aoa_to_sheet(finRows);
      XLSX.utils.book_append_sheet(wb, finSheet, 'الدراسة المالية');
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const safeNameAscii = project.name.replace(/[^\x00-\x7F]/g, '_').replace(/[^\w\.\- ]/g, '_').slice(0, 60) || 'project';
    const safeNameUtf8 = encodeURIComponent(project.name.replace(/[^\p{L}\p{N}\-_ ]/gu, '_').slice(0, 60));
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeNameAscii}.xlsx"; filename*=UTF-8''${safeNameUtf8}.xlsx`,
      },
    });
  } catch (error) {
    console.error('GET /export-xlsx error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
