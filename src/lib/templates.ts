// قوالب المشاريع الجاهزة - بيانات افتراضية لتسريع إنشاء دراسات الجدوى

export interface ProjectTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string; // emoji
  descriptionAr: string;
  descriptionEn: string;
  category: 'industrial' | 'agricultural' | 'commercial' | 'service' | 'food';
  defaultData: {
    establishment: Record<string, any>;
    technicalStudy: Record<string, any>;
    marketStudy: Record<string, any>;
  };
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'restaurant',
    nameAr: 'مطعم',
    nameEn: 'Restaurant',
    icon: '🍽️',
    descriptionAr: 'مطعم خدمة طعام تقليدي أو سريع',
    descriptionEn: 'Traditional or fast food restaurant',
    category: 'food',
    defaultData: {
      establishment: {
        projectType: 'مطعم',
        projectSector: 'خدمات غذائية',
        projectDuration: 5,
        projectDescription: 'مطعم لتقديم الوجبات اليومية والمأكولات المحلية',
        projectGoals: 'تقديم خدمة طعام عالية الجودة بأسعار منافسة',
      },
      technicalStudy: {
        productionCapacity: '200 وجبة/يوم',
        productionVolume: 73000,
        laborRequired: 8,
        location: 'منطقة تجارية مأهولة',
        utilities: 'مياه، كهرباء، صرف صحي',
        equipment: 'ثلاجات، أفران، أواني طهي، طاولات تحضير',
        rawMaterials: 'لحوم، خضروات، أرز، بهارات، مشروبات',
      },
      marketStudy: {
        targetCustomers: 'الأسر، الموظفون، الطلاب',
        expectedShare: 5,
        growthRate: 8,
        productPrice: 1500,
        competitors: 'المطاعم المحلية في نفس المنطقة',
        segments: 'عائلات، أفراد، طلبات توصيل',
      },
    },
  },
  {
    id: 'dairy-factory',
    nameAr: 'مصنع ألبان',
    nameEn: 'Dairy Factory',
    icon: '🥛',
    descriptionAr: 'مصنع لإنتاج وتعبئة منتجات الألبان',
    descriptionEn: 'Dairy products manufacturing and packaging',
    category: 'industrial',
    defaultData: {
      establishment: {
        projectType: 'مصنع تصنيع غذائي',
        projectSector: 'صناعة غذائية',
        projectDuration: 7,
        projectDescription: 'مصنع متكامل لإنتاج الحليب والزبادي والجبن',
        projectGoals: 'تلبية الطلب المحلي على منتجات الألبان وتقليل الاستيراد',
      },
      technicalStudy: {
        productionCapacity: '5000 لتر/يوم',
        productionVolume: 1825000,
        laborRequired: 25,
        location: 'منطقة صناعية قرب مصادر الحليب',
        utilities: 'مياه نقية، كهرباء ثلاثية الأطوار، تبريد',
        equipment: 'خزانات حفظ، معقمات، ماكينات تعبئة، مبردات',
        rawMaterials: 'حليب خام، عبوات، ثقافات بكتيرية، ملح',
        qualityControl: 'مختبر فحص، شهادات صحية',
      },
      marketStudy: {
        targetCustomers: 'تجار الجملة، محلات السوبر ماركت، الأسر',
        expectedShare: 8,
        growthRate: 12,
        productPrice: 200,
        competitors: 'المنتجات المستوردة والمصانع المحلية',
        segments: 'جملة، تجزئة، HORECA',
      },
    },
  },
  {
    id: 'farm',
    nameAr: 'مزرعة دواجن',
    nameEn: 'Poultry Farm',
    icon: '🐔',
    descriptionAr: 'مزرعة تربية دواجن لإنتاج اللحوم',
    descriptionEn: 'Broiler poultry farm',
    category: 'agricultural',
    defaultData: {
      establishment: {
        projectType: 'مزرعة دواجن',
        projectSector: 'ثروة حيوانية',
        projectDuration: 5,
        projectDescription: 'مزرعة لتربية وتسمين الدواجن لإنتاج لحوم الطيور',
        projectGoals: 'توفير لحوم الدواجن الطازجة للسوق المحلي',
      },
      technicalStudy: {
        productionCapacity: '10000 طير/دورة',
        productionVolume: 60000,
        laborRequired: 4,
        location: 'منطقة ريفية بعيدة عن السكن',
        utilities: 'مياه، كهرباء، تهوية',
        equipment: 'حظائر، معالف، مساقي، نظام تهوية، سخانات',
        rawMaterials: 'كتاكيت، علف، أدوية بيطرية، نشارة',
        qualityControl: 'متابعة بيطرية دورية',
      },
      marketStudy: {
        targetCustomers: 'تجار الجملة، محلات الدواجن، المطاعم',
        expectedShare: 6,
        growthRate: 10,
        productPrice: 1200,
        competitors: 'المزارع المحلية والواردات',
        segments: 'جملة، تجزئة',
      },
    },
  },
  {
    id: 'retail-store',
    nameAr: 'متجر تجزئة',
    nameEn: 'Retail Store',
    icon: '🏪',
    descriptionAr: 'بقالة أو متجر تجزئة للسلع الاستهلاكية',
    descriptionEn: 'Grocery and consumer goods retail store',
    category: 'commercial',
    defaultData: {
      establishment: {
        projectType: 'متجر تجزئة',
        projectSector: 'تجارة',
        projectDuration: 5,
        projectDescription: 'متجر لبيع السلع الغذائية والاستهلاكية اليومية',
        projectGoals: 'توفير السلع الأساسية للأحياء السكنية',
      },
      technicalStudy: {
        productionCapacity: '—',
        laborRequired: 3,
        location: 'حي سكني كثيف',
        utilities: 'كهرباء، تبريد',
        equipment: 'رفوف، ثلاجات عرض، كاشير، نظام نقاط بيع',
        rawMaterials: 'سلع غذائية ومنزلية متنوعة',
      },
      marketStudy: {
        targetCustomers: 'سكان الحي والأحياء المجاورة',
        expectedShare: 15,
        growthRate: 5,
        productPrice: 0,
        competitors: 'البقالات والمتاجر المجاورة',
        segments: 'أفراد، أسر',
      },
    },
  },
  {
    id: 'car-wash',
    nameAr: 'محطة غسيل سيارات',
    nameEn: 'Car Wash Station',
    icon: '🚗',
    descriptionAr: 'محطة غسيل وتنظيف سيارات',
    descriptionEn: 'Car wash and detailing station',
    category: 'service',
    defaultData: {
      establishment: {
        projectType: 'خدمة',
        projectSector: 'خدمات',
        projectDuration: 5,
        projectDescription: 'محطة غسيل سيارات يدوي وآلي مع خدمات تلميع',
        projectGoals: 'تقديم خدمة غسيل سيارات احترافية',
      },
      technicalStudy: {
        productionCapacity: '40 سيارة/يوم',
        productionVolume: 14600,
        laborRequired: 6,
        location: 'طريق رئيسي أو محطة وقود',
        utilities: 'مياه، كهرباء، صرف',
        equipment: 'ضغاط مياه، ماكينات تلميع، شفاطات، مضخات',
        rawMaterials: 'منظفات، شامبو سيارات، ملمع، إسفنج',
      },
      marketStudy: {
        targetCustomers: 'أصحاب السيارات',
        expectedShare: 10,
        growthRate: 7,
        productPrice: 1000,
        competitors: 'محطات الغسيل الأخرى في المنطقة',
        segments: 'سيارات شخصية، تكسي، شركات',
      },
    },
  },
  {
    id: 'bakery',
    nameAr: 'مخبز',
    nameEn: 'Bakery',
    icon: '🥖',
    descriptionAr: 'مخبز لإنتاج الخبز والمعجنات',
    descriptionEn: 'Bread and pastries bakery',
    category: 'food',
    defaultData: {
      establishment: {
        projectType: 'مخبز',
        projectSector: 'صناعة غذائية',
        projectDuration: 6,
        projectDescription: 'مخبز لإنتاج الخبز والمعجنات اليومية',
        projectGoals: 'توفير الخبز الطازج للمنطقة',
      },
      technicalStudy: {
        productionCapacity: '2000 رغيف/يوم',
        productionVolume: 730000,
        laborRequired: 7,
        location: 'منطقة سكنية',
        utilities: 'مياه، كهرباء، غاز',
        equipment: 'فرن صناعي، عجانات، ماكينة تقطيع، عربات نقل',
        rawMaterials: 'دقيق، خميرة، ملح، سكر، زيت',
      },
      marketStudy: {
        targetCustomers: 'الأسر، المحلات، المطاعم',
        expectedShare: 12,
        growthRate: 6,
        productPrice: 50,
        competitors: 'المخابز الأخرى في المنطقة',
        segments: 'أفراد، جملة',
      },
    },
  },
  {
    id: 'tailoring',
    nameAr: 'مشغل خياطة',
    nameEn: 'Tailoring Workshop',
    icon: '🧵',
    descriptionAr: 'مشغل لخياطة وتفصيل الملابس',
    descriptionEn: 'Tailoring and clothing workshop',
    category: 'service',
    defaultData: {
      establishment: {
        projectType: 'مشغل خياطة',
        projectSector: 'خدمات',
        projectDuration: 5,
        projectDescription: 'مشغل لخياطة الملابس الرجالية والنسائية',
        projectGoals: 'تقديم خدمة خياطة عالية الجودة',
      },
      technicalStudy: {
        productionCapacity: '20 قطعة/يوم',
        productionVolume: 7300,
        laborRequired: 5,
        location: 'منطقة تجارية',
        utilities: 'كهرباء',
        equipment: 'ماكينات خياطة، أفران كي، طاولات قص',
        rawMaterials: 'أقمشة، خيوط، أزرار، سحابات',
      },
      marketStudy: {
        targetCustomers: 'الأفراد، الأسر',
        expectedShare: 8,
        growthRate: 5,
        productPrice: 3000,
        competitors: 'المشاغل الأخرى في المنطقة',
        segments: 'رجالي، نسائي، أطفال',
      },
    },
  },
  {
    id: 'pharmacy',
    nameAr: 'صيدلية',
    nameEn: 'Pharmacy',
    icon: '💊',
    descriptionAr: 'صيدلية لبيع الأدوية والمستلزمات الطبية',
    descriptionEn: 'Pharmacy for medicines and medical supplies',
    category: 'service',
    defaultData: {
      establishment: {
        projectType: 'صيدلية',
        projectSector: 'خدمات صحية',
        projectDuration: 7,
        projectDescription: 'صيدلية لبيع الأدوية والمستلزمات الطبية',
        projectGoals: 'توفير الأدوية الآمنة للمنطقة',
      },
      technicalStudy: {
        productionCapacity: '—',
        laborRequired: 4,
        location: 'منطقة تجارية أو قرب مستشفى',
        utilities: 'كهرباء، تكييف، تبريد',
        equipment: 'رفوف، ثلاجات أدوية، كاشير، نظام مخزون',
        rawMaterials: 'أدوية، مكملات، مستلزمات طبية',
      },
      marketStudy: {
        targetCustomers: 'الأفراد، العيادات، المستشفيات',
        expectedShare: 10,
        growthRate: 8,
        productPrice: 0,
        competitors: 'الصيدليات المجاورة',
        segments: 'أفراد، مؤسسات',
      },
    },
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}

export const TEMPLATE_CATEGORIES = {
  industrial: { ar: 'صناعي', en: 'Industrial' },
  agricultural: { ar: 'زراعي', en: 'Agricultural' },
  commercial: { ar: 'تجاري', en: 'Commercial' },
  service: { ar: 'خدمي', en: 'Service' },
  food: { ar: 'غذائي', en: 'Food' },
};
