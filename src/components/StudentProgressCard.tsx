import React, { useState } from 'react';
import { GroupConfig, Student, EvaluationDataMap, HijriCalendarData } from '../types';
import { SocialShareModal } from './SocialShareModal';
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  User,
  Clock,
  Sparkles,
  BarChart3,
  Bell,
  Share2,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface StudentProgressCardProps {
  student: Student;
  group: GroupConfig;
  evaluationMap: EvaluationDataMap;
  calendarData: HijriCalendarData;
  isOpen: boolean;
  onClose: () => void;
  onSetReminder?: (title: string, studentName: string) => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  student,
  group,
  evaluationMap,
  calendarData,
  isOpen,
  onClose,
  onSetReminder,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!isOpen) return null;

  // Calculate 4-week data breakdown
  const weeks = [
    { label: 'الأسبوع 1', start: 1, end: 7 },
    { label: 'الأسبوع 2', start: 8, end: 14 },
    { label: 'الأسبوع 3', start: 15, end: 21 },
    { label: 'الأسبوع 4', start: 22, end: calendarData.days_in_month },
  ];

  let totalCompletedAll = 0;
  let totalVerifiedAll = 0;
  let totalStudyDaysAll = 0;
  let totalAttendancePresent = 0;

  const weeklyChartData = weeks.map((week) => {
    const weekDays = calendarData.days.filter(
      (d) => d.day >= week.start && d.day <= week.end && d.is_study_day
    );

    let completedCount = 0;
    let verifiedCount = 0;
    let presentCount = 0;

    weekDays.forEach((d) => {
      const evalKey = `${group.id}_${calendarData.month_name}_${d.day}_${student.id}`;
      const rec = evaluationMap[evalKey];

      if (rec) {
        if (rec.recited === 'سمع') {
          completedCount++;
        }
        if (rec.signed) {
          verifiedCount++;
        }
        if (rec.attendance === 'حاضر' || (!rec.attendance && !d.is_weekend)) {
          presentCount++;
        }
      }
    });

    totalCompletedAll += completedCount;
    totalVerifiedAll += verifiedCount;
    totalStudyDaysAll += weekDays.length;
    totalAttendancePresent += presentCount;

    // Ratio of verified vs completed (or completion ratio)
    const verificationRatio =
      completedCount > 0 ? Math.round((verifiedCount / completedCount) * 100) : 0;
    const completionRate =
      weekDays.length > 0 ? Math.round((completedCount / weekDays.length) * 100) : 0;

    return {
      week: week.label,
      completed: completedCount,
      verified: verifiedCount,
      'نسبة التوثيق (%)': verificationRatio,
      'معدل الإنجاز (%)': completionRate,
    };
  });

  const overallVerificationRate =
    totalCompletedAll > 0 ? Math.round((totalVerifiedAll / totalCompletedAll) * 100) : 0;
  const overallCompletionRate =
    totalStudyDaysAll > 0 ? Math.round((totalCompletedAll / totalStudyDaysAll) * 100) : 0;

  const generateStudentShareText = () => {
    let text = `🌟 *تقرير إنجاز الطالب القرءاني - مركز تاج الوقار لعلوم القرءان* 🌟\n`;
    text += `👤 *اسم الطالب:* ${student.name}\n`;
    text += `📖 *الحلقة:* حلقة ${group.name}\n`;
    text += `📅 *الشهر:* ${calendarData.month_name} ١٤٤٨ هـ\n`;
    text += `-----------------------------------\n`;
    text += `📊 *ملخص الأداء والإنجاز:*\n`;
    text += `• عدد أيام الحضور: ${totalAttendancePresent} من أصل ${totalStudyDaysAll} يوم دراسي\n`;
    text += `• إجمالي التسميعات المكتملة: ${totalCompletedAll} تسميع\n`;
    text += `• إجمالي التوقيعات الموثقة: ${totalVerifiedAll} توقيع\n`;
    text += `• نسبة التوثيق الكلية: ${overallVerificationRate}%\n`;
    text += `• معدل الإنجاز الكلي: ${overallCompletionRate}%\n`;
    text += `-----------------------------------\n`;
    text += `دعواتنا للطالب بالدوام على حفظ كتاب الله ورفعة الدرجات 🌿`;
    return text;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 relative text-right overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold text-xl shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1B2A4A]">{student.name}</h3>
                <span className="bg-[#E8F0FE] text-[#1B2A4A] px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                  حلقة {group.name}
                </span>
                {group.teacherName && (
                  <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                    أستاذ: {group.teacherName}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                بطاقة متابعة الأداء والتطور — شهر {calendarData.month_name} ١٤٤٨ هـ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="مشاركة التقرير عبر واتساب وتليجرام"
            >
              <Send className="w-3.5 h-3.5" />
              <span>مشاركة لولي الأمر</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 pt-4 pr-1 pl-1 scrollbar-thin scrollbar-thumb-gray-300 flex-1">
          
          {/* Summary Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-gray-200 text-center shadow-2xs">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60]" />
                <span>عناصر مكتملة</span>
              </div>
              <div className="text-xl font-bold text-[#1B2A4A] mt-1">{totalCompletedAll}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">من أصل {totalStudyDaysAll} يوم</div>
            </div>

            <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-gray-200 text-center shadow-2xs">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-[#3498DB]" />
                <span>عناصر موثقة</span>
              </div>
              <div className="text-xl font-bold text-[#3498DB] mt-1">{totalVerifiedAll}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">توقيعات المعلم</div>
            </div>

            <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-gray-200 text-center shadow-2xs">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span>نسبة التوثيق</span>
              </div>
              <div className="text-xl font-bold text-[#1B2A4A] mt-1">{overallVerificationRate}%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">موثق / مكتمل</div>
            </div>

            <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-gray-200 text-center shadow-2xs">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>معدل الإنجاز</span>
              </div>
              <div className="text-xl font-bold text-[#27AE60] mt-1">{overallCompletionRate}%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">إجمالي الأداء</div>
            </div>
          </div>

          {/* Recharts: Weekly Progress Trend Chart */}
          <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2C3E7A]" />
                <h4 className="text-sm font-bold text-[#1B2A4A]">
                  مخطط التطور الأسبوعي (Weekly Progress Trend)
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                مقارنة العناصر المكتملة vs الموثقة (4 أسابيع)
              </span>
            </div>

            {/* Recharts Container */}
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weeklyChartData}
                  margin={{ top: 15, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#4b5563', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#e8a87c', fontSize: 11, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#e8a87c' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2A4A',
                      borderColor: '#2C3E7A',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => <span className="text-gray-700 font-bold">{value}</span>}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="completed"
                    name="العناصر المكتملة (Completed)"
                    fill="#27AE60"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="verified"
                    name="العناصر الموثقة (Verified)"
                    fill="#3498DB"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="نسبة التوثيق (%)"
                    name="نسبة التوثيق %"
                    stroke="#E8A87C"
                    strokeWidth={3}
                    dot={{ fill: '#1B2A4A', r: 5, strokeWidth: 2, stroke: '#E8A87C' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[11px] text-gray-500 mt-2 text-right">
              * يُظهر الرسم البياني مقارنة عدد التسميعات المكتملة (باللون الأخضر) مع التوقيعات الموثقة (باللون الأزرق) ونسبة التوثيق المئوية (بالخط البرتقالي) على مدار الأربعة أسابيع.
            </p>
          </div>

          {/* Quick Actions & Reminders integration */}
          <div className="bg-[#EDF2F7] p-4 rounded-xl border border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E8A87C]" />
              <div>
                <h5 className="text-xs font-bold text-[#1B2A4A]">تضمين التذكيرات المباشرة</h5>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  توليد تذكير آلي للمعلم لمتابعة توقيعات وتسميعات {student.name}
                </p>
              </div>
            </div>

            {onSetReminder && (
              <button
                type="button"
                onClick={() => {
                  onSetReminder(
                    `متابعة توقيع وتسميع الطالب: ${student.name} في حلقة ${group.name}`,
                    student.name
                  );
                }}
                className="flex items-center gap-1.5 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm border border-[#2C3E7A]"
              >
                <Bell className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span>إنشاء تذكير للطالب</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#1B2A4A] text-white font-bold text-xs shadow hover:bg-[#2C3E7A] cursor-pointer"
          >
            إغلاق البطاقة
          </button>
        </div>
      </div>

      {/* Social Share Modal */}
      {isShareModalOpen && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`تقرير الطالب: ${student.name}`}
          subtitle={`حلقة ${group.name} - شهر ${calendarData.month_name}`}
          shareText={generateStudentShareText()}
        />
      )}
    </div>
  );
};
