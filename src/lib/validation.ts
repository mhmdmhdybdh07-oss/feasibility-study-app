// نظام التحقق من البيانات والتناسق
import type { ProjectFull } from '@/hooks/use-projects';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  field: string;
  messageAr: string;
  messageEn: string;
  study: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  isReady: boolean;
  completeness: number; // %
}

// فحص شامل للمشروع
export function validateProject(project: any): ValidationResult {
  const issues: ValidationIssue[] = [];

  // === تأسيس المشروع ===
  const est = project.establishment ?? {};
  if (!est.projectName) {
    issues.push({
      severity: 'error', study: 'establishment', field: 'projectName',
      messageAr: 'اسم المشروع مطلوب',
      messageEn: 'Project name is required',
    });
  }
  if (!est.projectType) {
    issues.push({
      severity: 'warning', study: 'establishment', field: 'projectType',
      messageAr: 'نوع المشروع غير محدد',
      messageEn: 'Project type is not specified',
    });
  }
  if (!est.projectLocation) {
    issues.push({
      severity: 'warning', study: 'establishment', field: 'projectLocation',
      messageAr: 'موقع المشروع غير محدد',
      messageEn: 'Project location is not specified',
    });
  }
  if (!est.projectCapital || Number(est.projectCapital) <= 0) {
    issues.push({
      severity: 'error', study: 'establishment', field: 'projectCapital',
      messageAr: 'رأس المال يجب أن يكون أكبر من صفر',
      messageEn: 'Capital must be greater than zero',
    });
  }
  if (!est.projectDuration || Number(est.projectDuration) <= 0) {
    issues.push({
      severity: 'warning', study: 'establishment', field: 'projectDuration',
      messageAr: 'مدة المشروع غير محددة',
      messageEn: 'Project duration is not specified',
    });
  }

  // === الدراسة المالية ===
  const fin = project.financialStudy ?? {};
  const initInv = Number(fin.initialInvestment) || 0;
  const fixedAssets = Number(fin.fixedAssets) || 0;
  const workingCapital = Number(fin.workingCapital) || 0;
  const operatingCosts = Number(fin.operatingCosts) || 0;

  if (initInv <= 0) {
    issues.push({
      severity: 'error', study: 'financialStudy', field: 'initialInvestment',
      messageAr: 'الاستثمار الأولي مطلوب ويجب أن يكون موجباً',
      messageEn: 'Initial investment is required and must be positive',
    });
  }

  // فحص التناسق: الاستثمار الأولي يجب أن يقارب مجموع الأصول
  const assetsTotal = fixedAssets + workingCapital + operatingCosts;
  if (initInv > 0 && assetsTotal > 0) {
    const diff = Math.abs(initInv - assetsTotal) / initInv;
    if (diff > 0.15) {
      issues.push({
        severity: 'warning', study: 'financialStudy', field: 'consistency',
        messageAr: `الاستثمار الأولي (${initInv}) يختلف عن مجموع الأصول والتكاليف (${assetsTotal}) بنسبة ${(diff * 100).toFixed(0)}%`,
        messageEn: `Initial investment (${initInv}) differs from assets+costs total (${assetsTotal}) by ${(diff * 100).toFixed(0)}%`,
      });
    }
  }

  // فحص القرض
  if (Number(fin.loans) > 0) {
    if (!fin.interestRate || Number(fin.interestRate) <= 0) {
      issues.push({
        severity: 'warning', study: 'financialStudy', field: 'interestRate',
        messageAr: 'معدل الفائدة غير محدد رغم وجود قرض',
        messageEn: 'Interest rate not specified despite having a loan',
      });
    }
    if (!fin.loanPeriod || Number(fin.loanPeriod) <= 0) {
      issues.push({
        severity: 'warning', study: 'financialStudy', field: 'loanPeriod',
        messageAr: 'مدة القرض غير محددة',
        messageEn: 'Loan period not specified',
      });
    }
    if (Number(fin.loans) > initInv) {
      issues.push({
        severity: 'error', study: 'financialStudy', field: 'loans',
        messageAr: 'مبلغ القرض أكبر من الاستثمار الأولي - غير منطقي',
        messageEn: 'Loan amount exceeds initial investment - illogical',
      });
    }
  }

  // فحص السنوات
  const yearsData = Array.isArray(fin.yearsData) ? fin.yearsData : [];
  if (yearsData.length === 0) {
    issues.push({
      severity: 'warning', study: 'financialStudy', field: 'yearsData',
      messageAr: 'لا توجد بيانات للتدفق النقدي السنوي',
      messageEn: 'No annual cash flow data',
    });
  } else {
    yearsData.forEach((y: any, i: number) => {
      if (Number(y.revenues) < 0) {
        issues.push({
          severity: 'error', study: 'financialStudy', field: `year${i + 1}.revenues`,
          messageAr: `إيرادات السنة ${i + 1} سالبة`,
          messageEn: `Year ${i + 1} revenues are negative`,
        });
      }
      if (Number(y.costs) > Number(y.revenues) * 2 && Number(y.revenues) > 0) {
        issues.push({
          severity: 'warning', study: 'financialStudy', field: `year${i + 1}.costs`,
          messageAr: `تكاليف السنة ${i + 1} أعلى من ضعف الإيرادات`,
          messageEn: `Year ${i + 1} costs exceed double revenues`,
        });
      }
    });

    // فحص الإيرادات المتزايدة
    if (yearsData.length >= 2) {
      const revenues = yearsData.map((y: any) => Number(y.revenues) || 0);
      const allZero = revenues.every((r: number) => r === 0);
      if (!allZero) {
        for (let i = 1; i < revenues.length; i++) {
          if (revenues[i] > 0 && revenues[i - 1] > 0 && revenues[i] < revenues[i - 1] * 0.5) {
            issues.push({
              severity: 'info', study: 'financialStudy', field: `year${i + 1}`,
              messageAr: `انخفاض حاد في إيرادات السنة ${i + 1} مقارنة بالسنة ${i}`,
              messageEn: `Sharp decline in year ${i + 1} revenues vs year ${i}`,
            });
            break;
          }
        }
      }
    }
  }

  // === الدراسة الاقتصادية ===
  const eco = project.economicStudy ?? {};
  if (!eco.discountRate || Number(eco.discountRate) <= 0) {
    issues.push({
      severity: 'warning', study: 'economicStudy', field: 'discountRate',
      messageAr: 'معدل الخصم غير محدد (الافتراضي 10%)',
      messageEn: 'Discount rate not set (default 10%)',
    });
  }
  if (Number(eco.discountRate) > 30) {
    issues.push({
      severity: 'warning', study: 'economicStudy', field: 'discountRate',
      messageAr: 'معدل الخصم مرتفع جداً (>30%) - قد يجعل كل المشاريع غير مجدية',
      messageEn: 'Discount rate is very high (>30%) - may make all projects non-viable',
    });
  }

  // === الدراسة التسويقية ===
  const market = project.marketStudy ?? {};
  if (!market.targetCustomers) {
    issues.push({
      severity: 'warning', study: 'marketStudy', field: 'targetCustomers',
      messageAr: 'العملاء المستهدفون غير محددين',
      messageEn: 'Target customers not specified',
    });
  }
  if (!market.competitors) {
    issues.push({
      severity: 'info', study: 'marketStudy', field: 'competitors',
      messageAr: 'المنافسون غير محددين',
      messageEn: 'Competitors not specified',
    });
  }
  const expectedShare = Number(market.expectedShare) || 0;
  if (expectedShare > 50) {
    issues.push({
      severity: 'warning', study: 'marketStudy', field: 'expectedShare',
      messageAr: `الحصة السوقية المتوقعة (${expectedShare}%) مرتفعة جداً`,
      messageEn: `Expected market share (${expectedShare}%) is very high`,
    });
  }

  // === الدراسة الفنية ===
  const tech = project.technicalStudy ?? {};
  if (!tech.productionCapacity) {
    issues.push({
      severity: 'info', study: 'technicalStudy', field: 'productionCapacity',
      messageAr: 'الطاقة الإنتاجية غير محددة',
      messageEn: 'Production capacity not specified',
    });
  }
  if (!tech.laborRequired || Number(tech.laborRequired) <= 0) {
    issues.push({
      severity: 'warning', study: 'technicalStudy', field: 'laborRequired',
      messageAr: 'العمالة المطلوبة غير محددة',
      messageEn: 'Required labor not specified',
    });
  }

  // === الدراسة الاجتماعية ===
  const social = project.socialStudy ?? {};
  if (!social.jobsCreated || Number(social.jobsCreated) <= 0) {
    issues.push({
      severity: 'info', study: 'socialStudy', field: 'jobsCreated',
      messageAr: 'الوظائف المباشرة غير محددة',
      messageEn: 'Direct jobs not specified',
    });
  }

  // === حساب الاكتمال ===
  const studies = ['establishment', 'socialStudy', 'environmentalStudy', 'legalStudy', 'marketStudy', 'technicalStudy', 'financialStudy', 'economicStudy'];
  let completedFields = 0;
  let totalFields = 0;
  studies.forEach((s) => {
    const data = project[s] ?? {};
    const fields = Object.keys(data);
    totalFields += fields.length > 0 ? fields.length : 5;
    completedFields += fields.filter((f) => {
      const v = data[f];
      return v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && v === 0);
    }).length;
  });
  const completeness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    isReady: errorCount === 0,
    completeness,
  };
}
