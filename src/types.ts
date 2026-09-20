export interface Student {
  id: string;
  name: string;
  parentPhone?: string;
}

export interface GroupConfig {
  id: string;
  name: string;
  teacherName?: string;
  students: Student[];
  columns: string[];
  isMuadhSpecial?: boolean;
  icon?: string;
  color?: string;
  hiddenColumns?: string[];
}

export interface RegisterColumnDef {
  id: string;
  label: string;
  shortLabel?: string;
  category: 'core' | 'recitation' | 'review' | 'management';
  description: string;
}

export const REGISTER_COLUMNS: RegisterColumnDef[] = [
  { id: 'index', label: 'الرقم التسلسلي', shortLabel: 'الرقم', category: 'core', description: 'رقم الطالب في قائمة الحلقة' },
  { id: 'studentName', label: 'اسم الطالب الثلاثي', shortLabel: 'اسم الطالب', category: 'core', description: 'الاسم الكامل للطالب المقيد' },
  { id: 'surahVerses', label: 'السورة من آية إلى آية', shortLabel: 'السورة والآيات', category: 'recitation', description: 'تحديد اسم السورة ورقم الآيات الحالية' },
  { id: 'notice', label: 'عمود تنبيه', shortLabel: 'تنبيه', category: 'recitation', description: 'ملاحظة سريعة على أخطاء التجويد' },
  { id: 'hesitation', label: 'عمود تردد', shortLabel: 'تردد', category: 'recitation', description: 'تسجيل مواضع التردد والبطء' },
  { id: 'stoppage', label: 'عمود توقف', shortLabel: 'توقف', category: 'recitation', description: 'تسجيل مواضع التوقف والخطأ الحلي' },
  { id: 'prompt', label: 'عمود فتح', shortLabel: 'فتح', category: 'recitation', description: 'مشاركات الفتح وتلقين الأخطاء' },
  { id: 'recited', label: 'حالة التسميع (سمع/لم يسمع)', shortLabel: 'التسميع', category: 'recitation', description: 'تأكيد التسميع الفعلي للحفظ' },
  { id: 'minorReview', label: 'المراجعة الصغرى', shortLabel: 'الصغرى', category: 'review', description: 'تقييم مراجعة المحفوظ القريب' },
  { id: 'majorReview', label: 'المراجعة العظمى/الكبرى', shortLabel: 'العظمى', category: 'review', description: 'تقييم مراجعة المحفوظ القديم' },
  { id: 'attendance', label: 'حالة الحضور والغياب', shortLabel: 'الحضور', category: 'management', description: 'حاضر / غائب / مأذون' },
  { id: 'homework', label: 'الواجب المنزلي القادم', shortLabel: 'الواجب', category: 'management', description: 'المقدار المطلوب تسميعه للغد' },
  { id: 'notes', label: 'الملاحظة والتقييم الخاص', shortLabel: 'الملاحظة والتقييم', category: 'management', description: 'ملاحظات المعلم الخاصة بالتقييم' },
  { id: 'signed', label: 'توقيع المعلم المعتمد', shortLabel: 'توقيع المعلم', category: 'management', description: 'اعتماد خانة التسميع والتحضير' },
];

export interface EvaluationRecord {
  surahVerses?: string;
  notice?: string;      // تنبيه
  hesitation?: string;  // تردد
  stoppage?: string;    // توقف
  prompt?: string;      // فتح
  recited?: 'سمع' | 'لم يسمع' | '';
  minorReview?: string; // الصغرى
  majorReview?: string; // العظمى/الكبرى
  attendance?: 'حاضر' | 'غائب' | 'مأذون' | '';
  homework?: string;    // الواجب
  notes?: string;       // الملاحظة والتنبيه والتقييم (خاص بحلقة معاذ)
  signed?: boolean;     // توقيع المعلم
}

// Map key: `${groupId}_${monthName}_${dayNumber}_${studentId}`
export type EvaluationDataMap = Record<string, EvaluationRecord>;

export interface HijriDay {
  day: number;
  weekday: string;
  weekday_index: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  is_weekend: boolean;
  is_thursday?: boolean;
  is_friday: boolean;
  is_saturday?: boolean;
  is_study_day: boolean;
}

export interface HijriCalendarData {
  month_name: string;
  year: number;
  days_in_month: number;
  start_weekday: number;
  days: HijriDay[];
}

export type ExportScope = 'remaining' | 'full_year' | 'single_group' | 'current_month';
