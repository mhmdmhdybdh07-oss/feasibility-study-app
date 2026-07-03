// محلل التربة وحاسبة استصلاح الأراضي

export interface SoilAnalysis {
  // الخصائص الفيزيائية
  ph: number; // 0-14
  ec: number; // dS/m - ملوحة
  organicMatter: number; // %
  clayContent: number; // %
  sandContent: number; // %
  siltContent: number; // %
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  depth: number; // سم - عمق التربة
  slope: number; // % - الانحدار
}

export interface SoilClassification {
  texture: string; // تصنيف القوام
  textureAr: string;
  fertility: 'low' | 'medium' | 'high';
  fertilityAr: string;
  drainage: 'poor' | 'moderate' | 'good' | 'excessive';
  drainageAr: string;
  salinityLevel: 'none' | 'slight' | 'moderate' | 'high' | 'very_high';
  salinityAr: string;
  phLevel: 'acidic' | 'slightly_acidic' | 'neutral' | 'slightly_alkaline' | 'alkaline';
  phAr: string;
  recommendations: string[];
  suitableCrops: string[];
}

export function analyzeSoil(soil: SoilAnalysis): SoilClassification {
  const recommendations: string[] = [];
  const suitableCrops: string[] = [];

  // تصنيف القوام (مثلث القوام المبسّط)
  let texture = 'Loam';
  let textureAr = 'طميية';
  const { clayContent, sandContent, siltContent } = soil;

  if (sandContent > 85) { texture = 'Sand'; textureAr = 'رملية'; }
  else if (clayContent > 60) { texture = 'Heavy Clay'; textureAr = 'طينية ثقيلة'; }
  else if (clayContent > 40 && sandContent < 30) { texture = 'Clay Loam'; textureAr = 'طميية طينية'; }
  else if (sandContent > 70 && clayContent < 15) { texture = 'Sandy Loam'; textureAr = 'رملية طميية'; }
  else if (siltContent > 50) { texture = 'Silt Loam'; textureAr = 'طميية غرينية'; }

  // الخصوبة
  let fertility: SoilClassification['fertility'] = 'medium';
  if (soil.organicMatter < 1 && soil.nitrogen < 20) fertility = 'low';
  else if (soil.organicMatter > 3 && soil.nitrogen > 50) fertility = 'high';

  // الصرف
  let drainage: SoilClassification['drainage'] = 'moderate';
  if (clayContent > 50) drainage = 'poor';
  else if (sandContent > 70) drainage = 'excessive';
  else if (sandContent > 50 && clayContent < 20) drainage = 'good';

  // الملوحة
  let salinityLevel: SoilClassification['salinityLevel'] = 'none';
  if (soil.ec < 2) salinityLevel = 'none';
  else if (soil.ec < 4) salinityLevel = 'slight';
  else if (soil.ec < 8) salinityLevel = 'moderate';
  else if (soil.ec < 16) salinityLevel = 'high';
  else salinityLevel = 'very_high';

  // الحموضة
  let phLevel: SoilClassification['phLevel'] = 'neutral';
  if (soil.ph < 5.5) phLevel = 'acidic';
  else if (soil.ph < 6.5) phLevel = 'slightly_acidic';
  else if (soil.ph < 7.5) phLevel = 'neutral';
  else if (soil.ph < 8.5) phLevel = 'slightly_alkaline';
  else phLevel = 'alkaline';

  // التوصيات
  if (fertility === 'low') {
    recommendations.push('إضافة سماد عضوي (روث حيواني متخمر) بمعدل 20-30 طن/هكتار');
    recommendations.push('زراعة محاصيل بقولية لتحسين النيتروجين (فول، عدس، لوبيا)');
  }
  if (salinityLevel === 'moderate' || salinityLevel === 'high') {
    recommendations.push('غسيل التربة بمياه عذبة (1500-3000 م³/هكتار)');
    recommendations.push('إضافة جبس زراعي (3-5 طن/هكتار) لتحسين بنية التربة');
    recommendations.push('اختيار محاصيل متحملة للملوحة (شعير، نخيل، سدر)');
  }
  if (phLevel === 'acidic') {
    recommendations.push('إضافة حجر جيري (2-4 طن/هكتار) لرفع الـ PH');
  } else if (phLevel === 'alkaline') {
    recommendations.push('إضافة كبريت زراعي (500-1000 كغ/هكتار) لخفض الـ PH');
    recommendations.push('إضافة أسمدة حامضية (سلفات الأمونيوم)');
  }
  if (drainage === 'poor') {
    recommendations.push('إنشاء شبكة صرف صحي (50-100م بين الخنادق)');
    recommendations.push('زراعة على مصاطب مرتفعة (30-40 سم)');
  } else if (drainage === 'excessive') {
    recommendations.push('إضافة طين أو مادة عضوية لتحسين الاحتفاظ بالماء');
    recommendations.push('استخدام نشارة لتقليل التبخر');
  }
  if (soil.depth < 30) {
    recommendations.push('تفكيك التربة العميقة (Subsoiling) لتحسين渗透 الماء والجذور');
  }
  if (soil.slope > 5) {
    recommendations.push('بناء مدرجات زراعية (Terraces) لمنع الانجراف');
    recommendations.push('زراعة محاصيل تغطية لمنع تآكل التربة');
  }
  if (soil.organicMatter < 2) {
    recommendations.push('إضافة سماد عضوي (10-15 طن/هكتار) سنوياً');
    recommendations.push('تطبيق الزراعة بدون حرث للحفاظ على المادة العضوية');
  }

  // المحاصيل المناسبة
  if (salinityLevel === 'high' || salinityLevel === 'very_high') {
    suitableCrops.push('شعير', 'نخيل', 'سدر', 'ذرة رفيعة');
  } else if (drainage === 'good' || drainage === 'moderate') {
    if (phLevel === 'neutral' || phLevel === 'slightly_alkaline') {
      suitableCrops.push('قمح', 'بصل', 'طماطم', 'مانجو', 'عنب', 'رمان');
    }
  }
  if (soil.depth > 60 && fertility === 'high') {
    suitableCrops.push('موز', 'مانجو', 'بُن عربي', 'قات');
  }
  if (sandContent > 60) {
    suitableCrops.push('بطيخ', 'تمور', 'سمسم');
  }

  return {
    texture,
    textureAr,
    fertility,
    fertilityAr: fertility === 'low' ? 'منخفضة' : fertility === 'medium' ? 'متوسطة' : 'عالية',
    drainage,
    drainageAr: drainage === 'poor' ? 'ضعيف' : drainage === 'moderate' ? 'متوسط' : drainage === 'good' ? 'جيد' : 'زائد',
    salinityLevel,
    salinityAr: salinityLevel === 'none' ? 'لا توجد' : salinityLevel === 'slight' ? 'خفيفة' : salinityLevel === 'moderate' ? 'متوسطة' : salinityLevel === 'high' ? 'عالية' : 'شديدة جداً',
    phLevel,
    phAr: phLevel === 'acidic' ? 'حامضية' : phLevel === 'slightly_acidic' ? 'حامضية خفيفة' : phLevel === 'neutral' ? 'متعادلة' : phLevel === 'slightly_alkaline' ? 'قلوية خفيفة' : 'قلوية',
    recommendations: [...new Set(recommendations)],
    suitableCrops: [...new Set(suitableCrops)],
  };
}

// === حاسبة استصلاح الأراضي ===

export interface LandReclamationInputs {
  area: number; // هكتار
  slope: number; // %
  vegetation: 'none' | 'light' | 'medium' | 'dense';
  rockType: 'soft' | 'medium' | 'hard';
  waterSource: 'well' | 'canal' | 'rain' | 'none';
  distanceToWater: number; // متر - المسافة لمصدر المياه
  soilDepth: number; // سم
  needsLeveling: boolean;
  needsDrainage: boolean;
  needsFencing: boolean;
  needsRoadAccess: boolean;
}

export interface ReclamationItem {
  category: string;
  categoryAr: string;
  description: string;
  unit: string;
  quantity: number;
  unitCost: number; // ريال يمني
  totalCost: number; // ريال يمني
}

export interface ReclamationResult {
  items: ReclamationItem[];
  totalCost: number;
  costPerHectare: number;
  durationMonths: number;
  recommendations: string[];
  phases: Array<{ phase: string; durationMonths: number; cost: number; description: string }>;
}

export function calculateReclamation(inputs: LandReclamationInputs): ReclamationResult {
  const items: ReclamationItem[] = [];
  const { area, slope, vegetation, rockType, waterSource, distanceToWater, soilDepth, needsLeveling, needsDrainage, needsFencing, needsRoadAccess } = inputs;

  // 1. إزالة النباتات
  if (vegetation !== 'none') {
    const vegCost = vegetation === 'light' ? 200000 : vegetation === 'medium' ? 400000 : 800000;
    items.push({
      category: 'clearing', categoryAr: 'إزالة النباتات',
      description: `إزالة نباتات (${vegetation})`,
      unit: 'هكتار', quantity: area, unitCost: vegCost, totalCost: vegCost * area,
    });
  }

  // 2. تسوية الأرض
  if (needsLeveling) {
    const slopeFactor = 1 + slope / 20;
    const levelingCost = Math.round(800000 * slopeFactor);
    items.push({
      category: 'leveling', categoryAr: 'التسوية',
      description: `تسوية أرض بانحدار ${slope}%`,
      unit: 'هكتار', quantity: area, unitCost: levelingCost, totalCost: levelingCost * area,
    });
  }

  // 3. تفكيك الصخور
  if (rockType !== 'soft') {
    const rockCost = rockType === 'medium' ? 1500000 : 3000000;
    const rockQty = area * 0.3; // 30% من المساحة
    items.push({
      category: 'rock', categoryAr: 'تفكيك الصخور',
      description: `تفكيك صخور (${rockType})`,
      unit: 'هكتار', quantity: rockQty, unitCost: rockCost, totalCost: rockCost * rockQty,
    });
  }

  // 4. حرث عميق (Subsoiling)
  if (soilDepth < 50) {
    items.push({
      category: 'subsoiling', categoryAr: 'حرث عميق',
      description: 'تفكيك الطبقة الصلبة تحت التربة',
      unit: 'هكتار', quantity: area, unitCost: 600000, totalCost: 600000 * area,
    });
  }

  // 5. مصدر المياه
  if (waterSource === 'well') {
    items.push({
      category: 'water', categoryAr: 'حفر بئر',
      description: 'حفر بئر ارتوازي عمق 120م + مضخة',
      unit: 'بئر', quantity: Math.ceil(area / 25), unitCost: 25000000, totalCost: Math.ceil(area / 25) * 25000000,
    });
  } else if (waterSource === 'canal') {
    const canalCost = 50000 * distanceToWater;
    items.push({
      category: 'water', categoryAr: 'قناة مائية',
      description: `قناة مائية طول ${distanceToWater}م`,
      unit: 'متر', quantity: distanceToWater, unitCost: 50000, totalCost: canalCost,
    });
  }

  // 6. شبكة الصرف
  if (needsDrainage) {
    items.push({
      category: 'drainage', categoryAr: 'شبكة صرف',
      description: 'خنادق صرف كل 50م، عمق 1.2م',
      unit: 'هكتار', quantity: area, unitCost: 1200000, totalCost: 1200000 * area,
    });
  }

  // 7. نظام الري
  items.push({
    category: 'irrigation', categoryAr: 'نظام ري بالتنقيط',
    description: 'نظام ري بالتنقيط كامل (أنابيب، فوهات، فلتر)',
    unit: 'هكتار', quantity: area, unitCost: 2500000, totalCost: 2500000 * area,
  });

  // 8. تحسين التربة
  items.push({
    category: 'soil_amendment', categoryAr: 'تحسين التربة',
    description: 'إضافة سماد عضوي (20 طن/هكتار) + جبس زراعي',
    unit: 'هكتار', quantity: area, unitCost: 1500000, totalCost: 1500000 * area,
  });

  // 9. سور
  if (needsFencing) {
    items.push({
      category: 'fencing', categoryAr: 'سور',
      description: 'سور شبكي بأعمدة خرسانية + بوابة',
      unit: 'متر', quantity: Math.sqrt(area) * 4 * 31.62, // محيط تقريبي
      unitCost: 15000,
      totalCost: Math.sqrt(area) * 4 * 31.62 * 15000,
    });
  }

  // 10. طريق وصول
  if (needsRoadAccess) {
    items.push({
      category: 'road', categoryAr: 'طريق وصول',
      description: 'تسوية + رصف حصوي',
      unit: 'متر', quantity: 200, unitCost: 100000, totalCost: 200 * 100000,
    });
  }

  // 11. مباني إدارية
  items.push({
    category: 'building', categoryAr: 'مباني إدارية',
    description: 'مكتب + تخزين + سكن عمال (60 م²)',
    unit: 'مبنى', quantity: 1, unitCost: 15000000, totalCost: 15000000,
  });

  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  // التوصيات
  const recommendations: string[] = [];
  if (slope > 10) recommendations.push('⚠️ الأرض شديدة الانحدار - يلزم بناء مدرجات قبل الزراعة');
  if (rockType === 'hard') recommendations.push('⚠️ توفّر المعدات الثقيلة (حفارات) قد يستغرق وقتاً أطول');
  if (waterSource === 'rain' && area > 10) recommendations.push('⚠️ للمناطق البعلية يُنصح بإنشاء حواجز مائية (حصد المطر)');
  if (vegetation === 'dense') recommendations.push('يمكن استخدام النباتات المزالة كسماد عضوي بعد التخمير');
  recommendations.push('يفضّل تنفيذ الاستصلاح على مراحل (10-20 هكتار/مرحلة) لإدارة التكلفة');
  recommendations.push('الحصول على فحص تربة معتمد من مختبر زراعي قبل البدء');

  // المراحل الزمنية
  const phases = [
    { phase: 'التحضير والتراخيص', durationMonths: 2, cost: totalCost * 0.02, description: 'دراسة، تراخيص، مسح تربة' },
    { phase: 'إزالة النباتات والصخور', durationMonths: 2, cost: items.filter(i => i.category === 'clearing' || i.category === 'rock').reduce((s, i) => s + i.totalCost, 0), description: 'تنظيف الأرض' },
    { phase: 'التسوية والحرث', durationMonths: 2, cost: items.filter(i => i.category === 'leveling' || i.category === 'subsoiling').reduce((s, i) => s + i.totalCost, 0), description: 'تسوية + تفكيك' },
    { phase: 'البنية التحتية المائية', durationMonths: 3, cost: items.filter(i => i.category === 'water' || i.category === 'drainage' || i.category === 'irrigation').reduce((s, i) => s + i.totalCost, 0), description: 'آبار + ري + صرف' },
    { phase: 'تحسين التربة والمرافق', durationMonths: 2, cost: items.filter(i => i.category === 'soil_amendment' || i.category === 'building' || i.category === 'fencing' || i.category === 'road').reduce((s, i) => s + i.totalCost, 0), description: 'سماد + سور + مباني' },
  ];

  const totalDuration = phases.reduce((s, p) => s + p.durationMonths, 0);

  return {
    items,
    totalCost,
    costPerHectare: totalCost / area,
    durationMonths: totalDuration,
    recommendations,
    phases,
  };
}

// === حاسبة الاحتياجات المائية ===

export interface WaterNeedInputs {
  cropId: string;
  area: number; // هكتار
  region: string;
  temperature: number; // °C متوسط
  humidity: number; // %
  windSpeed: number; // m/s
  rainfallEffective: number; // مم فعّالة خلال الموسم
  irrigationEfficiency: number; // 0-1 (تنقيط 0.9، رش 0.75، غمر 0.6)
}

export interface WaterNeedResult {
  etc: number; // Evapotranspiration للمحصول مم/موسم
  netIrrigation: number; // الصافي مم
  grossIrrigation: number; // الإجمالي مم
  netVolume: number; // م³/هكتار صافي
  grossVolume: number; // م³/هكتار إجمالي
  totalWater: number; // م³ لكل المساحة
  dailyPeak: number; // م³/يوم الذروة
  pumpCapacity: number; // لتر/ثانية مطلوبة
  recommendations: string[];
}

export function calculateWaterNeed(crop: any, inputs: WaterNeedInputs): WaterNeedResult {
  // حساب ET0 (تبخر نتجريبي مبسّط - Penman-Monteith مبسّط)
  // ET0 ≈ 0.0023 × (Tmean + 17.8) × (Tmax - Tmin)^0.5 × Ra
  // مبسّط: ET0 = 4 + 0.15 * T (تقدير يومي)
  const et0Daily = 4 + 0.15 * inputs.temperature; // مم/يوم
  const seasonDays = crop?.maturityDays ?? 120;
  const et0Season = et0Daily * seasonDays;

  // معامل المحصول (Kc) - تقديري
  const kc = crop?.waterNeedMm ? crop.waterNeedMm / et0Season : 0.8;
  const etc = et0Season * Math.min(1.2, Math.max(0.4, kc));

  // صافي الاحتياج = ETC - الأمطار الفعّالة
  const netIrrigation = Math.max(0, etc - inputs.rainfallEffective);
  // إجمالي = الصافي / كفاءة الري
  const grossIrrigation = netIrrigation / Math.max(0.5, inputs.irrigationEfficiency);

  // الأحجام
  const netVolume = netIrrigation * 10; // م³/هكتار (1 مم = 10 م³/هكتار)
  const grossVolume = grossIrrigation * 10;
  const totalWater = grossVolume * inputs.area;

  // الذروة اليومية (تقدير 1/100 من الموسم)
  const dailyPeak = totalWater / (seasonDays * 0.5); // أعلى 50% من المتوسط
  const pumpCapacity = (dailyPeak / 86400) * 1000; // لتر/ثانية

  const recommendations: string[] = [];
  if (inputs.irrigationEfficiency < 0.7) {
    recommendations.push('🔧 تحويل لنظام الري بالتنقيط لرفع الكفاءة إلى 90%');
  }
  if (grossIrrigation > 800) {
    recommendations.push('⚠️ استهلاك مائي عالٍ - يُنصح بمحاصيل أقل استهلاكاً أو زيادة مصادر المياه');
  }
  if (inputs.rainfallEffective > etc * 0.5) {
    recommendations.push('✅ الأمطار تغطي جزءاً كبيراً - يمكن الاعتماد على الري التكميلي فقط');
  }
  recommendations.push(`💡 مطلوب مضخة بقدرة ${pumpCapacity.toFixed(1)} لتر/ثانية لتغطية الذروة`);
  recommendations.push(`💧 ينصح بخزان تجميع بقدرة ${(dailyPeak * 3).toFixed(0)} م³ لتغطية 3 أيام`);

  return {
    etc,
    netIrrigation,
    grossIrrigation,
    netVolume,
    grossVolume,
    totalWater,
    dailyPeak,
    pumpCapacity,
    recommendations,
  };
}
