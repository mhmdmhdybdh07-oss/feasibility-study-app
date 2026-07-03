// نظام الطاقة الكهرومائية المتقدم - بيانات وحاسبات تفصيلية
// المصادر: ESHA, DOE, IRENA, دراسات اليمن

// === أنواع التوربينات المائية ===
export interface TurbineType {
  id: string;
  nameAr: string;
  nameEn: string;
  minHead: number; // م
  maxHead: number;
  minFlow: number; // م³/ث
  maxFlow: number;
  efficiency: number; // %
  costPerKW: number; // ريال يمني/kW
  suitableFor: string;
  icon: string;
}

export const TURBINE_TYPES: TurbineType[] = [
  {
    id: 'pelton',
    nameAr: 'توربين بيلتون (Pelton)',
    nameEn: 'Pelton Turbine',
    minHead: 50, maxHead: 1000,
    minFlow: 0.01, maxFlow: 5,
    efficiency: 88,
    costPerKW: 1500000,
    suitableFor: 'رأس عالٍ + تدفق منخفض. يناسب المرتفعات الجبلية (صنعاء، صعدة، عمران)',
    icon: '💧',
  },
  {
    id: 'francis',
    nameAr: 'توربين فرانسيس (Francis)',
    nameEn: 'Francis Turbine',
    minHead: 10, maxHead: 300,
    minFlow: 0.1, maxFlow: 50,
    efficiency: 92,
    costPerKW: 1200000,
    suitableFor: 'رأس متوسط + تدفق متوسط. الأكثر استخداماً. يناسب الوديان (إب، تعز)',
    icon: '🌀',
  },
  {
    id: 'kaplan',
    nameAr: 'توربين كابلان (Kaplan)',
    nameEn: 'Kaplan Turbine',
    minHead: 2, maxHead: 40,
    minFlow: 1, maxFlow: 200,
    efficiency: 90,
    costPerKW: 1000000,
    suitableFor: 'رأس منخفض + تدفق عالٍ. يناسب الأنهار والسهول (الحديدة، تهامة)',
    icon: '🌊',
  },
  {
    id: 'crossflow',
    nameAr: 'توربين تدفق متقاطع (Cross-flow)',
    nameEn: 'Cross-flow Turbine',
    minHead: 5, maxHead: 200,
    minFlow: 0.05, maxFlow: 10,
    efficiency: 80,
    costPerKW: 800000,
    suitableFor: 'اقتصادي وبسيط. يناسب المشاريع الصغيرة والريفية',
    icon: '⚙️',
  },
  {
    id: 'turgo',
    nameAr: 'توربين تورجو (Turgo)',
    nameEn: 'Turgo Turbine',
    minHead: 30, maxHead: 250,
    minFlow: 0.05, maxFlow: 5,
    efficiency: 85,
    costPerKW: 1100000,
    suitableFor: 'رأس متوسط-عالٍ. بديل لبيلتون بتكلفة أقل',
    icon: '💦',
  },
  {
    id: 'archimedes',
    nameAr: 'نظام أرخميدس (Archimedes Screw)',
    nameEn: 'Archimedes Screw',
    minHead: 1, maxHead: 10,
    minFlow: 0.5, maxFlow: 10,
    efficiency: 75,
    costPerKW: 900000,
    suitableFor: 'رأس منخفض جداً + صديق للأسماك. يناسب القنوات والترع',
    icon: '🐌',
  },
];

// === المواقع المائية المحتملة في اليمن ===
export interface HydroSite {
  id: string;
  nameAr: string;
  nameEn: string;
  region: string;
  wadi: string;
  estimatedHead: number; // م
  estimatedFlow: number; // م³/ث
  estimatedPower: number; // kW
  siteType: 'run-of-river' | 'dam' | 'canal' | 'reservoir';
  landStatus: string;
  notes: string;
  recommendedTurbine: string;
}

export const YEMEN_HYDRO_SITES: HydroSite[] = [
  {
    id: 'wadi-zabid',
    nameAr: 'وادي زبيد - الحديدة',
    nameEn: 'Wadi Zabid - Hodeidah',
    region: 'الحديدة',
    wadi: 'وادي زبيد',
    estimatedHead: 25,
    estimatedFlow: 15,
    estimatedPower: 3675,
    siteType: 'run-of-river',
    landStatus: 'أراضي زراعية - يتطلب موافقة',
    notes: 'وادي زبيد من أكبروديان اليمن. تدفق دائم تقريباً. يناسب توربين كابلان. قرب الساحل يسهل النقل.',
    recommendedTurbine: 'kaplan',
  },
  {
    id: 'wadi-sir',
    nameAr: 'وادي سردد - الحديدة',
    nameEn: 'Wadi Sardud - Hodeidah',
    region: 'الحديدة',
    wadi: 'وادي سردد',
    estimatedHead: 15,
    estimatedFlow: 20,
    estimatedPower: 2940,
    siteType: 'run-of-river',
    landStatus: 'أراضي زراعية',
    notes: 'وادي سردد بتدفق عالٍ ورأس منخفض. مثالي لتوربين كابلان. قرب المناطق الزراعية يسهل التغذية.',
    recommendedTurbine: 'kaplan',
  },
  {
    id: 'wadi-anaam',
    nameAr: 'وادي عنّ - إب',
    nameEn: 'Wadi Anaa - Ibb',
    region: 'إب',
    wadi: 'وادي عنّ',
    estimatedHead: 80,
    estimatedFlow: 3,
    estimatedPower: 2352,
    siteType: 'run-of-river',
    landStatus: 'أراضي جبلية - يتطلب دراسة جيولوجية',
    notes: 'إب أمطار غزيرة + مرتفعات. رأس عالٍ 80م + تدفق 3م³/ث. مثالي لتوربين بيلتون. أعلى إنتاجية/تدفق.',
    recommendedTurbine: 'pelton',
  },
  {
    id: 'wadi-bana',
    nameAr: 'وادي بنا - أبين',
    nameEn: 'Wadi Bana - Abyan',
    region: 'أبين',
    wadi: 'وادي بنا',
    estimatedHead: 30,
    estimatedFlow: 10,
    estimatedPower: 2940,
    siteType: 'dam',
    landStatus: 'سد موجود - يمكن إضافة توربين',
    notes: 'وادي بنا به سدود قائمة. يمكن إضافة توربين للسد الحالي. تدفق موسمي قوي. يناسب فرانسيس.',
    recommendedTurbine: 'francis',
  },
  {
    id: 'wadi-hadramout',
    nameAr: 'وادي حضرموت - شبوة',
    nameEn: 'Wadi Hadramout - Shabwa',
    region: 'شبوة',
    wadi: 'وادي حضرموت',
    estimatedHead: 50,
    estimatedFlow: 5,
    estimatedPower: 2450,
    siteType: 'run-of-river',
    landStatus: 'أراضي صحراوية - ملكية قبيلة',
    notes: 'وادي حضرموت بتدفق موسمي قوي. رأس 50م مناسب لفرانسيس/تورجو. يتطلب خزان تجميع للتدفق الموسمي.',
    recommendedTurbine: 'turgo',
  },
  {
    id: 'wadi-maur',
    nameAr: 'وادي مور - حجة',
    nameEn: 'Wadi Maur - Hajjah',
    region: 'حجة',
    wadi: 'وادي مور',
    estimatedHead: 100,
    estimatedFlow: 2,
    estimatedPower: 1960,
    siteType: 'run-of-river',
    landStatus: 'أراضي جبلية وعرة',
    notes: 'حجة مرتفعات وعرة برأس 100م. تدفق 2م³/ث. مثالي لبيلتون. صعوبة وصول للموقع.',
    recommendedTurbine: 'pelton',
  },
  {
    id: 'wadi-dhahr',
    nameAr: 'وادي ذهر - صنعاء',
    nameEn: 'Wadi Dhahr - Sanaa',
    region: 'صنعاء',
    wadi: 'وادي ذهر',
    estimatedHead: 60,
    estimatedFlow: 1.5,
    estimatedPower: 882,
    siteType: 'run-of-river',
    landStatus: 'قرب العاصمة - يتطلب تراخيص',
    notes: 'وادي ذهر قرب صنعاء. تدفق منخفض لكن رأس جيد. يناسب بيلتون/تورجو. قرب الشبكة الكهربائية.',
    recommendedTurbine: 'pelton',
  },
  {
    id: 'mareb-dam',
    nameAr: 'سد مأرب - مأرب',
    nameEn: 'Marib Dam - Marib',
    region: 'مأرب',
    wadi: 'وادي ذنة',
    estimatedHead: 35,
    estimatedFlow: 25,
    estimatedPower: 8575,
    siteType: 'dam',
    landStatus: 'سد قائم - إضافة توربين',
    notes: 'سد مأرب التاريخي! أكبر سد في اليمن. يمكن إضافة توربين 8.5MW. أعلى قدرة. يتطلب استثمار كبير.',
    recommendedTurbine: 'francis',
  },
];

// === حاسبة الطاقة الكهرومائية التفصيلية ===
export interface HydroCalcInputs {
  head: number; // صافي الرأس (م)
  flow: number; // التدفق (م³/ث)
  turbineEfficiency: number; // % (افتراضي 85%)
  generatorEfficiency: number; // % (افتراضي 95%)
  systemLosses: number; // % خسائر النظام (افتراضي 5%)
  capacityFactor: number; // % معامل السعة (افتراضي 50%)
  turbineType: string; // نوع التوربين
}

export interface HydroCalcResult {
  grossPower: number; // kW (القدرة النظرية)
  netPower: number; // kW (القدرة الفعلية بعد الخسائر)
  overallEfficiency: number; // %
  annualProduction: number; // kWh/سنة
  dailyProduction: number; // kWh/يوم
  co2Saved: number; // طن/سنة
  homesPowered: number; // عدد منازل
  recommendedTurbines: TurbineType[]; // توربينات مناسبة
  pipeDiameter: number; // مم (قطر الأنبوب المقترح)
  penstockLength: number; // م (طول أنبوب التغذية المقترح)
  flowVelocity: number; // م/ث
  tips: string[];
}

export function calculateHydroPower(inputs: HydroCalcInputs): HydroCalcResult {
  const { head, flow, turbineEfficiency, generatorEfficiency, systemLosses, capacityFactor } = inputs;

  // القدرة النظرية: P = ρ × g × Q × H
  // ρ = 1000 kg/m³, g = 9.81 m/s²
  const grossPower = (1000 * 9.81 * flow * head) / 1000; // kW
  const overallEff = (turbineEfficiency / 100) * (generatorEfficiency / 100) * (1 - systemLosses / 100);
  const netPower = grossPower * overallEff;
  const annualProduction = netPower * 8760 * (capacityFactor / 100);
  const dailyProduction = annualProduction / 365;
  const co2Saved = (annualProduction * 0.5) / 1000;
  const homesPowered = Math.round(netPower / 3); // ~3kW لكل منزل

  // التوربينات المناسبة
  const recommendedTurbines = TURBINE_TYPES.filter((t) =>
    head >= t.minHead && head <= t.maxHead && flow >= t.minFlow && flow <= t.maxFlow
  );

  // قطر الأنبوب (مبسّط): D = sqrt(4Q / (π × v))، v = 2-3 m/s
  const flowVelocity = 2.5; // m/s مقترح
  const pipeDiameter = Math.sqrt((4 * flow) / (Math.PI * flowVelocity)) * 1000; // مم
  const penstockLength = Math.round(head * 1.5); // تقريبي 1.5× الرأس

  const tips: string[] = [];
  if (head < 5) tips.push('⚠️ رأس منخفض جداً - يحتاج كابلان أو أرخميدس');
  else if (head > 200) tips.push('✅ رأس عالٍ ممتاز - بيلتون مثالي');
  if (flow < 0.5) tips.push('⚠️ تدفق منخفض - يحتاج خزان تجميع');
  if (capacityFactor < 40) tips.push('💡 معامل السعة منخفض - تدفق موسمي؟ خزان تجميع مطلوب');
  if (netPower > 1000) tips.push('🏆 قدرة عالية (>1MW) - مشروع استراتيجي!');
  if (recommendedTurbines.length === 0) tips.push('⚠️ لا يوجد توربين مناسب - راجع الرأس والتدفق');
  else tips.push(`✅ ${recommendedTurbines.length} توربين مناسب: ${recommendedTurbines.map(t => t.nameAr).join('، ')}`);

  return {
    grossPower: Math.round(grossPower * 100) / 100,
    netPower: Math.round(netPower * 100) / 100,
    overallEfficiency: Math.round(overallEff * 10000) / 100,
    annualProduction: Math.round(annualProduction),
    dailyProduction: Math.round(dailyProduction),
    co2Saved: Math.round(co2Saved * 10) / 10,
    homesPowered,
    recommendedTurbines,
    pipeDiameter: Math.round(pipeDiameter),
    penstockLength,
    flowVelocity,
    tips,
  };
}

// === تحليل تكاليف الطاقة الكهرومائية ===
export interface HydroCostInputs {
  power: number; // kW
  turbineType: string;
  includeDam: boolean; // بناء سد؟
  includeTransmission: boolean; // خط نقل؟
  transmissionDistance: number; // كم
  includeAccess: boolean; // طريق وصول؟
  accessDistance: number; // كم
}

export interface HydroCostItem {
  category: string;
  categoryAr: string;
  description: string;
  cost: number; // ريال يمني
  percentage: number;
}

export interface HydroCostResult {
  items: HydroCostItem[];
  totalCapex: number;
  annualOpex: number;
  costPerKW: number;
  lifetime: number;
  annualProduction: number; // kWh (بافتراض 50% CF)
  lcoe: number; // ريال/kWh
  paybackYears: number; // بافتراض تعرفة 150 ر/kWh
  recommendations: string[];
}

export function calculateHydroCosts(inputs: HydroCostInputs): HydroCostResult {
  const { power, turbineType, includeDam, includeTransmission, transmissionDistance, includeAccess, accessDistance } = inputs;
  const turbine = TURBINE_TYPES.find(t => t.id === turbineType) ?? TURBINE_TYPES[0];
  const items: HydroCostItem[] = [];
  let total = 0;

  // 1. دراسة الجدوى والتصميم (5%)
  const study = power * turbine.costPerKW * 0.05;
  items.push({ category: 'study', categoryAr: 'دراسة وتصميم', description: 'دراسة هيدرولوجية + جيولوجية + تصميم هندسي', cost: study, percentage: 0 });
  total += study;

  // 2. التوربين والمولد
  const turbineCost = power * turbine.costPerKW;
  items.push({ category: 'turbine', categoryAr: 'توربين + مولد', description: `${turbine.nameAr} + مولد كهربائي + نظام تحكم`, cost: turbineCost, percentage: 0 });
  total += turbineCost;

  // 3. الأعمال المدنية (30% من التوربين)
  const civil = turbineCost * 0.3;
  items.push({ category: 'civil', categoryAr: 'أعمال مدنية', description: 'بيت التوربين + قناة التغذية + قناة الصرف', cost: civil, percentage: 0 });
  total += civil;

  // 4. أنبوب التغذية (Penstock)
  const penstock = power * 100000; // ~100K ريال/kW
  items.push({ category: 'penstock', categoryAr: 'أنبوب التغذية', description: 'أنبوب ضغط من الفولاذ + صمامات + فلاتر', cost: penstock, percentage: 0 });
  total += penstock;

  // 5. السد (إن وجد)
  if (includeDam) {
    const dam = power * 500000; // ~500K ريال/kW
    items.push({ category: 'dam', categoryAr: 'بناء سد', description: 'سد خرساني/ترابي + بوابة تحكم + مفيض', cost: dam, percentage: 0 });
    total += dam;
  }

  // 6. خط النقل (إن وجد)
  if (includeTransmission && transmissionDistance > 0) {
    const transmission = transmissionDistance * 5000000; // 5M ريال/كم
    items.push({ category: 'transmission', categoryAr: 'خط نقل كهرباء', description: `خط ${transmissionDistance}كم + محولات + أعمدة`, cost: transmission, percentage: 0 });
    total += transmission;
  }

  // 7. طريق وصول (إن وجد)
  if (includeAccess && accessDistance > 0) {
    const road = accessDistance * 2000000; // 2M ريال/كم
    items.push({ category: 'road', categoryAr: 'طريق وصول', description: `تسوية + رصف ${accessDistance}كم`, cost: road, percentage: 0 });
    total += road;
  }

  // 8. تركيب وتشغيل (10%)
  const install = total * 0.1;
  items.push({ category: 'install', categoryAr: 'تركيب وتشغيل', description: 'تركيب + اختبار + تدريب', cost: install, percentage: 0 });
  total += install;

  // 9. طوارئ (10%)
  const contingency = total * 0.1;
  items.push({ category: 'contingency', categoryAr: 'احتياطي', description: 'ميزانية طوارئ 10%', cost: contingency, percentage: 0 });
  total += contingency;

  // النسب المئوية
  items.forEach(item => { item.percentage = Math.round((item.cost / total) * 100); });

  const annualOpex = total * 0.02; // 2% سنوياً
  const costPerKW = total / power;
  const lifetime = 30; // سنة
  const annualProduction = power * 8760 * 0.5; // 50% CF
  const lcoe = (total + annualOpex * lifetime) / (annualProduction * lifetime);
  const annualBenefit = annualProduction * 150; // تعرفة 150 ر/kWh
  const paybackYears = annualBenefit > 0 ? total / (annualBenefit - annualOpex) : 999;

  const recommendations: string[] = [];
  if (costPerKW > 2000000) recommendations.push('💡 تكلفة/kW مرتفعة - فكر في توربين اقتصادي (Cross-flow)');
  if (paybackYears < 3) recommendations.push('🏆 استرداد سريع جداً - مشروع ممتاز!');
  else if (paybackYears > 10) recommendations.push('⚠️ استرداد بطيء - راجع التكاليف أو زد السعة');
  if (includeDam) recommendations.push('⚠️ بناء السد مكلف - فكر في run-of-river إن أمكن');
  recommendations.push('⏱️ العمر الافتراضي 30+ سنة - استثمار طويل الأمد');

  return {
    items,
    totalCapex: total,
    annualOpex,
    costPerKW: Math.round(costPerKW),
    lifetime,
    annualProduction: Math.round(annualProduction),
    lcoe: Math.round(lcoe),
    paybackYears: Math.round(paybackYears * 10) / 10,
    recommendations,
  };
}

// === تصنيف المواقع ===
export const SITE_TYPES = {
  'run-of-river': { ar: 'جريان نهر', en: 'Run-of-River', color: 'bg-blue-500/10 text-blue-700' },
  'dam': { ar: 'سد', en: 'Dam', color: 'bg-amber-500/10 text-amber-700' },
  'canal': { ar: 'قناة', en: 'Canal', color: 'bg-cyan-500/10 text-cyan-700' },
  'reservoir': { ar: 'خزان', en: 'Reservoir', color: 'bg-emerald-500/10 text-emerald-700' },
};
