import React, { useState } from 'react';
import { GroupConfig, EvaluationDataMap, EvaluationRecord, HijriCalendarData, HijriDay, Student, REGISTER_COLUMNS } from '../types';
import { SURAH_LIST, COLORS } from '../data/initialData';
import { GroupIcon } from './GroupIcon';
import { SocialShareModal } from './SocialShareModal';
import { GroupCustomizeModal } from './GroupCustomizeModal';
import { Check, X, ShieldAlert, BookOpen, AlertCircle, Sparkles, CheckCircle2, RotateCcw, UserCheck, Edit3, BarChart3, Share2, Columns, SlidersHorizontal, AlertTriangle, Send, Bell, Printer } from 'lucide-react';

interface DailyRegisterTableProps {
  group: GroupConfig;
  calendarData: HijriCalendarData;
  evaluationMap: EvaluationDataMap;
  onUpdateEvaluation: (key: string, updates: Partial<EvaluationRecord>) => void;
  viewMode: 'all_days' | 'study_only' | 'weekend_only';
  selectedDayNumber: number | 'all';
  onOpenStudentProgressCard?: (student: Student) => void;
  onSaveGroupCustomization?: (groupId: string, updates: Partial<GroupConfig>) => void;
}

export const DailyRegisterTable: React.FC<DailyRegisterTableProps> = ({
  group,
  calendarData,
  evaluationMap,
  onUpdateEvaluation,
  viewMode,
  selectedDayNumber,
  onOpenStudentProgressCard,
  onSaveGroupCustomization,
}) => {
  const [activeSurahPickerKey, setActiveSurahPickerKey] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{ title: string; text: string; subtitle?: string } | null>(null);
  const [isCustomizeColumnsOpen, setIsCustomizeColumnsOpen] = useState(false);

  // Column visibility logic
  const hiddenCols = group.hiddenColumns || [];
  const isColVisible = (colId: string) => !hiddenCols.includes(colId);

  // Filter days based on view mode and selected day number
  const visibleDays = calendarData.days.filter((day) => {
    if (selectedDayNumber !== 'all' && day.day !== selectedDayNumber) {
      return false;
    }
    if (viewMode === 'study_only') return day.is_study_day;
    if (viewMode === 'weekend_only') return day.is_weekend;
    return true;
  });

  const isMuadh = group.isMuadhSpecial || group.name === 'معاذ';
  const groupColor = group.color || '#1B2A4A';

  // Quick stats calculations for current visible scope
  let totalRows = 0;
  let presentCount = 0;
  let recitedCount = 0;
  let signedCount = 0;
  let unsignedCount = 0;

  visibleDays.forEach((day) => {
    if (day.is_study_day) {
      group.students.forEach((student) => {
        totalRows++;
        const key = `${group.id}_${calendarData.month_name}_${day.day}_${student.id}`;
        const rec = evaluationMap[key] || {};
        if (rec.attendance === 'حاضر' || (!rec.attendance && day.is_study_day)) {
          presentCount++;
        }
        if (rec.recited === 'سمع') {
          recitedCount++;
        }
        if (rec.signed) {
          signedCount++;
        } else {
          unsignedCount++;
        }
      });
    }
  });

  const studyDaysCount = visibleDays.filter((d) => d.is_study_day).length;
  const completionRate = totalRows > 0 ? Math.round((recitedCount / totalRows) * 100) : 0;

  // Function to build day report text for WhatsApp & Telegram
  const generateDayShareText = (day: HijriDay) => {
    const monthIndexStr = calendarData.days.findIndex((d) => d.day === day.day) + 1;
    const dateStr = `${day.weekday} ${day.day.toString().padStart(2, '0')}/${monthIndexStr.toString().padStart(2, '0')}/١٤٤٨ هـ`;

    let text = `✨ *تقرير المتابعة اليومي - مركز تاج الوقار لعلوم القرءان* ✨\n`;
    text += `📖 *حلقة ${group.name}* (${calendarData.month_name} ١٤٤٨ هـ)\n`;
    if (group.teacherName) {
      text += `👤 *أستاذ/معلم الحلقة:* ${group.teacherName}\n`;
    }
    text += `📅 *اليوم والتاريخ:* ${dateStr}\n`;
    text += `-----------------------------------\n\n`;

    let dayPresent = 0;
    let dayRecited = 0;

    group.students.forEach((student, idx) => {
      const key = `${group.id}_${calendarData.month_name}_${day.day}_${student.id}`;
      const rec = evaluationMap[key] || {};
      const status = rec.attendance || (day.is_study_day ? 'حاضر' : 'عطلة');
      const recited = rec.recited === 'سمع' ? '✅ سمع' : rec.recited === 'لم يسمع' ? '❌ لم يسمع' : '⏳ -';
      const surah = rec.surahVerses || 'غير محدد';
      const signed = rec.signed ? '✍️ موثق' : '📝 غير موثق';

      if (status === 'حاضر') dayPresent++;
      if (rec.recited === 'سمع') dayRecited++;

      text += `${idx + 1}. *${student.name}*\n`;
      text += `   • الحضور: ${status} | التسميع: ${recited}\n`;
      text += `   • المقدار: ${surah} | ${signed}\n`;
      if (rec.homework) text += `   • الواجب: ${rec.homework}\n`;
      text += `\n`;
    });

    text += `-----------------------------------\n`;
    text += `📊 *إحصائيات اليوم:*\n`;
    text += `• عدد الحضور: ${dayPresent} من أصل ${group.students.length}\n`;
    text += `• الطلاب المسمعون: ${dayRecited}\n`;
    text += `\nربطنا الله وإياكم بالقرءان العظيم 🌿`;

    return text;
  };

  // Helper: Calculate consecutive absence days for a student in current month
  const getStudentAbsenceStats = (studentId: string) => {
    let maxConsecutive = 0;
    let currentStreak = 0;
    let currentStreakDays: number[] = [];
    let maxStreakDays: number[] = [];

    for (const d of calendarData.days) {
      if (!d.is_study_day) continue;
      const key = `${group.id}_${calendarData.month_name}_${d.day}_${studentId}`;
      const rec = evaluationMap[key];
      if (rec && rec.attendance === 'غائب') {
        currentStreak++;
        currentStreakDays.push(d.day);
        if (currentStreak > maxConsecutive) {
          maxConsecutive = currentStreak;
          maxStreakDays = [...currentStreakDays];
        }
      } else {
        currentStreak = 0;
        currentStreakDays = [];
      }
    }

    return {
      maxConsecutive,
      isWarning: maxConsecutive >= 3,
      absentDays: maxStreakDays,
    };
  };

  // Find all students with 3+ consecutive absences
  const warningStudents = group.students
    .map((student) => ({
      student,
      stats: getStudentAbsenceStats(student.id),
    }))
    .filter((item) => item.stats.isWarning);

  // Send single parent absence alert via Bot
  const handleSendParentAbsenceAlert = (student: Student, stats: { maxConsecutive: number; absentDays: number[] }) => {
    const daysText = stats.absentDays.map((d) => `${d} ${calendarData.month_name}`).join('، ');
    const text = `⚠️ *تنبيه غياب متكرر - مركز تاج الوقار لعلوم القرءان الكريم* ⚠️\n\nإلى المكرم/ ولي أمر الطالب: *${student.name}*\nالحلقة القرءانية: *حلقة ${group.name}*\nالشهر الهجري: *${calendarData.month_name} 1448 هـ*\n\nالسلام عليكم ورحمة الله وبركاته،،\n\nنود إحاطتكم علماً بأن الطالب قد تغيب عن الحضور والتحضير بالحلقة لـ (*${stats.maxConsecutive} أيام متتالية*) في الأيام الهجرية التالية: (${daysText}).\n\nحرصاً منا على استمرار حفظ ابنكم وتفادياً لتأخره في المقرر القرءاني، نرجو منكم التكرم بالتواصل العاجل مع معلم الحلقة أو إدارة المركز للإفادة بسبب الغياب والترتيب لإعادة التسميع.\n\nشاكرين ومقدرين حسن تعاونكم،،\nإدارة مركز تاج الوقار لعلوم القرءان الكريم 🌸`;

    setShareModalData({
      title: `تنبيه غياب ولي الأمر: ${student.name}`,
      subtitle: `إرسال رسالة تنبيه آلي عبر البوت لولي أمر الطالب (WhatsApp / Telegram)`,
      text,
    });
  };

  // Send batch absence alerts for all warning students
  const handleSendBatchAbsenceAlerts = () => {
    if (warningStudents.length === 0) return;

    let text = `⚠️ *تقرير تنبيهات الغياب المتكرر لجميع أولياء الأمور - حلقة ${group.name}* ⚠️\n*مركز تاج الوقار لعلوم القرءان - شهر ${calendarData.month_name} 1448 هـ*\n\nالطلاب الذين تجاوز عدد أيام غيابهم 3 أيام متتالية:\n\n`;

    warningStudents.forEach((item, idx) => {
      text += `${idx + 1}. الطالب: *${item.student.name}*\n   • عدد أيام الغياب المتتالي: *${item.stats.maxConsecutive} أيام*\n   • الأيام الهجرية: (${item.stats.absentDays.join('، ')})\n\n`;
    });

    text += `نأمل من معلم الحلقة والمدير المتابعة والتواصل مع أولياء الأمور عبر البوت لضمان الانضباط.\nمع تحيات إدارة مركز تاج الوقار.`;

    setShareModalData({
      title: `كشف تنبيهات الغياب المتكرر الجماعي - حلقة ${group.name}`,
      subtitle: `إرسال تقرير التنبيهات الجماعية لأولياء الأمور عبر WhatsApp / Telegram`,
      text,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid with Group Icon & Color */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: groupColor }}
          >
            <GroupIcon iconName={group.icon || 'book'} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">حلقة {group.name}</div>
            <div className="text-lg font-bold text-[#1B2A4A]">{group.students.length} طالب</div>
            {group.teacherName && (
              <div className="text-[11px] text-[#2C3E7A] font-extrabold truncate max-w-[140px]" title={`أستاذ الحلقة: ${group.teacherName}`}>
                👤 {group.teacherName}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">أيام الدراسة المعروضة</div>
          <div className="text-2xl font-bold text-[#27AE60]">{studyDaysCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">معدل التسميع الكلي</div>
          <div className="text-2xl font-bold text-[#3498DB]">{completionRate}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">التوقيعات المعلقة</div>
          <div className="text-2xl font-bold text-[#F39C12]">{unsignedCount}</div>
        </div>
      </div>

      {/* Automated Absence Alert Banner if any student has 3+ consecutive absences */}
      {warningStudents.length > 0 && (
        <div className="bg-red-50 border-r-4 border-red-600 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-red-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-red-900 flex items-center gap-2">
                <span>تنبيه آلي: تم اكتشاف غياب متكرر!</span>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-2xs">
                  {warningStudents.length} طلاب
                </span>
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                تجاوز الغياب 3 أيام متتالية للطلاب:{' '}
                <span className="font-bold text-red-950">
                  {warningStudents.map((w) => `${w.student.name} (${w.stats.maxConsecutive} أيام)`).join('، ')}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendBatchAbsenceAlerts}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال تنبيهات أولياء الأمور عبر البوت 📲</span>
          </button>
        </div>
      )}

      {/* Spreadsheet Container with Window Header Bar */}
      <div id="daily-register-table-container" className="bg-white border border-gray-300 rounded-lg shadow-inner overflow-hidden flex flex-col">
        {/* Mock Window Header Bar */}
        <div className="bg-[#F1F3F4] px-4 py-2 border-b border-gray-300 flex items-center justify-between" dir="ltr">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#E74C3C]"></div>
              <div className="w-3 h-3 rounded-full bg-[#F1C40F]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2ECC71]"></div>
            </div>
            {onSaveGroupCustomization && (
              <button
                type="button"
                onClick={() => setIsCustomizeColumnsOpen(true)}
                className="flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-white hover:bg-gray-100 text-[#1B2A4A] rounded border border-gray-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="تخصيص وإظهار/إخفاء الأعمدة المعروضة في جدول التسميع"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2C3E7A]" />
                <span>إعدادات الأعمدة ({REGISTER_COLUMNS.length - hiddenCols.length}/{REGISTER_COLUMNS.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 ml-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded border border-red-500 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="طباعة وتحميل السجل بصيغة PDF"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>تحميل PDF</span>
            </button>
          </div>
          <span className="text-xs font-bold text-gray-600 font-mono hidden sm:inline">
            Preview: مركز_تاج_الوقار_حلقة_{group.name}_شهر_{calendarData.month_name}_١٤٤٨.pdf
          </span>
        </div>

        {/* Days Loop */}
        <div className="p-4 bg-[#EDF2F7] space-y-4">
          {visibleDays.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">لا توجد أيام مطابقة للتصفية الحالية</h4>
              <p className="text-xs text-gray-500 mt-1">يرجى تغيير خيار تصفية الأيام أو اختيار يوم آخر من القائمة.</p>
            </div>
          ) : (
            visibleDays.map((day) => {
              const monthIndexStr = (calendarData.days.findIndex(d => d.day === day.day) + 1);
              const dateStr = `${day.weekday} ${day.day.toString().padStart(2, '0')} / ${monthIndexStr.toString().padStart(2, '0')} / 1448 هـ`;

              return (
                <div
                  key={day.day}
                  className="bg-white border border-gray-400 rounded shadow-sm overflow-hidden"
                >
                  {/* Day Header Banner */}
                  <div
                    className={`p-2.5 text-center font-bold text-xs border-b border-gray-300 flex items-center justify-between ${
                      day.is_weekend
                        ? 'bg-[#F0E6E6] text-red-900'
                        : 'bg-[#E8F0FE] text-[#1B2A4A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{day.is_weekend ? '🎯' : '📚'}</span>
                      <span className="font-bold">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Social Share Button for WhatsApp & Telegram */}
                      <button
                        type="button"
                        onClick={() => {
                          const text = generateDayShareText(day);
                          setShareModalData({
                            title: `مشاركة تقرير يوم ${day.weekday} (${day.day} ${calendarData.month_name})`,
                            subtitle: `حلقة ${group.name}`,
                            text,
                          });
                        }}
                        className="flex items-center gap-1 bg-[#25D366] hover:bg-[#1ebd59] text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                        title="مشاركة التقرير اليومي عبر واتساب وتليجرام"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>مشاركة (WhatsApp / Telegram)</span>
                      </button>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          day.is_weekend
                            ? 'bg-red-200 text-red-900'
                            : 'bg-[#1B2A4A] text-white'
                        }`}
                      >
                        {day.is_weekend ? `عطلة (${day.weekday})` : 'يوم دراسة'}
                      </span>
                    </div>
                  </div>

                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse" dir="rtl">
                      <thead className="bg-[#1B2A4A] text-white font-bold">
                        <tr>
                          {isColVisible('index') && <th className="border border-white/20 p-2 w-10">الرقم</th>}
                          {isColVisible('studentName') && <th className="border border-white/20 p-2 min-w-[140px] text-right">إسم الطالب</th>}
                          {isColVisible('surahVerses') && <th className="border border-white/20 p-2 min-w-[190px]">السورة من آية إلى آية</th>}
                          {isColVisible('notice') && <th className="border border-white/20 p-2 w-14">تنبيه</th>}
                          {isColVisible('hesitation') && <th className="border border-white/20 p-2 w-14">تردد</th>}
                          {isColVisible('stoppage') && <th className="border border-white/20 p-2 w-14">توقف</th>}
                          {isColVisible('prompt') && <th className="border border-white/20 p-2 w-14">فتح</th>}
                          {isColVisible('recited') && <th className="border border-white/20 p-2 w-24">التسميع</th>}
                          {isColVisible('minorReview') && <th className="border border-white/20 p-2 w-20">الصغرى</th>}
                          {isColVisible('majorReview') && <th className="border border-white/20 p-2 w-20">العظمى</th>}
                          {isColVisible('attendance') && <th className="border border-white/20 p-2 w-20">الحضور</th>}
                          {isColVisible('homework') && <th className="border border-white/20 p-2 w-24">الواجب</th>}
                          {isMuadh && isColVisible('notes') && (
                            <th className="border border-white/20 p-2 min-w-[160px] bg-amber-900/80 text-amber-100">
                              الملاحظة والتقييم
                            </th>
                          )}
                          {isColVisible('signed') && <th className="border border-white/20 p-2 w-24">توقيع المعلم</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {group.students.map((student, sIndex) => {
                          const evalKey = `${group.id}_${calendarData.month_name}_${day.day}_${student.id}`;
                          const rec = evaluationMap[evalKey] || {};
                          const isAlternateRow = sIndex % 2 === 1;

                          const rowBgClass = day.is_weekend
                            ? 'bg-white hover:bg-red-50/20'
                            : isAlternateRow
                            ? 'bg-[#EDF2F7] hover:bg-[#e2e8f0]'
                            : 'bg-[#F7F9FC] hover:bg-[#e2e8f0]';

                          return (
                            <tr
                              key={student.id}
                              className={`border-b border-gray-200 transition-colors text-center ${rowBgClass}`}
                            >
                              {/* Index */}
                              {isColVisible('index') && (
                                <td className="p-1.5 font-semibold text-gray-500 border-r border-gray-300">
                                  {sIndex + 1}
                                </td>
                              )}

                              {/* Student Name */}
                              {isColVisible('studentName') && (() => {
                                const absenceStats = getStudentAbsenceStats(student.id);
                                return (
                                  <td className="p-1.5 text-right font-bold text-[#1B2A4A] border-r border-gray-300">
                                    <div className="flex items-center justify-between gap-1 w-full">
                                      <button
                                        type="button"
                                        onClick={() => onOpenStudentProgressCard && onOpenStudentProgressCard(student)}
                                        className="flex items-center gap-1.5 hover:text-[#3498DB] transition-colors cursor-pointer text-right group/name"
                                        title="انقر لفتح بطاقة التطور الأسبوعي الرسم البياني"
                                      >
                                        <span>{student.name}</span>
                                        <BarChart3 className="w-3.5 h-3.5 text-gray-400 group-hover/name:text-[#3498DB] opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                      </button>

                                      {/* Warning icon for 3+ consecutive absence days */}
                                      {absenceStats.isWarning && (
                                        <div
                                          className="inline-flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-1.5 py-0.5 rounded-full border border-red-300 text-[10px] font-extrabold transition-all shadow-2xs shrink-0"
                                          title={`تنبيه آلي: تغيب الطالب ${absenceStats.maxConsecutive} أيام متتالية! انقر لإرسال تنبيه عبر البوت.`}
                                        >
                                          <AlertTriangle className="w-3 h-3 text-red-600 animate-pulse shrink-0" />
                                          <span className="hidden sm:inline">{absenceStats.maxConsecutive}أ غياب</span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendParentAbsenceAlert(student, absenceStats);
                                            }}
                                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs ml-0.5"
                                            title="إرسال تنبيه عاجل لولي الأمر عبر البوت (WhatsApp / Telegram)"
                                          >
                                            <Send className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })()}

                              {/* Surah & Ayah Input */}
                              {isColVisible('surahVerses') && (
                                <td className="p-1 relative border-r border-gray-300">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      placeholder="البقرة 1-15"
                                      value={rec.surahVerses || ''}
                                      onChange={(e) =>
                                        onUpdateEvaluation(evalKey, { surahVerses: e.target.value })
                                      }
                                      className="w-full text-[11px] px-1.5 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#2C3E7A] bg-white"
                                    />
                                    <button
                                      type="button"
                                      title="اختر سورة"
                                      onClick={() =>
                                        setActiveSurahPickerKey(
                                          activeSurahPickerKey === evalKey ? null : evalKey
                                        )
                                      }
                                      className="px-1 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300 text-[10px] cursor-pointer shrink-0"
                                    >
                                      📖
                                    </button>
                                  </div>

                                  {/* Surah Quick Selector Dropdown */}
                                  {activeSurahPickerKey === evalKey && (
                                    <div className="absolute top-full right-0 mt-1 z-30 w-56 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded shadow-xl p-1 text-right">
                                      <div className="text-[10px] font-bold text-gray-500 px-2 py-1 border-b border-gray-100">
                                        اختر السورة الكريمة:
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 p-1">
                                        {SURAH_LIST.slice(0, 30).map((surah) => (
                                          <button
                                            key={surah}
                                            type="button"
                                            onClick={() => {
                                              onUpdateEvaluation(evalKey, {
                                                surahVerses: `سورة ${surah}`,
                                              });
                                              setActiveSurahPickerKey(null);
                                            }}
                                            className="text-right text-[10px] px-2 py-0.5 rounded hover:bg-[#E8F0FE] hover:text-[#1B2A4A] truncate cursor-pointer"
                                          >
                                            {surah}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              )}

                              {/* Notice / Alert (تنبيه) */}
                              {isColVisible('notice') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={rec.notice || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { notice: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                              )}

                              {/* Hesitation (تردد) */}
                              {isColVisible('hesitation') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={rec.hesitation || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { hesitation: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </td>
                              )}

                              {/* Stoppage (توقف) */}
                              {isColVisible('stoppage') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={rec.stoppage || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { stoppage: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                </td>
                              )}

                              {/* Prompt/Correction (فتح) */}
                              {isColVisible('prompt') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={rec.prompt || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { prompt: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </td>
                              )}

                              {/* Recited / Not Recited (سمع / لم يسمع) */}
                              {isColVisible('recited') && (
                                <td className="p-1 border-r border-gray-300">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onUpdateEvaluation(evalKey, {
                                          recited: rec.recited === 'سمع' ? '' : 'سمع',
                                        })
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                        rec.recited === 'سمع'
                                          ? 'bg-[#27AE60] text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                                      }`}
                                    >
                                      سمع
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onUpdateEvaluation(evalKey, {
                                          recited: rec.recited === 'لم يسمع' ? '' : 'لم يسمع',
                                        })
                                      }
                                      className={`px-1 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                        rec.recited === 'لم يسمع'
                                          ? 'bg-[#E74C3C] text-white'
                                          : 'bg-gray-100 text-gray-500 hover:bg-red-100'
                                      }`}
                                    >
                                      لم يسمع
                                    </button>
                                  </div>
                                </td>
                              )}

                              {/* Minor Review (الصغرى) */}
                              {isColVisible('minorReview') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    placeholder="ممتاز"
                                    value={rec.minorReview || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { minorReview: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                </td>
                              )}

                              {/* Major Review (العظمى/الكبرى) */}
                              {isColVisible('majorReview') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    placeholder="جيد جداً"
                                    value={rec.majorReview || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { majorReview: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                </td>
                              )}

                              {/* Attendance (حاضر / غائب / مأذون) */}
                              {isColVisible('attendance') && (
                                <td className="p-1 border-r border-gray-300">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateEvaluation(evalKey, {
                                        attendance:
                                          rec.attendance === 'حاضر'
                                            ? 'غائب'
                                            : rec.attendance === 'غائب'
                                            ? 'مأذون'
                                            : 'حاضر',
                                      })
                                    }
                                    className={`w-full py-0.5 px-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      rec.attendance === 'غائب'
                                        ? 'bg-red-600 text-white'
                                        : rec.attendance === 'مأذون'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-[#27AE60] text-white'
                                    }`}
                                  >
                                    {rec.attendance || (day.is_weekend ? 'عطلة' : 'حاضر')}
                                  </button>
                                </td>
                              )}

                              {/* Homework (الواجب) */}
                              {isColVisible('homework') && (
                                <td className="p-1 border-r border-gray-300">
                                  <input
                                    type="text"
                                    placeholder="الواجب"
                                    value={rec.homework || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { homework: e.target.value })
                                    }
                                    className="w-full text-center text-[11px] p-0.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                  />
                                </td>
                              )}

                              {/* Muadh Notes Column if applicable */}
                              {isMuadh && isColVisible('notes') && (
                                <td className="p-1 border-r border-gray-300 bg-amber-50/50">
                                  <input
                                    type="text"
                                    placeholder="ملاحظات وتنبيهات المعلم"
                                    value={rec.notes || ''}
                                    onChange={(e) =>
                                      onUpdateEvaluation(evalKey, { notes: e.target.value })
                                    }
                                    className="w-full text-[11px] p-0.5 rounded border border-amber-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </td>
                              )}

                              {/* Teacher Signature */}
                              {isColVisible('signed') && (
                                <td className="p-1 border-r border-gray-300">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateEvaluation(evalKey, { signed: !rec.signed })
                                    }
                                    className={`w-full py-0.5 px-1 rounded font-bold text-[10px] transition-all cursor-pointer ${
                                      rec.signed
                                        ? 'bg-[#1B2A4A] text-[#E8A87C] border border-[#E8A87C]/50'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {rec.signed ? 'موقع ✓' : 'توقيع المعلم'}
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Spreadsheet Footer Bar */}
        <div className="h-8 bg-white border-t border-gray-300 flex items-center px-4 gap-4" dir="rtl">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#E8A87C] rounded-sm"></div>
            <span className="text-[11px] font-bold text-gray-700">Sheet: حلقة {group.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
            <span className="text-[11px] font-bold text-gray-400">شهر {calendarData.month_name} 1448 هـ</span>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      {shareModalData && (
        <SocialShareModal
          isOpen={Boolean(shareModalData)}
          onClose={() => setShareModalData(null)}
          title={shareModalData.title}
          subtitle={shareModalData.subtitle}
          shareText={shareModalData.text}
        />
      )}

      {/* Group & Column Customization Modal */}
      {isCustomizeColumnsOpen && onSaveGroupCustomization && (
        <GroupCustomizeModal
          isOpen={isCustomizeColumnsOpen}
          onClose={() => setIsCustomizeColumnsOpen(false)}
          group={group}
          onSaveGroupCustomization={onSaveGroupCustomization}
          initialTab="columns"
        />
      )}
    </div>
  );
};
