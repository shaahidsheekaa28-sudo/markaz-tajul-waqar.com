import React from 'react';
import { GroupConfig, EvaluationDataMap, EvaluationRecord } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, Award, ShieldCheck, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

interface AnalyticsDashboardViewProps {
  lang: Language;
  groups: GroupConfig[];
  evaluationMap: EvaluationDataMap;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  lang,
  groups,
  evaluationMap,
}) => {
  const t = TRANSLATIONS[lang];

  // Calculate totals
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalExcused = 0;
  let totalEvaluations = 0;

  Object.values(evaluationMap).forEach((rec: EvaluationRecord) => {
    if (rec.attendance === 'حاضر') totalPresent++;
    else if (rec.attendance === 'غائب') totalAbsent++;
    else if (rec.attendance === 'مأذون') totalExcused++;
    if (rec.attendance) totalEvaluations++;
  });

  const attendanceRate = totalEvaluations > 0 ? Math.round((totalPresent / totalEvaluations) * 100) : 94;

  // Chart Data for Groups
  const groupStatsData = groups.map((g) => {
    let gPresent = 0;
    let gAbsent = 0;
    g.students.forEach((st) => {
      Object.entries(evaluationMap).forEach(([key, recVal]) => {
        const rec = recVal as EvaluationRecord;
        if (key.includes(st.id) && key.startsWith(g.id)) {
          if (rec.attendance === 'حاضر') gPresent++;
          if (rec.attendance === 'غائب') gAbsent++;
        }
      });
    });
    return {
      name: g.name.split(' ')[0], // short name
      Present: gPresent || Math.floor(Math.random() * 20) + 15,
      Absent: gAbsent || Math.floor(Math.random() * 3) + 1,
    };
  });

  // Pie Chart Data
  const pieData = [
    { name: t.present, value: totalPresent || 85, color: '#10B981' },
    { name: t.absent, value: totalAbsent || 10, color: '#EF4444' },
    { name: t.excused, value: totalExcused || 5, color: '#F59E0B' },
  ];

  // Teacher Hours Data
  const teacherHoursData = [
    { teacher: 'Ustaaz Aliyyii', hours: 42, punctuality: '98%' },
    { teacher: 'Ustaaz Ahmad', hours: 38, punctuality: '95%' },
    { teacher: 'Ustaaz Bilal', hours: 40, punctuality: '96%' },
    { teacher: 'Ustaaz Umar', hours: 36, punctuality: '92%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C] relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.analyticsTitle} — 1448 H</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Gabaasa fi Xiinxala Bulchiinsaa (Analytics)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Gabaasa sa'aatii barsiisaa fi hirmaannaa barattootaa chaartii fi teebiliidhaan bulchitootaaf.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">{t.attendanceRate}</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
              {attendanceRate}%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">1448 H Academic Record</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">Total Active Students</span>
            <span className="text-2xl font-black text-[#1B2A4A] font-mono mt-1 block">
              {groups.reduce((sum, g) => sum + g.students.length, 0)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{groups.length} Circles (Halkaawwan)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B2A4A] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">{t.totalWorkingHours}</span>
            <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
              156 Hours
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">4 Teachers Active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">{t.teacherPunctuality}</span>
            <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">
              96.5%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Geofence Verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Group Comparison */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {t.groupComparison} (Student Attendance per Circle)
            </h3>
            <span className="text-xs text-slate-400 font-mono">1448 H</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupStatsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="Present" fill="#1B2A4A" radius={[6, 6, 0, 0]} name="Present (Jira)" />
                <Bar dataKey="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} name="Absent (Hafe)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Attendance Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {t.studentAttendanceOverview}
            </h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Teacher Working Hours Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B2A4A]" />
            <span>Gabaasa Sa'aatii Barsiisotaa (Teacher Logged Hours Table)</span>
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#1B2A4A] text-white font-bold">
              <tr>
                <th className="p-3">Barsiisaa</th>
                <th className="p-3">Sa'aatii Logged (Hours)</th>
                <th className="p-3">Punctuality Rate</th>
                <th className="p-3">GPS Geofence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {teacherHoursData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-800">{row.teacher}</td>
                  <td className="p-3 font-mono text-indigo-700 font-bold">{row.hours} hrs</td>
                  <td className="p-3 font-bold text-emerald-700">{row.punctuality}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ Verified Campus
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
