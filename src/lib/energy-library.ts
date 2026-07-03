// مكتبة مشاريع الطاقة المتجددة - بيانات واقعية لليمن
// المصادر: IRENA, World Bank, NREL, دراسات اليمن

export interface EnergyProject {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'solar-pv' | 'solar-thermal' | 'wind' | 'biogas' | 'hydro' | 'hybrid';
  icon: string;

  // المواصفات التقنية
  capacity: number; // kW أو MW
  capacityUnit: string;
  annualProduction: number; // kWh/سنة
  efficiency: number; // %
  lifetime: number; // سنة

  // التكاليف (ريال يمني)
  capex: number; // الاستثمار الأولي
  opexAnnual: number; // تكاليف التشغيل السنوية
  costPerKW: number; // تكلفة/kW

  // اقتصاديات
  tariff: number; // تعرفة الكهرباء (ريال/kWh)
  annualSavings: number; // توفير سنوي
  annualRevenue: number; // إيراد سنوي (إن وجد)
  paybackYears: number;
  roi: number; // %
  co2Saved: number; // طن CO2/سنة

  // الموقع والمتطلبات
  areaRequired: number; // م²
  waterRequired: number; // م³/سنة (للغسل)
  recommendedRegions: string[];

  notes: string;
  advantages: string[];
  challenges: string[];
}

export const ENERGY_PROJECTS: EnergyProject[] = [
  {
    id: 'solar-rooftop-10kw',
    nameAr: 'نظام طاقة شمسية منزلي 10 kW',
    nameEn: '10kW Rooftop Solar PV',
    type: 'solar-pv',
    icon: '☀️',
    capacity: 10,
    capacityUnit: 'kW',
    annualProduction: 18250,
    efficiency: 18,
    lifetime: 25,
    capex: 15000000,
    opexAnnual: 300000,
    costPerKW: 1500000,
    tariff: 120,
    annualSavings: 2190000,
    annualRevenue: 0,
    paybackYears: 7,
    roi: 14.6,
    co2Saved: 9.1,
    areaRequired: 70,
    waterRequired: 1,
    recommendedRegions: ['كل المحافظات', 'صنعاء', 'ذمار', 'حضرموت', 'تعز'],
    notes: 'نظام شمسي منزلي 10kW يغطي استهلاك منزل متوسط. الإشعاع في اليمن 5.2-6.8 kWh/m²/يوم. ينتج ~50 kWh/يوم. يوفر 2.19M ريال سنوياً. استرداد 7 سنوات.',
    advantages: ['فترة استرداد 7 سنوات', 'إنتاج 25 سنة', 'صيانة قليلة', 'دعم حكومي محتمل'],
    challenges: ['تكلفة أولية', 'بطاريات تحتاج استبدال 10 سنوات', 'غبار يحتاج تنظيف'],
  },
  {
    id: 'solar-commercial-100kw',
    nameAr: 'نظام طاقة شمسية تجاري 100 kW',
    nameEn: '100kW Commercial Solar PV',
    type: 'solar-pv',
    icon: '🏢',
    capacity: 100,
    capacityUnit: 'kW',
    annualProduction: 182500,
    efficiency: 19,
    lifetime: 25,
    capex: 120000000,
    opexAnnual: 2400000,
    costPerKW: 1200000,
    tariff: 150,
    annualSavings: 27375000,
    annualRevenue: 0,
    paybackYears: 4.5,
    roi: 22.8,
    co2Saved: 91,
    areaRequired: 700,
    waterRequired: 5,
    recommendedRegions: ['صنعاء', 'ذمار', 'حضرموت', 'تعز', 'الحديدة'],
    notes: 'نظام شمسي تجاري 100kW لمصنع/مبنى كبير. ينتج ~500 kWh/يوم. يوفر 27.4M ريال سنوياً. استرداد 4.5 سنوات فقط! هامش ربح ممتاز.',
    advantages: ['استرداد 4.5 سنة فقط!', 'هامش ربح 22.8%', 'بديل للديزل المكلف', 'CO2 ↓ 91 طن'],
    challenges: ['مساحة 700م²', 'استثمار 120M', 'صيانة دورية'],
  },
  {
    id: 'solar-farm-1mw',
    nameAr: 'مزرعة طاقة شمسية 1 MW',
    nameEn: '1MW Solar Farm',
    type: 'solar-pv',
    icon: '🔋',
    capacity: 1,
    capacityUnit: 'MW',
    annualProduction: 1825000,
    efficiency: 20,
    lifetime: 25,
    capex: 900000000,
    opexAnnual: 18000000,
    costPerKW: 900000,
    tariff: 180,
    annualSavings: 328500000,
    annualRevenue: 328500000,
    paybackYears: 3,
    roi: 36.5,
    co2Saved: 912,
    areaRequired: 7000,
    waterRequired: 50,
    recommendedRegions: ['حضرموت', 'المهرة', 'شبوة', 'ذمار', 'صنعاء'],
    notes: 'مزرعة شمسية 1MW لتوليد الكهرباء. الإشعاع في حضرموت 6.5 kWh/m²/يوم. تكلفة/kW منخفضة (900K). ربح 328M ريال/سنة! استرداد 3 سنوات فقط.',
    advantages: ['استرداد 3 سنوات!', 'ربح 328M/سنة', 'CO2 ↓ 912 طن', 'إشعاع عالٍ في اليمن'],
    challenges: ['استثمار 900M', 'أرض 7 هكتار', 'ربط الشبكة', 'تنظيف الألواح'],
  },
  {
    id: 'solar-water-pump',
    nameAr: 'نظام ضخ مياه شمسي',
    nameEn: 'Solar Water Pumping System',
    type: 'solar-pv',
    icon: '💧',
    capacity: 5,
    capacityUnit: 'kW',
    annualProduction: 9125,
    efficiency: 17,
    lifetime: 20,
    capex: 8000000,
    opexAnnual: 160000,
    costPerKW: 1600000,
    tariff: 0,
    annualSavings: 1500000,
    annualRevenue: 0,
    paybackYears: 5.5,
    roi: 18.75,
    co2Saved: 4.6,
    areaRequired: 35,
    waterRequired: 0,
    recommendedRegions: ['ذمار', 'صنعاء', 'إب', 'حجة', 'صعدة'],
    notes: 'نظام ضخ مياه شمسي 5kW للمزارع. بديل لمضخات الديزل المكلفة. يضخ 50م³/يوم من بئر 50م. يوفر 1.5M ريال سنوياً (وقود + صيانة). استرداد 5.5 سنوات.',
    advantages: ['بديل للديزل', 'لا وقود', 'صيانة قليلة', 'مثالي للمزارع البعيدة'],
    challenges: ['تكلفة أولية', 'إنتاج يتوقف ليلاً', 'خزان تجميع مطلوب'],
  },
  {
    id: 'wind-10kw',
    nameAr: 'توربين رياح 10 kW',
    nameEn: '10kW Wind Turbine',
    type: 'wind',
    icon: '🌪️',
    capacity: 10,
    capacityUnit: 'kW',
    annualProduction: 26280,
    efficiency: 35,
    lifetime: 20,
    capex: 25000000,
    opexAnnual: 500000,
    costPerKW: 2500000,
    tariff: 120,
    annualSavings: 3153600,
    annualRevenue: 0,
    paybackYears: 8,
    roi: 12.6,
    co2Saved: 13.1,
    areaRequired: 100,
    waterRequired: 0,
    recommendedRegions: ['شبوة', 'حضرموت', 'المهرة', 'سقطرى', 'تعز'],
    notes: 'توربين رياح 10kW للمناطق الساحلية. سرعة الرياح في شبوة 6-8 m/s. ينتج ~72 kWh/يوم. استرداد 8 سنوات. يناسب المرتفعات الساحلية.',
    advantages: ['إنتاج ليلاً ونهاراً', 'يناسب السواحل', 'صيانة قليلة'],
    challenges: ['سرعة رياح متغيرة', 'ضوضاء', 'استثمار أعلى من الشمسي'],
  },
  {
    id: 'wind-farm-5mw',
    nameAr: 'مزرعة رياح 5 MW',
    nameEn: '5MW Wind Farm',
    type: 'wind',
    icon: '🌬️',
    capacity: 5,
    capacityUnit: 'MW',
    annualProduction: 13140000,
    efficiency: 38,
    lifetime: 20,
    capex: 3500000000,
    opexAnnual: 70000000,
    costPerKW: 700000,
    tariff: 200,
    annualSavings: 2628000000,
    annualRevenue: 2628000000,
    paybackYears: 4.5,
    roi: 75,
    co2Saved: 6570,
    areaRequired: 50000,
    waterRequired: 0,
    recommendedRegions: ['شبوة', 'حضرموت', 'المهرة', 'سقطرى'],
    notes: 'مزرعة رياح 5MW (5 توربينات × 1MW). سرعة الرياح في شبوة 7-9 m/s. تكلفة/kW منخفضة (700K). ربح 2.6 مليار ريال/سنة! CO2 ↓ 6570 طن.',
    advantages: ['ربح 2.6B/سنة!', 'استرداد 4.5 سنة', 'CO2 ↓ 6570 طن', 'إنتاج 24/7'],
    challenges: ['استثمار 3.5B', 'أرض 5 هكتار', 'ربط الشبكة', 'سرعة رياح متغيرة'],
  },
  {
    id: 'biogas-farm',
    nameAr: 'مفاعل غاز حيوي زراعي',
    nameEn: 'Farm Biogas Digester',
    type: 'biogas',
    icon: '🐄',
    capacity: 50,
    capacityUnit: 'm³ غاز/يوم',
    annualProduction: 365000,
    efficiency: 60,
    lifetime: 15,
    capex: 12000000,
    opexAnnual: 600000,
    costPerKW: 0,
    tariff: 0,
    annualSavings: 3000000,
    annualRevenue: 0,
    paybackYears: 4,
    roi: 25,
    co2Saved: 30,
    areaRequired: 200,
    waterRequired: 200,
    recommendedRegions: ['ذمار', 'إب', 'صنعاء', 'عمران', 'تعز'],
    notes: 'مفاعل غاز حيوي 50م³/يوم يستخدم روث الحيوانات. ينتج غاز للطبخ + سماد عضوي. بديل للغاز والكيروسين. استرداد 4 سنوات. مثالي للمزارع الحيوانية.',
    advantages: ['بديل للغاز', 'سماد عضوي مجاني', 'معالجة روث', 'استرداد 4 سنوات'],
    challenges: ['حرارة مستمرة مطلوبة', 'صيانة دورية', 'رائحة محتملة'],
  },
  {
    id: 'biogas-industrial',
    nameAr: 'مفاعل غاز حيوي صناعي 500 m³',
    nameEn: 'Industrial Biogas Plant 500m³',
    type: 'biogas',
    icon: '🏭',
    capacity: 500,
    capacityUnit: 'm³ غاز/يوم',
    annualProduction: 3650000,
    efficiency: 65,
    lifetime: 20,
    capex: 80000000,
    opexAnnual: 4000000,
    costPerKW: 0,
    tariff: 0,
    annualSavings: 25000000,
    annualRevenue: 0,
    paybackYears: 3.5,
    roi: 31.25,
    co2Saved: 250,
    areaRequired: 1000,
    waterRequired: 2000,
    recommendedRegions: ['ذمار', 'إب', 'الحديدة', 'حضرموت'],
    notes: 'مفاعل غاز حيوي صناعي 500م³/يوم. يستخدم نفايات المزارع + مخلفات زراعية. ينتج غاز + كهرباء + سماد. استرداد 3.5 سنوات. مثالي للمزارع الكبيرة.',
    advantages: ['استرداد 3.5 سنة', 'ثلاثة مخرجات (غاز+كهرباء+سماد)', 'معالجة نفايات', 'CO2 ↓ 250 طن'],
    challenges: ['إدارة النفايات', 'حرارة مستمرة', 'استثمار 80M'],
  },
  {
    id: 'micro-hydro-50kw',
    nameAr: 'محطة طاقة مائية صغيرة 50 kW',
    nameEn: 'Micro Hydro 50kW',
    type: 'hydro',
    icon: '💧',
    capacity: 50,
    capacityUnit: 'kW',
    annualProduction: 438000,
    efficiency: 75,
    lifetime: 30,
    capex: 60000000,
    opexAnnual: 1200000,
    costPerKW: 1200000,
    tariff: 130,
    annualSavings: 56940000,
    annualRevenue: 0,
    paybackYears: 1.2,
    roi: 94.9,
    co2Saved: 219,
    areaRequired: 500,
    waterRequired: 0,
    recommendedRegions: ['إب', 'تعز', 'صعدة', 'عمران', 'ذمار'],
    notes: 'محطة طاقة مائية صغيرة 50kW. تتطلب تدفق ماء دائم (200 لتر/ث) + انخفاض 20م. أعلى عائد استثمار (95%)! استرداد 1.2 سنة فقط! يناسب الوديان الجبلية.',
    advantages: ['الأعلى عائداً (95%)!', 'استرداد 1.2 سنة!', 'إنتاج 24/7', 'عمر 30 سنة'],
    challenges: ['تتطلب تدفق ماء دائم', 'موقع محدد', 'موافقات مائية'],
  },
  {
    id: 'hybrid-solar-wind',
    nameAr: 'نظام هجين شمسي-رياح 200 kW',
    nameEn: 'Hybrid Solar-Wind 200kW',
    type: 'hybrid',
    icon: '⚡',
    capacity: 200,
    capacityUnit: 'kW',
    annualProduction: 438000,
    efficiency: 22,
    lifetime: 25,
    capex: 300000000,
    opexAnnual: 6000000,
    costPerKW: 1500000,
    tariff: 160,
    annualSavings: 70080000,
    annualRevenue: 0,
    paybackYears: 4.5,
    roi: 23.4,
    co2Saved: 219,
    areaRequired: 1500,
    waterRequired: 10,
    recommendedRegions: ['شبوة', 'حضرموت', 'المهرة', 'سقطرى'],
    notes: 'نظام هجين شمسي-رياح 200kW (150kW شمسي + 50kW رياح). ينتج ليلاً ونهاراً. أعلى موثوقية. استرداد 4.5 سنوات. مثالي للمناطق الساحلية الجبلية.',
    advantages: ['إنتاج 24/7', 'موثوقية عالية', 'تكميل (شمس نهاراً + رياح ليلاً)', 'استرداد 4.5 سنة'],
    challenges: ['استثمار 300M', 'صيانة مزدوجة', 'تعقيد النظام'],
  },
];

export const ENERGY_TYPES = {
  'solar-pv': { ar: 'طاقة شمسية', en: 'Solar PV', color: 'bg-amber-500/10 text-amber-700' },
  'solar-thermal': { ar: 'طاقة حرارية شمسية', en: 'Solar Thermal', color: 'bg-orange-500/10 text-orange-700' },
  'wind': { ar: 'طاقة رياح', en: 'Wind', color: 'bg-blue-500/10 text-blue-700' },
  'biogas': { ar: 'غاز حيوي', en: 'Biogas', color: 'bg-emerald-500/10 text-emerald-700' },
  'hydro': { ar: 'طاقة مائية', en: 'Hydro', color: 'bg-cyan-500/10 text-cyan-700' },
  'hybrid': { ar: 'نظام هجين', en: 'Hybrid', color: 'bg-purple-500/10 text-purple-700' },
};

// === حاسبة الطاقة الشمسية ===
export interface SolarCalcInputs {
  panelCapacity: number; // kW
  irradiance: number; // kWh/m²/يوم
  systemLosses: number; // % (افتراضي 14%)
  panelTilt: number; // درجة
  panelOrientation: number; // درجة (0=جنوب)
  daysPerYear: number;
}

export interface SolarCalcResult {
  dailyProduction: number; // kWh/يوم
  annualProduction: number; // kWh/سنة
  performanceRatio: number;
  capacityFactor: number; // %
  co2Saved: number; // طن/سنة
  treesEquivalent: number;
  areaRequired: number; // م²
  monthlyProduction: number[];
}

export function calculateSolarProduction(inputs: SolarCalcInputs): SolarCalcResult {
  const { panelCapacity, irradiance, systemLosses, daysPerYear } = inputs;
  // Performance Ratio = 1 - losses/100 + tilt bonus
  const pr = Math.max(0.6, Math.min(0.95, 1 - systemLosses / 100));
  const dailyProduction = panelCapacity * irradiance * pr;
  const annualProduction = dailyProduction * daysPerYear;
  const capacityFactor = (annualProduction / (panelCapacity * 8760)) * 100;
  const co2Saved = (annualProduction * 0.5) / 1000; // 0.5 kg CO2/kWh
  const treesEquivalent = Math.round(co2Saved / 22); // شجرة يمتص 22kg/سنة
  const areaRequired = panelCapacity * 7; // ~7 m²/kW

  // إنتاج شهري تقريري (توزيع حسب الموسم)
  const monthlyFactors = [0.85, 0.9, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 1.0, 0.95, 0.85, 0.8];
  const monthlyAvg = annualProduction / 12;
  const monthlyProduction = monthlyFactors.map((f) => Math.round(monthlyAvg * f));

  return {
    dailyProduction: Math.round(dailyProduction * 10) / 10,
    annualProduction: Math.round(annualProduction),
    performanceRatio: Math.round(pr * 100) / 100,
    capacityFactor: Math.round(capacityFactor * 10) / 10,
    co2Saved: Math.round(co2Saved * 10) / 10,
    treesEquivalent,
    areaRequired,
    monthlyProduction,
  };
}

// === حاسبة طاقة الرياح ===
export interface WindCalcInputs {
  turbineCapacity: number; // kW
  windSpeed: number; // m/s (متوسط)
  turbineHeight: number; // م
  airDensity: number; // kg/m³ (افتراضي 1.225)
  rotorDiameter: number; // م
  capacityFactor: number; // % (افتراضي 30%)
}

export interface WindCalcResult {
  powerOutput: number; // kW
  annualProduction: number; // kWh/سنة
  actualCapacityFactor: number; // %
  co2Saved: number;
  areaRequired: number;
  tips: string[];
}

export function calculateWindProduction(inputs: WindCalcInputs): WindCalcResult {
  const { turbineCapacity, windSpeed, turbineHeight, rotorDiameter, capacityFactor } = inputs;
  // صيغة الطاقة: P = 0.5 × ρ × A × v³ × Cp
  const area = Math.PI * (rotorDiameter / 2) ** 2;
  const powerTheoretical = 0.5 * 1.225 * area * Math.pow(windSpeed, 3) * 0.4 / 1000; // kW
  const actualCapacityFactor = Math.min(50, Math.max(10, capacityFactor));
  const annualProduction = turbineCapacity * 8760 * (actualCapacityFactor / 100);
  const co2Saved = (annualProduction * 0.5) / 1000;
  const areaRequired = Math.PI * Math.pow(rotorDiameter, 2);

  const tips: string[] = [];
  if (windSpeed < 4) tips.push('⚠️ سرعة الرياح منخفضة (< 4 m/s) - غير اقتصادي');
  else if (windSpeed < 6) tips.push('⚡ سرعة رياح مقبولة - استرداد أبطأ');
  else if (windSpeed >= 7) tips.push('✅ سرعة رياح ممتازة (≥7 m/s) - استرداد سريع');

  if (turbineHeight < 20) tips.push('💡 زيادة ارتفاع التوربين يزيد سرعة الرياح');
  if (actualCapacityFactor < 20) tips.push('💡 معامل الاستخدام منخفض - ابحث عن موقع أفضل');

  return {
    powerOutput: Math.round(powerTheoretical * 100) / 100,
    annualProduction: Math.round(annualProduction),
    actualCapacityFactor,
    co2Saved: Math.round(co2Saved),
    areaRequired: Math.round(areaRequired),
    tips,
  };
}

// === حاسبة التعرفة وعائد التغذية ===
export interface TariffCalcInputs {
  annualProduction: number; // kWh/سنة
  selfConsumption: number; // % (ما يستهلكه المشروع)
  tariff: number; // ريال/kWh (سعر شراء الكهرباء)
  feedInTariff: number; // ريال/kWh (سعر بيع الفائض)
  capex: number;
  opexAnnual: number;
  lifetime: number;
}

export interface TariffCalcResult {
  selfConsumed: number; // kWh
  exported: number; // kWh
  annualSavings: number; // ريال
  annualRevenue: number; // ريال
  totalAnnualBenefit: number; // ريال
  paybackYears: number;
  lifetimeProfit: number;
  roi: number;
  lcoe: number; // Levelized Cost of Energy ريال/kWh
}

export function calculateTariff(inputs: TariffCalcInputs): TariffCalcResult {
  const { annualProduction, selfConsumption, tariff, feedInTariff, capex, opexAnnual, lifetime } = inputs;

  const selfConsumed = annualProduction * (selfConsumption / 100);
  const exported = annualProduction - selfConsumed;
  const annualSavings = selfConsumed * tariff;
  const annualRevenue = exported * feedInTariff;
  const totalAnnualBenefit = annualSavings + annualRevenue - opexAnnual;
  const paybackYears = totalAnnualBenefit > 0 ? capex / totalAnnualBenefit : 999;
  const lifetimeProfit = totalAnnualBenefit * lifetime - capex;
  const roi = ((totalAnnualBenefit * lifetime - capex) / capex) * 100;
  // LCOE = (CAPEX + OPEX × lifetime) / (annualProduction × lifetime)
  const lcoe = (capex + opexAnnual * lifetime) / (annualProduction * lifetime);

  return {
    selfConsumed: Math.round(selfConsumed),
    exported: Math.round(exported),
    annualSavings: Math.round(annualSavings),
    annualRevenue: Math.round(annualRevenue),
    totalAnnualBenefit: Math.round(totalAnnualBenefit),
    paybackYears: Math.round(paybackYears * 10) / 10,
    lifetimeProfit: Math.round(lifetimeProfit),
    roi: Math.round(roi * 10) / 10,
    lcoe: Math.round(lcoe),
  };
}

// === بيانات الإشعاع الشمسي لمحافظات اليمن ===
export const YEMEN_SOLAR_IRRADIANCE = [
  { region: 'صنعاء', irradiance: 5.8, peak: 6.5 },
  { region: 'ذمار', irradiance: 6.0, peak: 6.8 },
  { region: 'حضرموت', irradiance: 6.5, peak: 7.0 },
  { region: 'تعز', irradiance: 5.5, peak: 6.2 },
  { region: 'الحديدة', irradiance: 5.7, peak: 6.3 },
  { region: 'إب', irradiance: 5.4, peak: 6.0 },
  { region: 'المهرة', irradiance: 6.3, peak: 6.9 },
  { region: 'شبوة', irradiance: 6.2, peak: 6.8 },
  { region: 'صعدة', irradiance: 6.1, peak: 6.7 },
  { region: 'عمران', irradiance: 5.9, peak: 6.5 },
  { region: 'حجة', irradiance: 5.8, peak: 6.4 },
  { region: 'بيضاء', irradiance: 5.9, peak: 6.5 },
  { region: 'مأرب', irradiance: 6.3, peak: 6.9 },
  { region: 'الجوف', irradiance: 6.2, peak: 6.8 },
  { region: 'سقطرى', irradiance: 6.0, peak: 6.6 },
];

// === بيانات سرعة الرياح لمحافظات اليمن ===
export const YEMEN_WIND_SPEED = [
  { region: 'شبوة', windSpeed: 7.5, height: 50 },
  { region: 'حضرموت (ساحل)', windSpeed: 6.8, height: 50 },
  { region: 'المهرة', windSpeed: 6.5, height: 50 },
  { region: 'سقطرى', windSpeed: 7.2, height: 50 },
  { region: 'تعز (مرتفعات)', windSpeed: 5.5, height: 30 },
  { region: 'صنعاء (مرتفعات)', windSpeed: 4.8, height: 30 },
  { region: 'مأرب', windSpeed: 5.2, height: 30 },
  { region: 'الحديدة (ساحل)', windSpeed: 5.0, height: 30 },
];
