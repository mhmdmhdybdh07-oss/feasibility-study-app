// حسابات مالية متقدمة: إهلاك القروض والضرائب

export interface AmortizationRow {
  month: number;
  payment: number;       // الدفعة الشهرية الثابتة
  interest: number;      // فائدة الشهر
  principal: number;     // أصل يسدد
  balance: number;       // الرصيد المتبقي
  cumulativeInterest: number; // مجموع الفوائد المدفوعة
  cumulativePrincipal: number; // مجموع الأصل المسدد
}

export interface AmortizationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
  // إحصائيات سنوية
  yearlySummary: Array<{
    year: number;
    payment: number;
    interest: number;
    principal: number;
    balanceEnd: number;
  }>;
}

// حساب جدول إهلاك القرض بالطريقة الثابتة (Equal Payment)
// المبلغ بالريال اليمني، الفائدة سنوية %، المدة بالسنوات
export function calculateAmortization(
  loanAmount: number,
  annualInterestRate: number, // %
  loanYears: number,
  paymentsPerYear: number = 12
): AmortizationResult {
  if (loanAmount <= 0 || loanYears <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [], yearlySummary: [] };
  }

  const r = (annualInterestRate / 100) / paymentsPerYear; // معدل الفائدة لكل فترة
  const n = loanYears * paymentsPerYear; // عدد الدفعات

  // صيغة الدفعة الثابتة: P = L * [r(1+r)^n] / [(1+r)^n - 1]
  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = loanAmount / n;
  } else {
    const factor = Math.pow(1 + r, n);
    monthlyPayment = (loanAmount * r * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    // ضمان عدم تجاوز الرصيد
    if (principal > balance) {
      principal = balance;
    }
    balance = Math.max(0, balance - principal);
    cumulativeInterest += interest;
    cumulativePrincipal += principal;

    schedule.push({
      month,
      payment: monthlyPayment,
      interest,
      principal,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (balance === 0) break;
  }

  // ملخص سنوي
  const yearlySummary: AmortizationResult['yearlySummary'] = [];
  for (let year = 1; year <= loanYears; year++) {
    const yearRows = schedule.filter((r) => Math.ceil(r.month / paymentsPerYear) === year);
    if (!yearRows.length) break;
    yearlySummary.push({
      year,
      payment: yearRows.reduce((s, r) => s + r.payment, 0),
      interest: yearRows.reduce((s, r) => s + r.interest, 0),
      principal: yearRows.reduce((s, r) => s + r.principal, 0),
      balanceEnd: yearRows[yearRows.length - 1].balance,
    });
  }

  return {
    monthlyPayment,
    totalPayment: monthlyPayment * n,
    totalInterest: monthlyPayment * n - loanAmount,
    schedule,
    yearlySummary,
  };
}

// === حسابات الضرائب ===

export interface TaxCalculation {
  // ضريبة القيمة المضافة (VAT)
  vatRate: number; // %
  vatOnSales: number; // ضريبة على المبيعات (مستحقة)
  vatOnPurchases: number; // ضريبة على المشتريات (قابلة للخصم)
  vatNetPayable: number; // الصافي المستحق للدولة

  // ضريبة الدخل
  taxableIncome: number; // الدخل الخاضع للضريبة
  incomeTaxRate: number; // %
  incomeTax: number; // ضريبة الدخل المستحقة
  netProfitAfterTax: number; // صافي الربح بعد الضريبة

  // تأثير على التدفق النقدي
  cashFlowImpact: number; // إجمالي التأثير النقدي السلبي
  effectiveTaxRate: number; // معدل الضريبة الفعلي %
}

export function calculateTaxes(
  annualRevenues: number,    // إيرادات سنوية (قبل الضريبة)
  annualCosts: number,       // تكاليف سنوية (قبل الضريبة)
  vatRate: number = 5,       // معدل الضريبة المضافة في اليمن ~5%
  incomeTaxRate: number = 15, // ضريبة الدخل ~15%
  vatDeductibleRatio: number = 0.7 // نسبة المشتريات الخاضعة للخصم
): TaxCalculation {
  // VAT
  const revenuesExclVAT = annualRevenues / (1 + vatRate / 100);
  const costsExclVAT = annualCosts / (1 + vatRate / 100);
  const vatOnSales = annualRevenues - revenuesExclVAT;
  const vatOnPurchases = (costsExclVAT * vatDeductibleRatio) * (vatRate / 100);
  const vatNetPayable = vatOnSales - vatOnPurchases;

  // ضريبة الدخل
  const grossProfit = annualRevenues - annualCosts;
  const taxableIncome = Math.max(0, grossProfit); // لا ضريبة على الخسارة
  const incomeTax = taxableIncome * (incomeTaxRate / 100);
  const netProfitAfterTax = grossProfit - incomeTax;

  // التأثير النقدي
  const cashFlowImpact = vatNetPayable + incomeTax;
  const effectiveTaxRate = grossProfit > 0 ? (cashFlowImpact / grossProfit) * 100 : 0;

  return {
    vatRate,
    vatOnSales,
    vatOnPurchases,
    vatNetPayable,
    taxableIncome,
    incomeTaxRate,
    incomeTax,
    netProfitAfterTax,
    cashFlowImpact,
    effectiveTaxRate,
  };
}

// === تحليل السيناريوهات ===

export interface Scenario {
  name: string;
  nameEn: string;
  probability: number; // 0-1
  revenueFactor: number; // مضاعف الإيرادات
  costFactor: number; // مضاعف التكاليف
  investmentFactor: number; // مضاعف الاستثمار
}

export interface ScenarioResult {
  scenario: Scenario;
  npv: number;
  irr: number | null;
  netProfit: number;
  totalRevenues: number;
  totalCosts: number;
}

export interface ScenarioAnalysis {
  results: ScenarioResult[];
  weightedNPV: number; // NPV الموزون بالاحتمالات
  expectedValue: number; // القيمة المتوقعة
  bestCase: ScenarioResult | null;
  worstCase: ScenarioResult | null;
  baseCase: ScenarioResult | null;
  range: number; // الفرق بين أفضل وأسوأ
  riskPremium: number; // علاوة المخاطرة
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  { name: 'متفائل', nameEn: 'Optimistic', probability: 0.25, revenueFactor: 1.2, costFactor: 0.9, investmentFactor: 1.0 },
  { name: 'متعادل', nameEn: 'Realistic', probability: 0.5, revenueFactor: 1.0, costFactor: 1.0, investmentFactor: 1.0 },
  { name: 'متشائم', nameEn: 'Pessimistic', probability: 0.25, revenueFactor: 0.8, costFactor: 1.15, investmentFactor: 1.1 },
];

export function runScenarioAnalysis(
  initialInvestment: number,
  yearsData: Array<{ year: number; revenues: number; costs: number }>,
  discountRate: number,
  scenarios: Scenario[] = DEFAULT_SCENARIOS,
  npvFn: (cashFlows: number[], rate: number) => number,
  irrFn: (cashFlows: number[]) => number | null
): ScenarioAnalysis {
  const results: ScenarioResult[] = scenarios.map((sc) => {
    const adjInvestment = initialInvestment * sc.investmentFactor;
    const adjYears = yearsData.map((y) => ({
      year: y.year,
      revenues: y.revenues * sc.revenueFactor,
      costs: y.costs * sc.costFactor,
    }));
    const cashFlows = [-adjInvestment, ...adjYears.map((y) => y.revenues - y.costs)];
    const totalRevenues = adjYears.reduce((s, y) => s + y.revenues, 0);
    const totalCosts = adjYears.reduce((s, y) => s + y.costs, 0);
    return {
      scenario: sc,
      npv: npvFn(cashFlows, discountRate),
      irr: irrFn(cashFlows),
      netProfit: totalRevenues - totalCosts,
      totalRevenues,
      totalCosts,
    };
  });

  const weightedNPV = results.reduce((s, r) => s + r.npv * r.scenario.probability, 0);
  const npvs = results.map((r) => r.npv).sort((a, b) => a - b);
  const bestCase = results.reduce((best, r) => !best || r.npv > best.npv ? r : best, null as ScenarioResult | null);
  const worstCase = results.reduce((worst, r) => !worst || r.npv < worst.npv ? r : worst, null as ScenarioResult | null);
  const baseCase = results.find((r) => r.scenario.nameEn === 'Realistic') ?? results[Math.floor(results.length / 2)] ?? null;
  const range = (bestCase?.npv ?? 0) - (worstCase?.npv ?? 0);
  const riskPremium = baseCase ? baseCase.npv - weightedNPV : 0;

  return {
    results,
    weightedNPV,
    expectedValue: weightedNPV,
    bestCase,
    worstCase,
    baseCase,
    range,
    riskPremium,
  };
}

// === تحليل Tornado (مخطط الإعصار) ===

export interface TornadoItem {
  variable: string;
  variableAr: string;
  lowValue: number;   // NPV عند الحد الأدنى
  highValue: number;  // NPV عند الحد الأقصى
  baseValue: number;  // NPV الأساسي
  swing: number;      // مدى التأثير (|high - low|)
  impact: number;     // نسبة التأثير %
}

export function calculateTornado(
  baseInputs: {
    initialInvestment: number;
    revenues: number[]; // إيرادات لكل سنة
    costs: number[];    // تكاليف لكل سنة
    discountRate: number;
  },
  npvFn: (cashFlows: number[], rate: number) => number,
  variations: Array<{ variable: string; variableAr: string; lowFactor: number; highFactor: number }>
): TornadoItem[] {
  // NPV الأساسي
  const baseCashFlows = [-baseInputs.initialInvestment, ...baseInputs.revenues.map((r, i) => r - baseInputs.costs[i])];
  const baseNPV = npvFn(baseCashFlows, baseInputs.discountRate);

  const items: TornadoItem[] = variations.map((v) => {
    // تطبيق الحد الأدنى
    let lowFlows: number[];
    let highFlows: number[];

    if (v.variable === 'initialInvestment') {
      lowFlows = [-baseInputs.initialInvestment * v.lowFactor, ...baseInputs.revenues.map((r, i) => r - baseInputs.costs[i])];
      highFlows = [-baseInputs.initialInvestment * v.highFactor, ...baseInputs.revenues.map((r, i) => r - baseInputs.costs[i])];
    } else if (v.variable === 'revenues') {
      lowFlows = [-baseInputs.initialInvestment, ...baseInputs.revenues.map((r) => r * v.lowFactor).map((r, i) => r - baseInputs.costs[i])];
      highFlows = [-baseInputs.initialInvestment, ...baseInputs.revenues.map((r) => r * v.highFactor).map((r, i) => r - baseInputs.costs[i])];
    } else if (v.variable === 'costs') {
      lowFlows = [-baseInputs.initialInvestment, ...baseInputs.revenues.map((r, i) => r - baseInputs.costs[i] * v.lowFactor)];
      highFlows = [-baseInputs.initialInvestment, ...baseInputs.revenues.map((r, i) => r - baseInputs.costs[i] * v.highFactor)];
    } else if (v.variable === 'discountRate') {
      const lowRate = baseInputs.discountRate * v.lowFactor;
      const highRate = baseInputs.discountRate * v.highFactor;
      return {
        variable: v.variable,
        variableAr: v.variableAr,
        lowValue: npvFn(baseCashFlows, highRate),  // معدل أعلى = NPV أقل
        highValue: npvFn(baseCashFlows, lowRate),  // معدل أقل = NPV أعلى
        baseValue: baseNPV,
        swing: Math.abs(npvFn(baseCashFlows, lowRate) - npvFn(baseCashFlows, highRate)),
        impact: 0,
      };
    } else {
      lowFlows = baseCashFlows;
      highFlows = baseCashFlows;
    }

    const lowNPV = npvFn(lowFlows, baseInputs.discountRate);
    const highNPV = npvFn(highFlows, baseInputs.discountRate);

    return {
      variable: v.variable,
      variableAr: v.variableAr,
      lowValue: Math.min(lowNPV, highNPV),
      highValue: Math.max(lowNPV, highNPV),
      baseValue: baseNPV,
      swing: Math.abs(highNPV - lowNPV),
      impact: 0,
    };
  });

  // حساب نسبة التأثير ورسم النسب المئوية
  const maxSwing = Math.max(...items.map((i) => i.swing), 1);
  items.forEach((i) => {
    i.impact = (i.swing / maxSwing) * 100;
  });

  // ترتيب تنازلي بالتأثير
  return items.sort((a, b) => b.swing - a.swing);
}
