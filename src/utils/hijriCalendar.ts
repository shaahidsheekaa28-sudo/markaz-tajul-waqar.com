import { HijriCalendarData, HijriDay } from '../types';

export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الثانية',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const ARABIC_DAYS = [
  'الأحد',     // 0 - Sunday
  'الإثنين',   // 1 - Monday
  'الثلاثاء',  // 2 - Tuesday
  'الأربعاء',  // 3 - Wednesday
  'الخميس',    // 4 - Thursday
  'الجمعة',    // 5 - Friday (Weekend)
  'السبت',     // 6 - Saturday (Weekend)
];

export function getHijriMonthDays(monthName: string, year = 1448): number {
  const monthIndex = HIJRI_MONTHS.indexOf(monthName);
  if (monthIndex === -1) return 30;

  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  const isLeapYear = leapYears.includes(year % 30);

  let days = monthLengths[monthIndex];
  if (monthIndex === 11 && isLeapYear) {
    days = 30;
  }
  return days;
}

export function getHijriMonthStartDay(monthName: string, year = 1448): number {
  const baseWeekday = 2; // Tuesday (الثلاثاء) for 1 Muharram 1448 AH
  const targetIndex = HIJRI_MONTHS.indexOf(monthName);
  if (targetIndex === -1) return 0;

  let daysSoFar = 0;
  for (let i = 0; i < targetIndex; i++) {
    daysSoFar += getHijriMonthDays(HIJRI_MONTHS[i], year);
  }

  return (baseWeekday + daysSoFar) % 7;
}

export function generateHijriMonthCalendar(monthName: string, year = 1448): HijriCalendarData {
  const daysInMonth = getHijriMonthDays(monthName, year);
  const startWeekday = getHijriMonthStartDay(monthName, year);

  const days: HijriDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const weekdayIndex = (startWeekday + day - 1) % 7;
    const dayName = ARABIC_DAYS[weekdayIndex];
    const isWeekend = weekdayIndex === 4 || weekdayIndex === 5; // Thursday (4) & Friday (5)

    days.push({
      day,
      weekday: dayName,
      weekday_index: weekdayIndex,
      is_weekend: isWeekend,
      is_thursday: dayName === 'الخميس',
      is_friday: dayName === 'الجمعة',
      is_saturday: dayName === 'السبت',
      is_study_day: !isWeekend,
    });
  }

  return {
    month_name: monthName,
    year,
    days_in_month: daysInMonth,
    start_weekday: startWeekday,
    days,
  };
}

export function getRemainingMonths1448(): string[] {
  return HIJRI_MONTHS;
}
