// حسابات المؤشرات المالية والاقتصادية
// جميع المبالغ بالريال اليمني

export interface YearRow {
  year: number;
  revenues: number;
  costs: number;
}

export interface FinancialInputs {
  initialInvestment: number;
  fixedAssets: number;
  workingCapital: number;
  operatingCosts: number;
  loans: number;
  interestRate: number;
  loanPeriod: number;
  yearsData: YearRow[];
  discountRate: number;
}

export interface CalculatedIndicators {
  netCashFlows: number[]; // التدفق النقدي لكل سنة (يشمل الاستثمار الأولي في السنة 0)
  cumulativeCashFlows: number[];
  totalRevenues: number;
  totalCosts: number;
  totalNetProfit: number;
  paybackPeriod: number | null; // بالسنوات
  discountedPaybackPeriod: number | null; // فترة الاسترداد المخصومة
  roi: number; // Return on Investment %
  npv: number; // Net Present Value
  irr: number | null; // Internal Rate of Return %
  mirr: number | null; // Modified Internal Rate of Return %
  profitabilityIndex: number;
  breakEvenRevenue: number;
  breakEvenUnits: number | null;
  averageAnnualProfit: number;
  wacc: number; // Weighted Average Cost of Capital %
  isViable: boolean;
}

// حساب صافي التدفق النقدي للسنة
export function calcNetCashFlow(year: YearRow): number {
  return (Number(year.revenues) || 0) - (Number(year.costs) || 0);
}

// NPV - صافي القيمة الحالية
export function calculateNPV(cashFlows: number[], discountRate: number): number {
  if (!cashFlows.length) return 0;
  const r = (discountRate || 0) / 100;
  return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + r, i), 0);
}

// IRR - معدل العائد الداخلي (Newton-Raphson)
export function calculateIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  // يجب أن يكون هناك تغير في الإشارة لوجود IRR
  const hasPositive = cashFlows.some((v) => v > 0);
  const hasNegative = cashFlows.some((v) => v < 0);
  if (!hasPositive || !hasNegative) return null;

  let rate = 0.1; // 10% كبداية
  const maxIter = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / factor;
      if (t > 0) {
        dnpv += (-t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(dnpv) < tolerance) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100;
    }
    rate = newRate;
    if (rate < -0.99) rate = -0.99; // تجنب القسمة على صفر
  }
  return rate * 100;
}

// فترة الاسترداد
export function calculatePayback(cashFlows: number[]): number | null {
  if (!cashFlows.length) return null;
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    const prev = cumulative;
    cumulative += cashFlows[i];
    if (prev < 0 && cumulative >= 0) {
      // استرداد خلال هذه السنة
      const fraction = -prev / cashFlows[i];
      return i - 1 + fraction;
    }
  }
  return null;
}

// ROI - العائد على الاستثمار
export function calculateROI(totalProfit: number, investment: number): number {
  if (!investment) return 0;
  return (totalProfit / investment) * 100;
}

// PI - مؤشر الربحية
export function calculatePI(cashFlows: number[], discountRate: number): number {
  const initial = Math.abs(cashFlows[0] || 0);
  if (!initial) return 0;
  const pvFuture = cashFlows.slice(1).reduce((sum, cf, i) => sum + cf / Math.pow(1 + discountRate / 100, i + 1), 0);
  return pvFuture / initial;
}

// MIRR - معدل العائد الداخلي المعدّل
export function calculateMIRR(cashFlows: number[], financeRate: number, reinvestRate: number): number | null {
  if (cashFlows.length < 2) return null;
  const positives = cashFlows.filter((v) => v > 0);
  const negatives = cashFlows.filter((v) => v < 0);
  if (!positives.length || !negatives.length) return null;

  // القيمة المستقبلية للتدفقات الموجبة (بمعدل إعادة الاستثمار)
  const fv = positives.reduce((sum, cf, i) => {
    const yearIdx = cashFlows.indexOf(cf);
    const years = cashFlows.length - 1 - yearIdx;
    return sum + cf * Math.pow(1 + reinvestRate / 100, years);
  }, 0);

  // القيمة الحالية للتدفقات السالبة (بمعدل التمويل)
  const pv = negatives.reduce((sum, cf, i) => {
    const yearIdx = cashFlows.indexOf(cf);
    return sum + cf / Math.pow(1 + financeRate / 100, yearIdx);
  }, 0);

  if (pv === 0) return null;
  const n = cashFlows.length - 1;
  return (Math.pow(fv / Math.abs(pv), 1 / n) - 1) * 100;
}

// فترة الاسترداد المخصومة
export function calculateDiscountedPayback(cashFlows: number[], discountRate: number): number | null {
  if (!cashFlows.length) return null;
  const r = discountRate / 100;
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    const dcf = cashFlows[i] / Math.pow(1 + r, i);
    const prev = cumulative;
    cumulative += dcf;
    if (prev < 0 && cumulative >= 0) {
      const fraction = -prev / dcf;
      return i - 1 + fraction;
    }
  }
  return null;
}

// WACC - متوسط تكلفة رأس المال المرجّح
export function calculateWACC(
  equity: number,
  debt: number,
  costOfEquity: number,
  costOfDebt: number,
  taxRate: number = 0
): number {
  const total = equity + debt;
  if (total === 0) return 0;
  const equityWeight = equity / total;
  const debtWeight = debt / total;
  return (equityWeight * costOfEquity) + (debtWeight * costOfDebt * (1 - taxRate));
}

export function calculateIndicators(inputs: Partial<FinancialInputs>): CalculatedIndicators {
  const initialInvestment = Number(inputs.initialInvestment) || 0;
  const yearsData = inputs.yearsData || [];
  const discountRate = Number(inputs.discountRate) || 10;
  const fixedAssets = Number(inputs.fixedAssets) || 0;
  const operatingCosts = Number(inputs.operatingCosts) || 0;
  const loans = Number(inputs.loans) || 0;
  const interestRate = Number(inputs.interestRate) || 0;

  // صافي التدفق النقدي لكل سنة
  const yearlyNetCash = yearsData.map((y) => calcNetCashFlow(y));

  // السنة 0 = الاستثمار الأولي (سالب)
  const netCashFlows = [-initialInvestment, ...yearlyNetCash];

  // التراكمي
  const cumulativeCashFlows: number[] = [];
  let cum = 0;
  for (const cf of netCashFlows) {
    cum += cf;
    cumulativeCashFlows.push(cum);
  }

  const totalRevenues = yearsData.reduce((s, y) => s + (Number(y.revenues) || 0), 0);
  const totalCosts = yearsData.reduce((s, y) => s + (Number(y.costs) || 0), 0);
  const totalNetProfit = totalRevenues - totalCosts;

  const npv = calculateNPV(netCashFlows, discountRate);
  const irr = calculateIRR(netCashFlows);
  const mirr = calculateMIRR(netCashFlows, interestRate || discountRate, discountRate);
  const payback = calculatePayback(netCashFlows);
  const discountedPayback = calculateDiscountedPayback(netCashFlows, discountRate);
  const roi = calculateROI(totalNetProfit, initialInvestment);
  const pi = calculatePI(netCashFlows, discountRate);

  // WACC: رأس المال = الاستثمار - القروض، القروض = loans
  const equity = Math.max(0, initialInvestment - loans);
  const costOfEquity = discountRate; // تقديري = معدل الخصم
  const costOfDebt = interestRate || 5;
  const wacc = calculateWACC(equity, loans, costOfEquity, costOfDebt);

  // نقطة التعادل: التكاليف الثابتة / (1 - تكاليف متغيرة/إيرادات)
  const breakEvenRevenue = operatingCosts > 0 && totalRevenues > 0
    ? operatingCosts / (1 - (totalCosts - operatingCosts) / totalRevenues)
    : 0;

  const averageAnnualProfit = yearsData.length ? totalNetProfit / yearsData.length : 0;

  // المجدد إذا NPV > 0 و IRR > معدل الخصم
  const isViable = npv > 0 && (irr === null || irr > discountRate);

  return {
    netCashFlows,
    cumulativeCashFlows,
    totalRevenues,
    totalCosts,
    totalNetProfit,
    paybackPeriod: payback,
    discountedPaybackPeriod: discountedPayback,
    roi,
    npv,
    irr,
    mirr,
    profitabilityIndex: pi,
    breakEvenRevenue,
    breakEvenUnits: null,
    averageAnnualProfit,
    wacc,
    isViable,
  };
}
