import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Sparkles,
  Plus,
  RefreshCw,
  FileCode,
  ShieldCheck,
  Check,
  Edit2
} from 'lucide-react';
import {
  DEFAULT_TEACHER_RECORDS,
  TeacherRecordRow,
  generateAndDownloadTeacherAttendanceDocx,
} from '../utils/docxAttendanceExport';
import { Logo } from './Logo';

export const TeacherMonthlyAttendanceTable: React.FC = () => {
  const [records, setRecords] = useState<TeacherRecordRow[]>(DEFAULT_TEACHER_RECORDS);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick Inline Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<TeacherRecordRow | null>(null);

  // New Record Modal / State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRow, setNewRow] = useState<TeacherRecordRow>({
    hijriDate: 'ربيع الثاني ١٤٤٨ هـ',
    day: 'السبت',
    teacherName: 'تبيان الشيخ أحمد',
    checkInTime: '3:20',
    absence: '',
    delay: '',
    checkOutTime: '4:00',
    signature: 'مكتمل',
  });

  const uniqueTeachers = Array.from(new Set(DEFAULT_TEACHER_RECORDS.map((r) => r.teacherName)));
  const uniqueDays = Array.from(new Set(DEFAULT_TEACHER_RECORDS.map((r) => r.day)));

  const filteredRecords = records.filter((r) => {
    const matchTeacher = selectedTeacher === 'all' || r.teacherName === selectedTeacher;
    const matchDay = selectedDay === 'all' || r.day === selectedDay;
    const matchSearch =
      searchQuery.trim() === '' ||
      r.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.day.includes(searchQuery) ||
      r.checkInTime.includes(searchQuery) ||
      r.checkOutTime.includes(searchQuery);
    return matchTeacher && matchDay && matchSearch;
  });

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      await generateAndDownloadTeacherAttendanceDocx(filteredRecords.length > 0 ? filteredRecords : records);
      setSuccessToast('تم تنزيل مستند Word (.docx) بنجاح!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تنزيل المستند.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...records[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editFormData) return;
    const updated = [...records];
    updated[editingIndex] = editFormData;
    setRecords(updated);
    setEditingIndex(null);
    setEditFormData(null);
    setSuccessToast('تم تحديث بيانات المعلم بنجاح!');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleAddRecord = () => {
    setRecords([newRow, ...records]);
    setShowAddModal(false);
    setSuccessToast('تم إضافة سجل المعلم بنجاح!');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="space-y-6 text-right animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Container / Printable Area */}
      <div id="teacher-attendance-docx-view" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        
        {/* Document Header Branding */}
        <div className="text-center pb-6 border-b-2 border-[#1E3A5F] flex flex-col items-center">
          <Logo size="xl" className="mb-3 shadow-md" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] font-serif mb-1 tracking-wide">
            مركز تاج الوقار لعلوم القرآن والآثار
          </h2>
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 text-[#0D9488] px-4 py-1.5 rounded-full font-bold text-sm sm:text-base border border-[#0D9488]/20 mt-1">
            <Calendar className="w-4 h-4" />
            <span>سجل متابعة المعلمين – شهر ربيع الثاني ١٤٤٨ هـ</span>
          </div>
        </div>

        {/* Metadata Info Box (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E3A5F]">المدير والمؤسس:</span>
            <span className="text-xs font-semibold text-slate-700">أستاذ علي محمد ثاني</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E3A5F]">المشرف العام:</span>
            <span className="text-xs font-semibold text-slate-700">أحمد محمد</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E3A5F]">أوقات الدوام الصباحي:</span>
            <span className="text-xs font-semibold text-slate-700 font-mono">٣:٢٠ - ٤:٠٠</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E3A5F]">الفترة الأكاديمية:</span>
            <span className="text-xs font-semibold text-slate-700">شهر ربيع الثاني ١٤٤٨ هـ</span>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 no-print">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">جميع المعلمين ({uniqueTeachers.length})</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">جميع الأيام</option>
                {uniqueDays.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="بحث في الجدول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#1E3A5F] w-36 sm:w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#1E3A5F]" />
              <span>إضافة تسجيل</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#1E3A5F]" />
              <span>طباعة</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2C3E7A] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#E8A87C]" />
              <span>{isExporting ? 'جاري التوليد...' : 'تنزيل Word (.docx)'}</span>
            </button>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-300 shadow-inner">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#1E3A5F] text-white font-bold text-xs select-none">
                <th className="p-3 border border-[#1E3A5F] w-28">التاريخ الهجري</th>
                <th className="p-3 border border-[#1E3A5F] w-20">اليوم</th>
                <th className="p-3 border border-[#1E3A5F] text-right pr-4 w-36">اسم المعلم</th>
                <th className="p-3 border border-[#1E3A5F] w-20">وقت الحضور</th>
                <th className="p-3 border border-[#1E3A5F] w-16">الغياب</th>
                <th className="p-3 border border-[#1E3A5F] w-16">التأخير</th>
                <th className="p-3 border border-[#1E3A5F] w-20">وقت الانصراف</th>
                <th className="p-3 border border-[#1E3A5F] w-24">التوقيع</th>
                <th className="p-3 border border-[#1E3A5F] w-16 no-print">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-bold bg-white">
                    لا توجد بيانات مطابقة لخيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row, idx) => {
                  const isEven = idx % 2 === 1;
                  const isEditing = editingIndex === idx;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={idx} className="bg-amber-50">
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.hijriDate}
                            onChange={(e) => setEditFormData({ ...editFormData, hijriDate: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.day}
                            onChange={(e) => setEditFormData({ ...editFormData, day: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.teacherName}
                            onChange={(e) => setEditFormData({ ...editFormData, teacherName: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-right rounded text-xs font-bold"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.checkInTime}
                            onChange={(e) => setEditFormData({ ...editFormData, checkInTime: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs font-mono"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.absence}
                            onChange={(e) => setEditFormData({ ...editFormData, absence: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.delay}
                            onChange={(e) => setEditFormData({ ...editFormData, delay: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.checkOutTime}
                            onChange={(e) => setEditFormData({ ...editFormData, checkOutTime: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs font-mono"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <input
                            type="text"
                            value={editFormData.signature}
                            onChange={(e) => setEditFormData({ ...editFormData, signature: e.target.value })}
                            className="w-full bg-white border border-slate-300 p-1 text-center rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border border-slate-300 no-print">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            حفظ
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        isEven ? 'bg-[#F8FAFC]' : 'bg-white'
                      }`}
                    >
                      <td className="p-2.5 border border-slate-200 text-slate-700 whitespace-nowrap">
                        {row.hijriDate}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-800">
                        {row.day}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-right pr-4 font-bold text-[#1E3A5F]">
                        {row.teacherName}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-mono font-bold text-emerald-700">
                        {row.checkInTime}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-slate-500">
                        {row.absence || '—'}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-slate-500">
                        {row.delay || '—'}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-mono font-bold text-slate-700">
                        {row.checkOutTime}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-slate-600">
                        {row.signature || (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>موثق</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 border border-slate-200 no-print">
                        <button
                          onClick={() => handleStartEdit(idx)}
                          className="text-slate-400 hover:text-[#1E3A5F] p-1 rounded-md transition-colors"
                          title="تعديل السجل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary & Badges */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-4">
            <span>
              إجمالي السجلات المعروضة:{' '}
              <strong className="text-[#1E3A5F] font-mono">{filteredRecords.length}</strong> صف
            </span>
            <span>
              المعلمين المستهدفين:{' '}
              <strong className="text-[#1E3A5F] font-mono">{uniqueTeachers.length}</strong> معلمين
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام الحضور الرسمي المعتمد لمركز تاج الوقار لعلوم القرآن والآثار</span>
          </div>
        </div>
      </div>

      {/* Add New Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1E3A5F]">إضافة سجل متابعة جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">التاريخ الهجري</label>
                <input
                  type="text"
                  value={newRow.hijriDate}
                  onChange={(e) => setNewRow({ ...newRow, hijriDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">اليوم</label>
                <select
                  value={newRow.day}
                  onChange={(e) => setNewRow({ ...newRow, day: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-bold"
                >
                  {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">اسم المعلم</label>
                <input
                  type="text"
                  value={newRow.teacherName}
                  onChange={(e) => setNewRow({ ...newRow, teacherName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">وقت الحضور</label>
                <input
                  type="text"
                  value={newRow.checkInTime}
                  onChange={(e) => setNewRow({ ...newRow, checkInTime: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">وقت الانصراف</label>
                <input
                  type="text"
                  value={newRow.checkOutTime}
                  onChange={(e) => setNewRow({ ...newRow, checkOutTime: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">الغياب / التأخير</label>
                <input
                  type="text"
                  placeholder="اختياري"
                  value={newRow.delay}
                  onChange={(e) => setNewRow({ ...newRow, delay: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddRecord}
                className="px-5 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#2C3E7A] text-white text-xs font-bold shadow"
              >
                حفظ وإضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
