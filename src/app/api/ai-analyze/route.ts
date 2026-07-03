import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateIndicators } from '@/lib/calculations';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

// POST /api/ai-analyze - تحليل ذكي لمشروع باستخدام LLM
export async function POST(req: NextRequest) {
  try {
    const { projectId, currency = 'YER' } = await req.json();
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const cur = CURRENCIES[currency as CurrencyCode] ?? CURRENCIES.YER;
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

    // تجهيز ملخص البيانات للـ LLM
    const projectSummary = {
      name: project.name,
      description: project.description,
      establishment: {
        type: establishment.projectType,
        sector: establishment.projectSector,
        location: establishment.projectLocation,
        duration: establishment.projectDuration,
        capital: establishment.projectCapital,
      },
      market: {
        targetCustomers: market.targetCustomers,
        marketSize: market.marketSize,
        expectedShare: market.expectedShare,
        growthRate: market.growthRate,
        competitors: market.competitors,
        competitiveAdvantage: market.competitiveAdvantage,
      },
      technical: {
        capacity: technical.productionCapacity,
        productionVolume: technical.productionVolume,
        laborRequired: technical.laborRequired,
        location: technical.location,
      },
      financial: {
        initialInvestment: fin.initialInvestment,
        fixedAssets: fin.fixedAssets,
        workingCapital: fin.workingCapital,
        operatingCosts: fin.operatingCosts,
        loans: fin.loans,
        interestRate: fin.interestRate,
        loanPeriod: fin.loanPeriod,
        yearsData,
      },
      economic: {
        discountRate: eco.discountRate,
        riskAnalysis: eco.riskAnalysis,
        sensitivity: eco.sensitivity,
      },
      indicators: {
        npv: indicators.npv,
        irr: indicators.irr,
        paybackPeriod: indicators.paybackPeriod,
        roi: indicators.roi,
        profitabilityIndex: indicators.profitabilityIndex,
        totalRevenues: indicators.totalRevenues,
        totalCosts: indicators.totalCosts,
        netProfit: indicators.totalNetProfit,
        isViable: indicators.isViable,
      },
      currency: cur.code,
    };

    // استدعاء LLM
    let aiResponse: string;
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `أنت خبير في تحليل دراسات الجدوى الاقتصادية. مهمتك تحليل بيانات المشروع وتقديم تقييم احترافي شامل. 
استخدم اللغة العربية. ركّز على:
1. تحليل نقاط القوة والضعف في المشروع
2. تقييم المؤشرات المالية (NPV, IRR, ROI)
3. المخاطر الرئيسية وكيفية التخفيف منها
4. توصيات عملية للمستثمر (3-5 توصيات)
5. سيناريوهات محتملة لتحسين الأداء
اجعل الإجابة منظمة بعناوين فرعية واضحة، بطريقة احترافية لا تتجاوز 800 كلمة.`,
          },
          {
            role: 'user',
            content: `حلّل دراسة الجدوى التالية:\n\n${JSON.stringify(projectSummary, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      aiResponse = completion.choices?.[0]?.message?.content ?? 'لم يتم توليد تحليل.';
    } catch (e) {
      console.error('AI SDK error:', e);
      // fallback: تحليل قاعدي بسيط
      aiResponse = generateFallbackAnalysis(projectSummary, indicators);
    }

    return NextResponse.json({ analysis: aiResponse, indicators, currency: cur.code });
  } catch (error) {
    console.error('POST /api/ai-analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze: ' + (error as Error).message }, { status: 500 });
  }
}

function generateFallbackAnalysis(p: any, indicators: any): string {
  const viable = indicators.isViable;
  const irr = indicators.irr;
  const npv = indicators.npv;
  const payback = indicators.paybackPeriod;

  return `## تحليل دراسة الجدوى - ${p.name}

### 1. التقييم العام
${viable
    ? 'المشروع **مجدي اقتصادياً** بناءً على المؤشرات الحالية، حيث تحقق المؤشرات الرئيسية الحدود المقبولة للاستثمار.'
    : 'المشروع **غير مجدي** وفق المعطيات الحالية، ويحتاج إلى مراجعة جذرية لهيكل التكاليف والإيرادات قبل المضي قدماً.'}

### 2. تحليل المؤشرات المالية
- **صافي القيمة الحالية (NPV):** ${npv > 0 ? 'موجب' : 'سالب'} - ${npv > 0 ? 'المشروع يحقق عائداً يفوق معدل الخصم' : 'المشروع لا يحقق العائد المطلوب'}
- **معدل العائد الداخلي (IRR):** ${irr !== null ? irr.toFixed(2) + '%' : 'غير محسوب'} - ${irr !== null && irr > 10 ? 'أعلى من معدل الخصم' : 'أقل من المطلوب'}
- **فترة الاسترداد:** ${payback !== null ? payback.toFixed(2) + ' سنة' : 'غير محسوبة'}
- **العائد على الاستثمار (ROI):** ${indicators.roi.toFixed(2)}%

### 3. المخاطر الرئيسية
1. مخاطر سوقية: تقلبات الطلب والأسعار
2. مخاطر تشغيلية: تكاليف غير متوقعة
3. مخاطر تمويلية: ارتفاع معدلات الفائدة
4. مخاطر تنظيمية: تغيير القوانين

### 4. التوصيات
1. ${viable ? 'المضي قدماً في التنفيذ مع مراقبة دورية للمؤشرات' : 'إعادة هيكلة المشروع قبل التنفيذ'}
2. تنويع مصادر الإيرادات لتقليل المخاطر
3. التفاوض مع الموردين لتقليل التكاليف
4. بناء احتياطي نقدي للطوارئ (10-15% من الاستثمار)
5. وضع خطة بديلة (Plan B) في حال انخفاض الإيرادات عن المتوقع

### 5. سيناريوهات التحسين
- زيادة الإيرادات بنسبة 10% من خلال استراتيجيات تسويقية محسّنة
- خفض التكاليف التشغيلية بنسبة 5% عبر تحسين الكفاءة
- تمديد فترة المشروع للحصول على عوائد تراكمية أكبر

---
*ملاحظة: هذا تحليل آلي مبدئي. يُنصح بمراجعة الخبير المالي قبل اتخاذ القرار النهائي.*`;
}
