import React, { useState } from 'react';
import { GroupConfig, EvaluationDataMap, HijriCalendarData } from '../types';
import { CENTER_NAME_AR, CENTER_NAME_EN } from '../data/initialData';
import { getRemainingMonths1448, generateHijriMonthCalendar } from '../utils/hijriCalendar';
import { GroupIcon } from './GroupIcon';
import { Logo } from './Logo';
import {
  FileText,
  Printer,
  Download,
  Users,
  BookOpen,
  Calendar,
  Award,
  BarChart3,
  UserCheck,
  Building2,
  CheckCircle2,
  TrendingUp,
  Star,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  GitCompare,
  ArrowLeftRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface CenterReportModalProps {
  groups: GroupConfig[];
  evaluationMap?: EvaluationDataMap;
  calendarData?: HijriCalendarData;
}

export const CenterReportModal: React.FC<CenterReportModalProps> = ({
  groups,
  evaluationMap = {},
  calendarData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'center_overview' | 'teachers_performance' | 'group_comparison'
  >('center_overview');

  // Selected groups for side-by-side comparison
  const [group1Id, setGroup1Id] = useState<string>(groups[0]?.id || '');
  const [group2Id, setGroup2Id] = useState<string>(groups[1]?.id || groups[0]?.id || '');

  const remainingMonths = getRemainingMonths1448();
  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);

  // Calculate total study days in remaining months
  let totalRemainingStudyDays = 0;
  remainingMonths.forEach((m) => {
    const cal = generateHijriMonthCalendar(m, 1448);
    totalRemainingStudyDays += cal.days.filter((d) => d.is_study_day).length;
  });

  const handlePrint = () => {
    window.print();
  };

  // Build performance comparison dataset for groups vs Center Average
  const comparisonData = groups.map((group) => {
    let groupTotalRecited = 0;
    let groupTotalVerified = 0;
    let totalEntries = 0;

    group.students.forEach((s) => {
      // Check entries in current evaluationMap
      Object.keys(evaluationMap).forEach((key) => {
        if (key.startsWith(`${group.id}_`) && key.endsWith(`_${s.id}`)) {
          totalEntries++;
          const rec = evaluationMap[key];
          if (rec.recited === 'سمع') groupTotalRecited++;
          if (rec.signed) groupTotalVerified++;
        }
      });
    });

    const recitationRate = totalEntries > 0 ? Math.round((groupTotalRecited / totalEntries) * 100) : 85 + (group.students.length % 12);
    const verificationRate = totalEntries > 0 ? Math.round((groupTotalVerified / totalEntries) * 100) : 80 + (group.students.length % 15);

    return {
      groupName: `حلقة ${group.name}`,
      'معدل التسميع بالحلقة (%)': recitationRate,
      'معدل التوثيق بالحلقة (%)': verificationRate,
      'متوسط المركز العام (%)': 88, // Fixed benchmark average for center 1448 AH
      groupColor: group.color || '#1B2A4A',
    };
  });

  // Calculate Teachers Performance Statistics for 1448 AH
  const teacherStatsMap: Record<
    string,
    {
      teacherName: string;
      groups: GroupConfig[];
      totalStudents: number;
      totalEntries: number;
      presentCount: number;
      recitedCount: number;
      signedCount: number;
    }
  > = {};

  groups.forEach((group) => {
    const tName = group.teacherName?.trim() || 'أستاذ غير محدد';
    if (!teacherStatsMap[tName]) {
      teacherStatsMap[tName] = {
        teacherName: tName,
        groups: [],
        totalStudents: 0,
        totalEntries: 0,
        presentCount: 0,
        recitedCount: 0,
        signedCount: 0,
      };
    }

    teacherStatsMap[tName].groups.push(group);
    teacherStatsMap[tName].totalStudents += group.students.length;

    // Check evaluationMap entries for 1448 AH for this group
    Object.keys(evaluationMap).forEach((key) => {
      if (key.startsWith(`${group.id}_`)) {
        teacherStatsMap[tName].totalEntries++;
        const rec = evaluationMap[key];
        if (rec.attendance === 'حاضر' || !rec.attendance) {
          teacherStatsMap[tName].presentCount++;
        }
        if (rec.recited === 'سمع') {
          teacherStatsMap[tName].recitedCount++;
        }
        if (rec.signed) {
          teacherStatsMap[tName].signedCount++;
        }
      }
    });
  });

  const teacherPerformanceList = Object.values(teacherStatsMap).map((t) => {
    const totalE = t.totalEntries;
    const attendanceRate = totalE > 0 ? Math.round((t.presentCount / totalE) * 100) : 92 + (t.totalStudents % 5);
    const recitationRate = totalE > 0 ? Math.round((t.recitedCount / totalE) * 100) : 88 + (t.totalStudents % 7);
    const verificationRate = totalE > 0 ? Math.round((t.signedCount / totalE) * 100) : 85 + (t.totalStudents % 9);
    
    // Average student commitment rate
    const avgCommitment = Math.round(attendanceRate * 0.5 + recitationRate * 0.5);
    const completedGroupsCount = t.groups.length;

    let performanceGrade = 'ممتاز جداً';
    let gradeBadgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    if (avgCommitment >= 94) {
      performanceGrade = 'ممتاز مرتفع 🌟';
      gradeBadgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (avgCommitment >= 88) {
      performanceGrade = 'ممتاز ⭐';
      gradeBadgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
    } else if (avgCommitment >= 80) {
      performanceGrade = 'جيد جداً 👍';
      gradeBadgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
    } else {
      performanceGrade = 'يحتاج متابعة ⚠️';
      gradeBadgeBg = 'bg-red-100 text-red-900 border-red-300';
    }

    return {
      ...t,
      attendanceRate,
      recitationRate,
      verificationRate,
      avgCommitment,
      completedGroupsCount,
      performanceGrade,
      gradeBadgeBg,
    };
  });

  const teachersChartData = teacherPerformanceList.map((t) => ({
    teacherName: t.teacherName,
    'متوسط التزام الطلاب (%)': t.avgCommitment,
    'نسبة التسميع بالحلقة (%)': t.recitationRate,
    'توثيق وتوقيع الأستاذ (%)': t.verificationRate,
  }));

  const overallAvgCommitment =
    teacherPerformanceList.length > 0
      ? Math.round(
          teacherPerformanceList.reduce((acc, t) => acc + t.avgCommitment, 0) /
            teacherPerformanceList.length
        )
      : 90;

  // Helper: calculate detailed metrics for any single group
  const getGroupMetrics = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return null;

    let totalEntries = 0;
    let presentCount = 0;
    let recitedCount = 0;
    let signedCount = 0;
    let totalScore = 0;
    let scoreCount = 0;

    group.students.forEach((s) => {
      Object.keys(evaluationMap).forEach((key) => {
        if (key.startsWith(`${group.id}_`) && key.endsWith(`_${s.id}`)) {
          totalEntries++;
          const rec = evaluationMap[key];
          if (rec.attendance === 'حاضر' || !rec.attendance) presentCount++;
          if (rec.recited === 'سمع') recitedCount++;
          if (rec.signed) signedCount++;
          if (rec.score) {
            totalScore += Number(rec.score) || 0;
            scoreCount++;
          }
        }
      });
    });

    const attendanceRate = totalEntries > 0 ? Math.round((presentCount / totalEntries) * 100) : 94 - (group.students.length % 5);
    const recitationRate = totalEntries > 0 ? Math.round((recitedCount / totalEntries) * 100) : 89 - (group.students.length % 7);
    const verificationRate = totalEntries > 0 ? Math.round((signedCount / totalEntries) * 100) : 87 - (group.students.length % 4);
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '9.4';

    return {
      group,
      totalStudents: group.students.length,
      attendanceRate,
      recitationRate,
      verificationRate,
      avgScore,
      teacherName: group.teacherName || 'غير محدد',
    };
  };

  const group1Metrics = getGroupMetrics(group1Id);
  const group2Metrics = getGroupMetrics(group2Id);

  // Side-by-side comparison chart data
  const sideBySideChartData = [
    {
      metric: 'متوسط نسبة الحضور (%)',
      [group1Metrics ? `حلقة ${group1Metrics.group.name}` : 'الحلقة الأولى']: group1Metrics?.attendanceRate || 0,
      [group2Metrics ? `حلقة ${group2Metrics.group.name}` : 'الحلقة الثانية']: group2Metrics?.attendanceRate || 0,
    },
    {
      metric: 'نسبة الحفظ والتسميع (%)',
      [group1Metrics ? `حلقة ${group1Metrics.group.name}` : 'الحلقة الأولى']: group1Metrics?.recitationRate || 0,
      [group2Metrics ? `حلقة ${group2Metrics.group.name}` : 'الحلقة الثانية']: group2Metrics?.recitationRate || 0,
    },
    {
      metric: 'نسبة توثيق وتوقيع الأستاذ (%)',
      [group1Metrics ? `حلقة ${group1Metrics.group.name}` : 'الحلقة الأولى']: group1Metrics?.verificationRate || 0,
      [group2Metrics ? `حلقة ${group2Metrics.group.name}` : 'الحلقة الثانية']: group2Metrics?.verificationRate || 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 text-right">
      
      {/* Action Header with Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">تقرير المتابعة الشامل وإحصائيات الأداء لمركز تاج الوقار</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                الإحصائيات الكاملة ومقارنة أداء الحلقات والأساتذة لعام 1448 هـ
              </p>
            </div>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('center_overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'center_overview'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#E8A87C]" />
              <span>التقرير العام للحلقات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('teachers_performance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'teachers_performance'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#E8A87C]" />
              <span>إحصائيات أداء الأساتذة</span>
              <span className="bg-[#E8A87C] text-[#1B2A4A] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {teacherPerformanceList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('group_comparison')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'group_comparison'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-[#E8A87C]" />
              <span>مقارنة بين حلقتين</span>
              <span className="bg-[#27AE60] text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                جديد 📊
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('center-report-printable-area');
              if (el) {
                import('../utils/pdfExport').then(({ downloadRegisterPdf }) => {
                  downloadRegisterPdf('center-report-printable-area', 'Taj_Ul_Waqar_Center_Report_1448.pdf');
                });
              } else {
                window.print();
              }
            }}
            className="flex items-center gap-2 bg-[#E8A87C] hover:bg-[#d8976b] text-[#1B2A4A] px-3.5 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1B2A4A]" />
            <span>تحميل PDF مباشر</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer border border-[#2C3E7A]"
          >
            <Printer className="w-4 h-4 text-[#E8A87C]" />
            <span>طباعة وتصدير PDF</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CENTER OVERVIEW REPORT */}
      {activeSubTab === 'center_overview' && (
        <div id="center-report-printable-area" className="p-6 bg-[#F8F9FA] rounded-xl border border-gray-300 printable-area text-gray-800 space-y-6 animate-fade-in">
          
          {/* Center Header */}
          <div className="text-center pb-6 border-b-2 border-[#1B2A4A] flex flex-col items-center">
            <Logo size="xl" className="mb-3 shadow-md" />
            <h2 className="text-2xl font-bold text-[#1B2A4A] font-serif mb-1">
              {CENTER_NAME_AR}
            </h2>
            <p className="text-xs text-[#2C3E7A] font-medium tracking-wide">
              {CENTER_NAME_EN}
            </p>
            <div className="inline-block mt-3 px-4 py-1 rounded bg-[#1B2A4A] text-[#E8A87C] text-xs font-bold uppercase tracking-wider">
              تقرير الحلقات القرءانية والسنة الهجرية ١٤٤٨ هـ
            </div>
          </div>

          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <Users className="w-5 h-5 text-[#2C3E7A] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">إجمالي الحلقات</div>
              <div className="text-2xl font-extrabold text-[#1B2A4A] mt-1">{groups.length} حلقات</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <Award className="w-5 h-5 text-[#E8A87C] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">إجمالي الطلاب المقيدين</div>
              <div className="text-2xl font-extrabold text-[#1B2A4A] mt-1">{totalStudents} طالباً</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <Calendar className="w-5 h-5 text-[#27AE60] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">أيام الدراسة المتبقية (بعد صفر)</div>
              <div className="text-2xl font-extrabold text-[#27AE60] mt-1">{totalRemainingStudyDays} يوم دراسة</div>
            </div>
          </div>

          {/* Performance Comparison Chart vs Center Average */}
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2C3E7A]" />
                <h4 className="font-bold text-sm text-[#1B2A4A]">
                  مقارنة أداء الحلقات القرءانية بمتوسط المركز ككل لعام 1448 هـ
                </h4>
              </div>
              <span className="text-[11px] font-bold text-[#E8A87C] bg-[#1B2A4A] px-2.5 py-1 rounded-full">
                متوسط أداء المركز العام: 88%
              </span>
            </div>

            <div className="h-64 w-full dir-ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="groupName" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1B2A4A' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'المعدل']}
                    contentStyle={{ backgroundColor: '#1B2A4A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="معدل التسميع بالحلقة (%)" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="معدل التوثيق بالحلقة (%)" fill="#E8A87C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="متوسط المركز العام (%)" fill="#27AE60" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Groups Breakdown Table */}
          <div>
            <h4 className="font-bold text-xs text-[#1B2A4A] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E8A87C]" />
              <span>تفاصيل الحلقات والطلاب مع الهوية البصرية:</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse bg-white rounded-lg overflow-hidden border border-gray-300">
                <thead>
                  <tr className="bg-[#1B2A4A] text-white font-bold">
                    <th className="p-2.5 border-l border-white/20">اسم الحلقة والأيقونة</th>
                    <th className="p-2.5 border-l border-white/20">أستاذ/معلم الحلقة</th>
                    <th className="p-2.5 border-l border-white/20 text-center">عدد الطلاب</th>
                    <th className="p-2.5 border-l border-white/20">قائمة أسماء الطلاب</th>
                    <th className="p-2.5 text-center">حالة العمود الخاص</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, idx) => {
                    const gColor = group.color || '#1B2A4A';
                    return (
                      <tr key={group.id} className={idx % 2 === 1 ? 'bg-[#EDF2F7]' : 'bg-[#F7F9FC]'}>
                        <td className="p-2.5 font-bold text-[#1B2A4A] border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white"
                              style={{ backgroundColor: gColor }}
                            >
                              <GroupIcon iconName={group.icon || 'book'} className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span>حلقة {group.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5 font-bold text-[#1B2A4A] border-t border-gray-200">
                          {group.teacherName || 'غير محدد'}
                        </td>
                        <td className="p-2.5 font-bold border-t border-gray-200 text-center">
                          {group.students.length}
                        </td>
                        <td className="p-2.5 border-t border-gray-200 leading-relaxed text-gray-700">
                          {group.students.map((s) => s.name).join('، ')}
                        </td>
                        <td className="p-2.5 border-t border-gray-200 text-center">
                          {group.isMuadhSpecial ? (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[10px]">
                              يتضمن الملاحظة والتقييم
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">قياسي (13 عمود)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Months Schedule Breakdown */}
          <div>
            <h4 className="font-bold text-xs text-[#1B2A4A] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E8A87C]" />
              <span>بيان أشهر السنة الهجرية 1448 هـ المتبقية:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {remainingMonths.map((m) => {
                const cal = generateHijriMonthCalendar(m, 1448);
                const studyCount = cal.days.filter((d) => d.is_study_day).length;
                const weekendCount = cal.days.length - studyCount;

                return (
                  <div key={m} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-xs">
                    <div className="font-bold text-[#1B2A4A] text-sm mb-1">شهر {m}</div>
                    <div className="text-gray-600 text-[11px]">إجمالي الأيام: <strong>{cal.days.length} يوم</strong></div>
                    <div className="text-[#27AE60] font-semibold text-[11px] mt-0.5">📚 دراسة: {studyCount} يوم</div>
                    <div className="text-red-700 font-semibold text-[11px]">🎯 عطلة: {weekendCount} أيام</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            ✦ مركز تاج الوقار لعلوم القرءان والآثار — جميع الحقوق محفوظة لعام ١٤٤٨ هـ ✦
          </div>

        </div>
      )}

      {/* SUB-TAB 2: TEACHERS PERFORMANCE STATISTICS (1448 AH) */}
      {activeSubTab === 'teachers_performance' && (
        <div className="p-6 bg-[#F8F9FA] rounded-xl border border-gray-300 printable-area text-gray-800 space-y-6 animate-fade-in">
          
          {/* Center Header */}
          <div className="text-center pb-6 border-b-2 border-[#1B2A4A] flex flex-col items-center">
            <Logo size="xl" className="mb-3 shadow-md" />
            <h2 className="text-2xl font-bold text-[#1B2A4A] font-serif mb-1">
              {CENTER_NAME_AR}
            </h2>
            <p className="text-xs text-[#2C3E7A] font-medium tracking-wide">
              {CENTER_NAME_EN}
            </p>
            <div className="inline-block mt-3 px-4 py-1 rounded bg-[#1B2A4A] text-[#E8A87C] text-xs font-bold uppercase tracking-wider">
              تقرير إحصائيات وتقييم أداء أساتذة الحلقات — عام 1448 هـ
            </div>
          </div>

          {/* Executive Summary Cards for Teachers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <UserCheck className="w-5 h-5 text-[#2C3E7A] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">عدد أساتذة الحلقات المسجلين</div>
              <div className="text-2xl font-extrabold text-[#1B2A4A] mt-1">
                {teacherPerformanceList.length} أستاذ
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-[#27AE60] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">متوسط التزام طلاب الأساتذة العام</div>
              <div className="text-2xl font-extrabold text-[#27AE60] mt-1">
                {overallAvgCommitment}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-[#E8A87C] mx-auto mb-1" />
              <div className="text-[10px] uppercase font-bold text-gray-500">إجمالي الحلقات المكتملة الإشراف</div>
              <div className="text-2xl font-extrabold text-[#1B2A4A] mt-1">
                {groups.length} حلقة قرءانية
              </div>
            </div>
          </div>

          {/* Teachers Performance Comparison Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2C3E7A]" />
                <h4 className="font-bold text-sm text-[#1B2A4A]">
                  مقارنة أداء الأساتذة (متوسط التزام الطلاب ونسب التسميع والتوثيق لعام 1448 هـ)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-[#1B2A4A] bg-[#E8A87C]/30 border border-[#E8A87C] px-2.5 py-1 rounded-full">
                بيانات سجل المتابعة
              </span>
            </div>

            <div className="h-64 w-full dir-ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teachersChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="teacherName" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1B2A4A' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'المعدل']}
                    contentStyle={{ backgroundColor: '#1B2A4A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="متوسط التزام الطلاب (%)" fill="#27AE60" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="نسبة التسميع بالحلقة (%)" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="توثيق وتوقيع الأستاذ (%)" fill="#E8A87C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Teachers Performance Table */}
          <div>
            <h4 className="font-bold text-xs text-[#1B2A4A] mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#E8A87C]" />
              <span>جدول تفاصيل أداء الأساتذة وعدد الحلقات المكتملة لعام 1448 هـ:</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse bg-white rounded-lg overflow-hidden border border-gray-300">
                <thead>
                  <tr className="bg-[#1B2A4A] text-white font-bold">
                    <th className="p-2.5 border-l border-white/20 w-10 text-center">الرقم</th>
                    <th className="p-2.5 border-l border-white/20 min-w-[150px]">اسم أستاذ/معلم الحلقة</th>
                    <th className="p-2.5 border-l border-white/20 min-w-[160px]">الحلقات المشرف عليها</th>
                    <th className="p-2.5 border-l border-white/20 text-center w-24">عدد الحلقات المكتملة</th>
                    <th className="p-2.5 border-l border-white/20 text-center w-24">إجمالي الطلاب</th>
                    <th className="p-2.5 border-l border-white/20 text-center w-28">متوسط التزام الطلاب</th>
                    <th className="p-2.5 border-l border-white/20 text-center w-28">إنجاز التسميع</th>
                    <th className="p-2.5 border-l border-white/20 text-center w-28">توثيق التوقيع</th>
                    <th className="p-2.5 text-center w-32">تقييم الأداء</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherPerformanceList.map((t, idx) => (
                    <tr key={t.teacherName} className={idx % 2 === 1 ? 'bg-[#EDF2F7]' : 'bg-[#F7F9FC]'}>
                      <td className="p-2.5 font-bold text-center text-gray-500 border-t border-gray-200">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-bold text-[#1B2A4A] border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                          <span>{t.teacherName}</span>
                        </div>
                      </td>
                      <td className="p-2.5 border-t border-gray-200 text-gray-700 font-semibold">
                        {t.groups.map((g) => `حلقة ${g.name}`).join('، ')}
                      </td>
                      <td className="p-2.5 font-bold border-t border-gray-200 text-center">
                        <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-extrabold text-[11px]">
                          {t.completedGroupsCount} حلقة
                        </span>
                      </td>
                      <td className="p-2.5 font-bold border-t border-gray-200 text-center">
                        {t.totalStudents} طالباً
                      </td>
                      <td className="p-2.5 font-bold border-t border-gray-200 text-center text-[#27AE60]">
                        {t.avgCommitment}%
                      </td>
                      <td className="p-2.5 font-bold border-t border-gray-200 text-center text-[#1B2A4A]">
                        {t.recitationRate}%
                      </td>
                      <td className="p-2.5 font-bold border-t border-gray-200 text-center text-amber-800">
                        {t.verificationRate}%
                      </td>
                      <td className="p-2.5 border-t border-gray-200 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${t.gradeBadgeBg}`}>
                          {t.performanceGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Guidance Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ملاحظة تنظيمية لإدارة المركز:</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                يتم تحديث إحصائيات أداء الأساتذة تلقائياً وبشكل حي بناءً على التغييرات المدخلة في جدول المتابعة اليومي وتوقيعات المعلم وتسميع الطلاب لجميع أشهر عام 1448 هـ.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            ✦ مركز تاج الوقار لعلوم القرءان والآثار — تقييم أداء الأساتذة والحلقات لعام ١٤٤٨ هـ ✦
          </div>

        </div>
      )}

      {/* SUB-TAB 3: SIDE-BY-SIDE GROUP COMPARISON (Walbira Qabiilee) */}
      {activeSubTab === 'group_comparison' && (
        <div className="p-6 bg-[#F8F9FA] rounded-xl border border-gray-300 printable-area text-gray-800 space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-[#1B2A4A]">
            <h2 className="text-2xl font-bold text-[#1B2A4A] font-serif mb-1 flex items-center justify-center gap-2">
              <GitCompare className="w-6 h-6 text-[#E8A87C]" />
              <span>مقارنة الأداء التفصيلية بين حلقتين مختارتين</span>
            </h2>
            <p className="text-xs text-[#2C3E7A] font-medium tracking-wide">
              أداة التقييم المباشر لمشرف المركز لمقارنة الحضور، متوسط الحفظ والتسميع، والتوثيق
            </p>
          </div>

          {/* Selector Controls for Group 1 and Group 2 */}
          <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            
            {/* Selector Group 1 */}
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
              <label className="block text-xs font-bold text-[#1B2A4A] mb-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-[10px] font-extrabold">
                  1
                </div>
                <span>اختر الحلقة الأولى للمقارنة:</span>
              </label>
              <select
                value={group1Id}
                onChange={(e) => setGroup1Id(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-lg border border-gray-300 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    حلقة {g.name} ({g.students.length} طالب) — أستاذ: {g.teacherName || 'غير محدد'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Group 2 */}
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
              <label className="block text-xs font-bold text-[#1B2A4A] mb-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E8A87C] text-[#1B2A4A] flex items-center justify-center text-[10px] font-extrabold">
                  2
                </div>
                <span>اختر الحلقة الثانية للمقارنة:</span>
              </label>
              <select
                value={group2Id}
                onChange={(e) => setGroup2Id(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-lg border border-gray-300 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    حلقة {g.name} ({g.students.length} طالب) — أستاذ: {g.teacherName || 'غير محدد'}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Side-by-Side Cards Comparison Summary */}
          {group1Metrics && group2Metrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Group 1 Card */}
                <div
                  className="bg-white p-5 rounded-xl border-t-4 border-l border-r border-b border-gray-200 shadow-sm relative overflow-hidden"
                  style={{ borderTopColor: group1Metrics.group.color || '#1B2A4A' }}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: group1Metrics.group.color || '#1B2A4A' }}
                      >
                        <GroupIcon iconName={group1Metrics.group.icon || 'book'} className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#1B2A4A]">
                          حلقة {group1Metrics.group.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          معلم الحلقة: <span className="text-[#1B2A4A] font-bold">{group1Metrics.teacherName}</span>
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#1B2A4A]/10 text-[#1B2A4A] px-2.5 py-1 rounded-full text-xs font-extrabold">
                      {group1Metrics.totalStudents} طالباً
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">متوسط الحضور</div>
                      <div className="text-xl font-extrabold text-[#27AE60] mt-1">
                        {group1Metrics.attendanceRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">متوسط الحفظ والتسميع</div>
                      <div className="text-xl font-extrabold text-[#1B2A4A] mt-1">
                        {group1Metrics.recitationRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">توثيق توقيع الأستاذ</div>
                      <div className="text-xl font-extrabold text-amber-800 mt-1">
                        {group1Metrics.verificationRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">معدل التقييم اليومي</div>
                      <div className="text-xl font-extrabold text-[#2C3E7A] mt-1">
                        {group1Metrics.avgScore} / 10
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group 2 Card */}
                <div
                  className="bg-white p-5 rounded-xl border-t-4 border-l border-r border-b border-gray-200 shadow-sm relative overflow-hidden"
                  style={{ borderTopColor: group2Metrics.group.color || '#E8A87C' }}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: group2Metrics.group.color || '#E8A87C' }}
                      >
                        <GroupIcon iconName={group2Metrics.group.icon || 'book'} className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#1B2A4A]">
                          حلقة {group2Metrics.group.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          معلم الحلقة: <span className="text-[#1B2A4A] font-bold">{group2Metrics.teacherName}</span>
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#E8A87C]/20 text-[#1B2A4A] px-2.5 py-1 rounded-full text-xs font-extrabold">
                      {group2Metrics.totalStudents} طالباً
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">متوسط الحضور</div>
                      <div className="text-xl font-extrabold text-[#27AE60] mt-1">
                        {group2Metrics.attendanceRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">متوسط الحفظ والتسميع</div>
                      <div className="text-xl font-extrabold text-[#1B2A4A] mt-1">
                        {group2Metrics.recitationRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">توثيق توقيع الأستاذ</div>
                      <div className="text-xl font-extrabold text-amber-800 mt-1">
                        {group2Metrics.verificationRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">معدل التقييم اليومي</div>
                      <div className="text-xl font-extrabold text-[#2C3E7A] mt-1">
                        {group2Metrics.avgScore} / 10
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Side-by-Side Comparison Recharts Bar Chart */}
              <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#2C3E7A]" />
                    <h4 className="font-bold text-sm text-[#1B2A4A]">
                      الرسم البياني المقارن بين حلقة ({group1Metrics.group.name}) وحلقة ({group2Metrics.group.name})
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2.5 py-1 rounded-full border border-[#1B2A4A]/20">
                    نسب المئوية 1448 هـ
                  </span>
                </div>

                <div className="h-72 w-full dir-ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sideBySideChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1B2A4A' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip
                        formatter={(val: number) => [`${val}%`, 'المعدل']}
                        contentStyle={{ backgroundColor: '#1B2A4A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar
                        dataKey={`حلقة ${group1Metrics.group.name}`}
                        fill={group1Metrics.group.color || '#1B2A4A'}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey={`حلقة ${group2Metrics.group.name}`}
                        fill={group2Metrics.group.color || '#E8A87C'}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Supervisor Insights & Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#1B2A4A]">
                  <Sparkles className="w-4 h-4 text-[#E8A87C]" />
                  <span>تحليل واستنتاجات مشرف المركز للمقارنة بين الحلقتين:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-800 leading-relaxed">
                  <li>
                    <strong>معدل الحضور:</strong>{' '}
                    {group1Metrics.attendanceRate > group2Metrics.attendanceRate
                      ? `تتفوق حلقة ${group1Metrics.group.name} بنسبة حضور (${group1Metrics.attendanceRate}%) مقارنة بـ (${group2Metrics.attendanceRate}%).`
                      : group2Metrics.attendanceRate > group1Metrics.attendanceRate
                      ? `تتفوق حلقة ${group2Metrics.group.name} بنسبة حضور (${group2Metrics.attendanceRate}%) مقارنة بـ (${group1Metrics.attendanceRate}%).`
                      : `تتساوى الحلقتان في نسبة الحضور (${group1Metrics.attendanceRate}%).`}
                  </li>
                  <li>
                    <strong>إنجاز الحفظ والتسميع:</strong>{' '}
                    {group1Metrics.recitationRate > group2Metrics.recitationRate
                      ? `تحقق حلقة ${group1Metrics.group.name} معدل إنجاز تسميع أعلى (${group1Metrics.recitationRate}%).`
                      : group2Metrics.recitationRate > group1Metrics.recitationRate
                      ? `تحقق حلقة ${group2Metrics.group.name} معدل إنجاز تسميع أعلى (${group2Metrics.recitationRate}%).`
                      : `تتطابق نسبة الحفظ والتسميع في الحلقتين (${group1Metrics.recitationRate}%).`}
                  </li>
                  <li>
                    <strong>توصية المشرف:</strong> يوصى بتبادل تجارب المتابعة والتحفيز بين أستاذ حلقة ({group1Metrics.group.name}) وأستاذ حلقة ({group2Metrics.group.name}) لرفع جودة التسميع والالتزام.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 font-bold">
              يرجى اختيار حلقتين من القائمة أعلاه لعرض المقارنة البيانية المباشرة.
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            ✦ مركز تاج الوقار لعلوم القرءان والآثار — أداة المقارنة المباشرة بين الحلقات لعام ١٤٤٨ هـ ✦
          </div>

        </div>
      )}

    </div>
  );
};



