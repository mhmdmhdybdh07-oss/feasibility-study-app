// محاكاة مونت كارلو - تحليل المخاطر الكمي
// يولّد آلاف السيناريوهات العشوائية لحساب توزيع الاحتمالات

export interface MonteCarloInputs {
  initialInvestment: number;
  yearsData: Array<{ year: number; revenues: number; costs: number }>;
  discountRate: number;
  // معاملات التذبذب (Volatility) - نسبة الانحراف المعياري
  revenueVolatility: number; // مثال: 0.2 = ±20%
  costVolatility: number;
  iterations: number; // عدد التجارب
}

export interface MonteCarloResult {
  iterations: number;
  npvMean: number;
  npvMedian: number;
  npvStd: number;
  npvMin: number;
  npvMax: number;
  npvP5: number;   // Percentile 5%
  npvP25: number;
  npvP75: number;
  npvP95: number;
  probNPVPositive: number; // احتمال أن NPV > 0
  probIRRDiscount: number; // احتمال IRR > معدل الخصم
  expectedShortfall: number; // متوسط الخسارة في أسوأ 5%
  riskAdjustedNPV: number; // NPV مع تعديل المخاطر
  distribution: Array<{ bin: string; count: number; npv: number }>; // توزيع NPV
  samplePaths: number[][]; // عينة من مسارات NPV التراكمي
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional VaR
}

// مولّد أرقام عشوائية بتوزيع طبيعي (Box-Muller)
function normalRandom(mean: number, std: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * std;
}

export function runMonteCarlo(inputs: MonteCarloInputs): MonteCarloResult {
  const {
    initialInvestment,
    yearsData,
    discountRate,
    revenueVolatility,
    costVolatility,
    iterations,
  } = inputs;

  const r = discountRate / 100;
  const npvs: number[] = [];
  const irrs: number[] = [];
  const samplePaths: number[][] = [];
  const samplePathCount = Math.min(50, iterations);

  for (let i = 0; i < iterations; i++) {
    const cashFlows: number[] = [-initialInvestment];
    const path: number[] = [-initialInvestment];
    let cumulative = -initialInvestment;

    for (const year of yearsData) {
      // توليد إيرادات وتكاليف عشوائية بتوزيع طبيعي
      const randomRev = normalRandom(year.revenues, year.revenues * revenueVolatility);
      const randomCost = normalRandom(year.costs, year.costs * costVolatility);

      const netCF = Math.max(0, randomRev) - Math.max(0, randomCost);
      cashFlows.push(netCF);
      cumulative += netCF;
      path.push(cumulative);
    }

    // حساب NPV
    const npv = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
    npvs.push(npv);

    // حفظ عينة من المسارات
    if (i < samplePathCount) samplePaths.push(path);

    // حساب IRR مبسّط
    const irr = simpleIRR(cashFlows);
    if (irr !== null) irrs.push(irr);
  }

  // إحصائيات NPV
  npvs.sort((a, b) => a - b);
  const npvMean = npvs.reduce((s, v) => s + v, 0) / npvs.length;
  const npvMedian = npvs[Math.floor(npvs.length / 2)];
  const npvStd = Math.sqrt(npvs.reduce((s, v) => s + Math.pow(v - npvMean, 2), 0) / npvs.length);
  const npvMin = npvs[0];
  const npvMax = npvs[npvs.length - 1];

  const percentile = (p: number) => npvs[Math.floor(npvs.length * p)];
  const npvP5 = percentile(0.05);
  const npvP25 = percentile(0.25);
  const npvP75 = percentile(0.75);
  const npvP95 = percentile(0.95);

  const probNPVPositive = npvs.filter((v) => v > 0).length / npvs.length;
  const probIRRDiscount = irrs.filter((v) => v > discountRate).length / Math.max(irrs.length, 1);

  // أسوأ 5% - Expected Shortfall
  const worst5 = npvs.slice(0, Math.floor(npvs.length * 0.05));
  const expectedShortfall = worst5.reduce((s, v) => s + v, 0) / Math.max(worst5.length, 1);

  // NPV معدّل بالمخاطرة: NPV - (1.65 * std) — عند مستوى ثقة 95%
  const riskAdjustedNPV = npvMean - 1.65 * npvStd;

  // VaR 95%: القيمة التي لا يتجاوزها الخسارة إلا في 5% من الحالات
  const var95 = npvP5; // الخسارة عند_percentile 5
  // CVaR: متوسط الخسائر تحت الـ VaR
  const cvar95 = expectedShortfall;

  // توزيع NPV في bins
  const binCount = 20;
  const range = npvMax - npvMin;
  const binSize = range / binCount;
  const distribution = [];
  for (let b = 0; b < binCount; b++) {
    const binStart = npvMin + b * binSize;
    const binEnd = binStart + binSize;
    const count = npvs.filter((v) => v >= binStart && v < binEnd).length;
    distribution.push({
      bin: `${formatShort(binStart)} - ${formatShort(binEnd)}`,
      count,
      npv: binStart + binSize / 2,
    });
  }

  return {
    iterations,
    npvMean,
    npvMedian,
    npvStd,
    npvMin,
    npvMax,
    npvP5,
    npvP25,
    npvP75,
    npvP95,
    probNPVPositive,
    probIRRDiscount,
    expectedShortfall,
    riskAdjustedNPV,
    distribution,
    samplePaths,
    var95,
    cvar95,
  };
}

function formatShort(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}

// IRR مبسّط - Newton-Raphson
function simpleIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  const hasPositive = cashFlows.some((v) => v > 0);
  const hasNegative = cashFlows.some((v) => v < 0);
  if (!hasPositive || !hasNegative) return null;

  let rate = 0.1;
  for (let i = 0; i < 50; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / factor;
      if (t > 0) dnpv += (-t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dnpv) < 1e-9) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-6) return newRate * 100;
    rate = newRate;
    if (rate < -0.99) rate = -0.99;
  }
  return rate * 100;
}
