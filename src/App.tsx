import React, { useState, useEffect } from 'react';
import { GroupConfig, EvaluationDataMap, EvaluationRecord, Student, ExportScope } from './types';
import { DEFAULT_GROUPS } from './data/initialData';
import { generateHijriMonthCalendar, HIJRI_MONTHS, getRemainingMonths1448 } from './utils/hijriCalendar';
import { Header, AppTab } from './components/Header';
import { GroupSelector } from './components/GroupSelector';
import { MonthSelector } from './components/MonthSelector';
import { DailyRegisterTable } from './components/DailyRegisterTable';
import { ExcelExportModal } from './components/ExcelExportModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import { PythonScriptView } from './components/PythonScriptView';
import { CenterReportModal } from './components/CenterReportModal';
import { StudentProgressCard } from './components/StudentProgressCard';
import { ReminderManagerModal, ReminderItem } from './components/ReminderManagerModal';
import { BotSettingsModal } from './components/BotSettingsModal';
import { PdfExportModal } from './components/PdfExportModal';
import { TeacherAttendanceView } from './components/TeacherAttendanceView';
import { NotificationManagerModal } from './components/NotificationManagerModal';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { TuitionFeeManagerView } from './components/TuitionFeeManagerView';
import { StudentIdCardView } from './components/StudentIdCardView';
import { ParentPortalView } from './components/ParentPortalView';
import { CertificatesLeaderboardView } from './components/CertificatesLeaderboardView';
import { ClassroomView } from './components/ClassroomView';
import { Language } from './utils/translations';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Plus, Users, BookOpen } from 'lucide-react';

function MainPortal() {
  const { user, loading, logout, canEdit } = useAuth();

  // Language State
  const [lang, setLang] = useState<Language>('om'); // Default to Afaan Oromoo

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('register');

  // Groups state (persisted)
  const [groups, setGroups] = useState<GroupConfig[]>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_groups_1448');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_GROUPS;
  });

  // Selected Group ID
  const [selectedGroupId, setSelectedGroupId] = useState<string>('zaidy');

  // Selected Month (defaults to Muharram: محرم)
  const [selectedMonth, setSelectedMonth] = useState<string>('محرم');

  // View Filter Mode
  const [viewMode, setViewMode] = useState<'all_days' | 'study_only' | 'weekend_only'>('all_days');

  // Scope Mode
  const [scopeMode, setScopeMode] = useState<ExportScope>('remaining');

  // Selected Day Number
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'all'>('all');

  // Daily Evaluations Map
  const [evaluationMap, setEvaluationMap] = useState<EvaluationDataMap>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_evaluations_1448');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Reminders State
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_reminders_1448');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'r_initial_1',
        title: 'مراجعة توقيعات التسميع المعلقة لحلقة زيد بن ثابت',
        category: 'verification',
        priority: 'high',
        completed: false,
        createdAt: '١٤٤٨ هـ',
      },
      {
        id: 'r_initial_2',
        title: 'تأكيد إدخال واجبات المراجعة الصغرى والعظمى',
        category: 'homework',
        priority: 'medium',
        completed: false,
        createdAt: '١٤٤٨ هـ',
      },
    ];
  });

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isBotSettingsOpen, setIsBotSettingsOpen] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);

  // Handler to customize group icon & color
  const handleSaveGroupCustomization = (groupId: string, updates: Partial<GroupConfig>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  // Save evaluations to localStorage
  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_evaluations_1448', JSON.stringify(evaluationMap));
  }, [evaluationMap]);

  // Save groups to localStorage
  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_groups_1448', JSON.stringify(groups));
  }, [groups]);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_reminders_1448', JSON.stringify(reminders));
  }, [reminders]);

  // Current active group object
  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Calendar data for selected month
  const calendarData = generateHijriMonthCalendar(selectedMonth, 1448);

  // Total students count across all groups
  const totalStudentsCount = groups.reduce((sum, g) => sum + g.students.length, 0);

  // Handler for updating student evaluation fields
  const handleUpdateEvaluation = (key: string, updates: Partial<EvaluationRecord>) => {
    setEvaluationMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  // Handler for updating students in a group
  const handleUpdateGroupStudents = (groupId: string, newStudents: Student[]) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, students: newStudents } : g))
    );
  };

  // Add reminder
  const handleAddReminder = (
    reminderData: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>
  ) => {
    const newItem: ReminderItem = {
      ...reminderData,
      id: `rem_${Date.now()}`,
      completed: false,
      createdAt: new Date().toLocaleDateString('ar-SA'),
    };
    setReminders((prev) => [newItem, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAutoGenerateReminders = () => {
    let unsignedRecitedCount = 0;
    calendarData.days.forEach((day) => {
      if (day.is_study_day) {
        activeGroup.students.forEach((student) => {
          const evalKey = `${activeGroup.id}_${calendarData.month_name}_${day.day}_${student.id}`;
          const rec = evaluationMap[evalKey];
          if (rec && rec.recited === 'سمع' && !rec.signed) {
            unsignedRecitedCount++;
          }
        });
      }
    });

    if (unsignedRecitedCount > 0) {
      handleAddReminder({
        title: `تنبيه آلي: هناك ${unsignedRecitedCount} تسميعات مكتملة تنتظر توقيع المعلم في حلقة ${activeGroup.name}`,
        category: 'verification',
        priority: 'high',
      });
      alert(`تم توليد تذكير بنجاح: هناك ${unsignedRecitedCount} تسميعات غير موقعة في شهر ${selectedMonth}.`);
    } else {
      alert('جميع التسميعات المكتملة موقعة وموثقة بفضل الله!');
    }
  };

  // Handler to add a new custom group
  const handleAddGroup = () => {
    const groupName = prompt('أدخل اسم الحلقة القرءانية الجديدة:');
    if (!groupName || !groupName.trim()) return;

    const newId = `group_${Date.now()}`;
    const newGroup: GroupConfig = {
      id: newId,
      name: groupName.trim(),
      isMuadhSpecial: false,
      students: [
        { id: `${newId}_1`, name: 'طالب 1' },
        { id: `${newId}_2`, name: 'طالب 2' },
      ],
      columns: [
        'الرقم',
        'إسم الطالب',
        'السورة من آية إلى آية',
        'تنبيه',
        'تردد',
        'توقف',
        'فتح',
        'سمع / لم يسمع',
        'الصغرى',
        'العظمى/الكبرى',
        'حاضر / غائب',
        'الواجب',
        'توقيع المعلم',
      ],
    };

    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newId);
  };

  const activeReminderCount = reminders.filter((r) => !r.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B2A4A] flex flex-col items-center justify-center text-white p-4 font-sans dir-rtl">
        <div className="w-16 h-16 border-4 border-[#E8A87C] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-100">جاري التحقق من حالة الجلسة وتوثيق الدخول...</h2>
        <p className="text-xs text-[#E8A87C] font-semibold mt-1">مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans dir-rtl pb-16">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'export') {
            setIsExportModalOpen(true);
          }
        }}
        lang={lang}
        setLang={setLang}
        onQuickExport={() => setIsExportModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        studentCount={totalStudentsCount}
        groupsCount={groups.length}
        onOpenReminders={() => setIsRemindersOpen(true)}
        activeReminderCount={activeReminderCount}
        onOpenBotSettings={() => setIsBotSettingsOpen(true)}
        currentUser={user}
        onLogout={logout}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {!canEdit && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong className="text-xs font-extrabold text-amber-900 block">
                  HAYYAMA MALEE BARREESSUUN HIN DANDA'AMU (READ-ONLY MODE ACTIVE)
                </strong>
                <p className="text-[11px] text-amber-800 font-medium">
                  Hayyamni barreessuu fi data jijjiiruu cufameera. Data fooyyessuuf gubbaarraa "Barreessuu: Cufameera" cuqasaa PIN (1448) galchaa.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab 1: Daily Register */}
        {activeTab === 'register' && (
          <div className="animate-fade-in">
            {/* Group Selector Bar */}
            <GroupSelector
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onOpenStudentManager={() => setIsStudentManagerOpen(true)}
              onAddGroup={handleAddGroup}
              onSaveGroupCustomization={handleSaveGroupCustomization}
            />

            {/* Month & Calendar Selector Bar */}
            <MonthSelector
              selectedMonth={selectedMonth}
              onSelectMonth={(m) => {
                setSelectedMonth(m);
                setSelectedDayNumber('all');
              }}
              viewMode={viewMode}
              onSetViewMode={setViewMode}
              scopeMode={scopeMode}
              onSetScopeMode={setScopeMode}
              selectedDayNumber={selectedDayNumber}
              onSelectDayNumber={setSelectedDayNumber}
              totalDaysInMonth={calendarData.days_in_month}
            />

            {/* Daily Evaluation Register Table */}
            <DailyRegisterTable
              group={activeGroup}
              calendarData={calendarData}
              evaluationMap={evaluationMap}
              onUpdateEvaluation={handleUpdateEvaluation}
              viewMode={viewMode}
              selectedDayNumber={selectedDayNumber}
              onOpenStudentProgressCard={(student) => setSelectedStudentForCard(student)}
              onSaveGroupCustomization={handleSaveGroupCustomization}
            />
          </div>
        )}

        {/* Tab 2: Teacher Attendance (GPS & QR Check-in) */}
        {activeTab === 'teacher_attendance' && (
          <div className="animate-fade-in">
            <TeacherAttendanceView lang={lang} />
          </div>
        )}

        {/* Tab 3: Real-time Notifications & SMS */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            <NotificationManagerModal lang={lang} groups={groups} />
          </div>
        )}

        {/* Tab 4: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsDashboardView lang={lang} groups={groups} evaluationMap={evaluationMap} />
          </div>
        )}

        {/* Tab 5: Tuition Fee Management */}
        {activeTab === 'tuition_fee' && (
          <div className="animate-fade-in">
            <TuitionFeeManagerView lang={lang} groups={groups} />
          </div>
        )}

        {/* Tab 6: Student ID Cards & QR Scanner */}
        {activeTab === 'student_id' && (
          <div className="animate-fade-in">
            <StudentIdCardView lang={lang} groups={groups} />
          </div>
        )}

        {/* Tab 7: Parent Portal */}
        {activeTab === 'parent_portal' && (
          <div className="animate-fade-in">
            <ParentPortalView lang={lang} groups={groups} evaluationMap={evaluationMap} />
          </div>
        )}

        {/* Tab 8: Certificates & Leaderboard */}
        {activeTab === 'certificates' && (
          <div className="animate-fade-in">
            <CertificatesLeaderboardView lang={lang} groups={groups} />
          </div>
        )}

        {/* Tab: Google Classroom */}
        {activeTab === 'classroom' && (
          <div className="animate-fade-in">
            <ClassroomView />
          </div>
        )}

        {/* Tab 5: Export Excel View */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-xl mx-auto my-8">
            <BookOpen className="w-12 h-12 text-[#2C3E7A] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">توليد ملفات Excel</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              انقر على زر فتح نافذة التصدير لتنزيل سجلات المتابعة بجميع الشهور والحلقات بصيغة Excel المنسقة.
            </p>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              فتح نافذة خيارات تصدير Excel
            </button>
          </div>
        )}

        {/* Tab 6: Center Report */}
        {activeTab === 'report' && (
          <CenterReportModal
            groups={groups}
            evaluationMap={evaluationMap}
            calendarData={calendarData}
          />
        )}

        {/* Tab 7: Python Script View */}
        {activeTab === 'python' && <PythonScriptView />}

      </main>

      {/* Modals */}
      <ExcelExportModal
        groups={groups}
        selectedGroup={activeGroup}
        selectedMonth={selectedMonth}
        evaluationMap={evaluationMap}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        groups={groups}
        selectedGroup={activeGroup}
        selectedMonth={selectedMonth}
        calendarData={calendarData}
        evaluationMap={evaluationMap}
      />

      <StudentManagerModal
        group={activeGroup}
        isOpen={isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
        onUpdateGroupStudents={handleUpdateGroupStudents}
      />

      {/* Bot Settings Modal */}
      <BotSettingsModal
        isOpen={isBotSettingsOpen}
        onClose={() => setIsBotSettingsOpen(false)}
        groups={groups}
        calendarData={calendarData}
        evaluationMap={evaluationMap}
      />

      {/* Student Progress Card with Recharts Weekly Trend Chart */}
      {selectedStudentForCard && (
        <StudentProgressCard
          student={selectedStudentForCard}
          group={activeGroup}
          evaluationMap={evaluationMap}
          calendarData={calendarData}
          isOpen={Boolean(selectedStudentForCard)}
          onClose={() => setSelectedStudentForCard(null)}
          onSetReminder={(title, studentName) => {
            handleAddReminder({
              title,
              category: 'verification',
              priority: 'high',
              studentName,
            });
            setIsRemindersOpen(true);
          }}
        />
      )}

      {/* Reminder Manager Modal */}
      <ReminderManagerModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
        onAutoGenerateReminders={handleAutoGenerateReminders}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainPortal />
    </AuthProvider>
  );
}
