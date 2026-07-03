import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { calculateIndicators } from '@/lib/calculations';
import PptxGenJS from 'pptxgenjs';

// GET /api/projects/[id]/export-pptx?currency=YER
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const currency = (url.searchParams.get('currency') || 'YER') as CurrencyCode;
    const cur = CURRENCIES[currency] ?? CURRENCIES.YER;

    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const fin = (project.financialStudy as any) ?? {};
    const eco = (project.economicStudy as any) ?? {};
    const establishment = (project.establishment as any) ?? {};
    const market = (project.marketStudy as any) ?? {};
    const technical = (project.technicalStudy as any) ?? {};
    const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];

    const indicators = calculateIndicators({
      initialInvestment: Number(fin.initialInvestment) || 0,
      fixedAssets: Number(fin.fixedAssets) || 0,
      workingCapital: Number(fin.workingCapital) || 0,
      operatingCosts: Number(fin.operatingCosts) || 0,
      loans: Number(fin.loans) || 0,
      interestRate: Number(fin.interestRate) || 0,
      loanPeriod: Number(fin.loanPeriod) || 0,
      yearsData,
      discountRate: Number(eco.discountRate) || 10,
    });

    const fmt = (yer: number) => {
      const v = yer / cur.rateToYER;
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' ' + cur.symbol;
    };

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9
    pptx.author = 'Feasibility Study Builder';
    pptx.subject = project.name;

    // الألوان
    const PRIMARY = '0D9488';
    const DARK = '1F2937';
    const LIGHT = 'F3F4F6';
    const GREEN = '10B981';
    const RED = 'EF4444';

    // === Slide 1: الغلاف ===
    const slide1 = pptx.addSlide();
    slide1.background = { color: PRIMARY };
    slide1.addText('دراسة الجدوى', {
      x: 0.5, y: 2, w: 9, h: 1,
      fontSize: 44, bold: true, color: 'FFFFFF', align: 'center',
    });
    slide1.addText(project.name, {
      x: 0.5, y: 3.2, w: 9, h: 0.8,
      fontSize: 32, color: 'FFFFFF', align: 'center',
    });
    if (project.description) {
      slide1.addText(project.description, {
        x: 1, y: 4.2, w: 8, h: 0.6,
        fontSize: 16, color: 'E0E0E0', align: 'center',
      });
    }
    slide1.addText(new Date().toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' }), {
      x: 0.5, y: 6.5, w: 9, h: 0.4,
      fontSize: 14, color: 'B0E0E0', align: 'center',
    });

    // === Slide 2: الملخص التنفيذي ===
    const slide2 = pptx.addSlide();
    slide2.addText('الملخص التنفيذي', { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 28, bold: true, color: PRIMARY });
    slide2.addShape('rect', { x: 0.5, y: 1, w: 9, h: 0.05, fill: { color: PRIMARY } });

    const summaryItems: Array<[string, string]> = [
      ['نوع المشروع', establishment.projectType || '—'],
      ['القطاع', establishment.projectSector || '—'],
      ['الموقع', establishment.projectLocation || '—'],
      ['الاستثمار الأولي', fmt(Number(fin.initialInvestment) || 0)],
      ['مدة المشروع', `${establishment.projectDuration || '—'} سنوات`],
      ['العملة', `${cur.nameAr} (${cur.symbol})`],
    ];
    summaryItems.forEach(([label, value], i) => {
      const y = 1.3 + i * 0.55;
      slide2.addText(label, { x: 0.5, y, w: 4, h: 0.4, fontSize: 14, color: DARK, bold: true, fill: { color: LIGHT } });
      slide2.addText(value, { x: 4.5, y, w: 5, h: 0.4, fontSize: 14, color: DARK });
    });

    // === Slide 3: المؤشرات المالية ===
    const slide3 = pptx.addSlide();
    slide3.addText('المؤشرات المالية الرئيسية', { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 28, bold: true, color: PRIMARY });
    slide3.addShape('rect', { x: 0.5, y: 1, w: 9, h: 0.05, fill: { color: PRIMARY } });

    const kpis: Array<[string, string, string]> = [
      ['NPV', fmt(indicators.npv), indicators.npv >= 0 ? GREEN : RED],
      ['IRR', indicators.irr !== null ? `${indicators.irr.toFixed(2)}%` : '—', DARK],
      ['ROI', `${indicators.roi.toFixed(2)}%`, DARK],
      ['فترة الاسترداد', indicators.paybackPeriod !== null ? `${indicators.paybackPeriod.toFixed(2)} سنوات` : '—', DARK],
      ['مؤشر الربحية', indicators.profitabilityIndex.toFixed(2), DARK],
      ['إجمالي الإيرادات', fmt(indicators.totalRevenues), GREEN],
      ['إجمالي التكاليف', fmt(indicators.totalCosts), RED],
      ['صافي الربح', fmt(indicators.totalNetProfit), indicators.totalNetProfit >= 0 ? GREEN : RED],
    ];

    // 2x4 grid
    kpis.forEach((kp, i) => {
      const [label, value, color] = kp;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 4.7;
      const y = 1.3 + row * 1.2;
      slide3.addShape('roundRect', { x, y, w: 4.5, h: 1, rectRadius: 0.1, fill: { color: LIGHT }, line: { color: PRIMARY, width: 1 } });
      slide3.addText(label, { x: x + 0.2, y: y + 0.1, w: 4, h: 0.4, fontSize: 14, color: DARK });
      slide3.addText(value, { x: x + 0.2, y: y + 0.5, w: 4, h: 0.5, fontSize: 22, bold: true, color });
    });

    // === Slide 4: الجدوى ===
    const slide4 = pptx.addSlide();
    slide4.background = { color: indicators.isViable ? GREEN : RED };
    slide4.addText(indicators.isViable ? '✓ المشروع مجدي' : '✗ المشروع غير مجدي', {
      x: 0.5, y: 2.5, w: 9, h: 1.2,
      fontSize: 48, bold: true, color: 'FFFFFF', align: 'center',
    });
    slide4.addText(
      indicators.isViable
        ? `NPV موجب (${fmt(indicators.npv)}) وIRR يتجاوز معدل الخصم`
        : `NPV سالب أو IRR أقل من معدل الخصم`,
      { x: 1, y: 3.8, w: 8, h: 0.8, fontSize: 18, color: 'FFFFFF', align: 'center' }
    );

    // === Slide 5: التدفق النقدي ===
    if (yearsData.length > 0) {
      const slide5 = pptx.addSlide();
      slide5.addText('التدفق النقدي السنوي', { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 28, bold: true, color: PRIMARY });
      slide5.addShape('rect', { x: 0.5, y: 1, w: 9, h: 0.05, fill: { color: PRIMARY } });

      const chartData = [
        {
          name: 'الإيرادات',
          labels: yearsData.map((y: any) => `السنة ${y.year}`),
          values: yearsData.map((y: any) => Math.round((Number(y.revenues) || 0) / cur.rateToYER)),
        },
        {
          name: 'التكاليف',
          labels: yearsData.map((y: any) => `السنة ${y.year}`),
          values: yearsData.map((y: any) => Math.round((Number(y.costs) || 0) / cur.rateToYER)),
        },
      ];
      slide5.addChart(pptx.ChartType.bar, chartData, {
        x: 0.5, y: 1.3, w: 9, h: 5,
        barDir: 'col',
        chartColors: [GREEN, RED],
        showLegend: true,
        legendPos: 'b',
        valAxisNumFmt: '#,##0',
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 10,
      });
    }

    // === Slide 6: الدراسة التسويقية ===
    const slide6 = pptx.addSlide();
    slide6.addText('الدراسة التسويقية', { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 28, bold: true, color: PRIMARY });
    slide6.addShape('rect', { x: 0.5, y: 1, w: 9, h: 0.05, fill: { color: PRIMARY } });

    const marketItems: Array<[string, string]> = [
      ['العملاء المستهدفون', market.targetCustomers || '—'],
      ['الحصة السوقية المتوقعة', `${market.expectedShare || 0}%`],
      ['معدل النمو السنوي', `${market.growthRate || 0}%`],
      ['المنافسون', market.competitors || '—'],
      ['الميزة التنافسية', market.competitiveAdvantage || '—'],
      ['قنوات التوزيع', market.distribution || '—'],
    ];
    marketItems.forEach(([label, value], i) => {
      const y = 1.3 + i * 0.55;
      slide6.addText(label, { x: 0.5, y, w: 3.5, h: 0.4, fontSize: 12, color: DARK, bold: true, fill: { color: LIGHT } });
      slide6.addText(value, { x: 4, y, w: 5.5, h: 0.4, fontSize: 12, color: DARK });
    });

    // === Slide 7: التوصيات ===
    const slide7 = pptx.addSlide();
    slide7.addText('التوصيات', { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 28, bold: true, color: PRIMARY });
    slide7.addShape('rect', { x: 0.5, y: 1, w: 9, h: 0.05, fill: { color: PRIMARY } });

    const recs = [
      indicators.isViable ? 'المضي قدماً في التنفيذ مع مراقبة دورية' : 'إعادة هيكلة المشروع قبل التنفيذ',
      'تنويع مصادر الإيرادات لتقليل المخاطر',
      'التفاوض مع الموردين لتقليل التكاليف',
      'بناء احتياطي نقدي للطوارئ (10-15%)',
      'وضع خطة بديلة في حال انخفاض الإيرادات',
    ];
    recs.forEach((rec, i) => {
      slide7.addText(`✓ ${rec}`, {
        x: 0.8, y: 1.5 + i * 0.7, w: 8.5, h: 0.5,
        fontSize: 16, color: DARK, bullet: false,
      });
    });

    // توليد الملف
    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    // اسم آمن لـ ASCII (للـ filename العادي) + اسم UTF-8 (للـ filename*)
    const safeNameAscii = project.name.replace(/[^\x00-\x7F]/g, '_').replace(/[^\w\.\- ]/g, '_').slice(0, 60) || 'project';
    const safeNameUtf8 = encodeURIComponent(project.name.replace(/[^\p{L}\p{N}\-_ ]/gu, '_').slice(0, 60));

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${safeNameAscii}.pptx"; filename*=UTF-8''${safeNameUtf8}.pptx`,
      },
    });
  } catch (error) {
    console.error('GET /export-pptx error:', error);
    return NextResponse.json({ error: 'Failed to generate PPTX: ' + (error as Error).message }, { status: 500 });
  }
}
