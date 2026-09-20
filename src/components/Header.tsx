import React, { useState } from 'react';
import { Download, FileText, Code, Users, Calendar, Award, Sparkles, BookOpen, CheckCircle, Bell, Bot, Printer, LogOut, MapPin, Send, TrendingUp, Globe, DollarSign, QrCode, ShieldCheck, Trophy, Lock, Unlock } from 'lucide-react';
import { CENTER_NAME_AR, CENTER_NAME_EN } from '../data/initialData';
import { Language, TRANSLATIONS } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { AdminPermissionModal } from './AdminPermissionModal';
import { Logo } from './Logo';

export type AppTab =
  | 'register'
  | 'teacher_attendance'
  | 'notifications'
  | 'analytics'
  | 'tuition_fee'
  | 'student_id'
  | 'parent_portal'
  | 'certificates'
  | 'classroom'
  | 'report'
  | 'python'
  | 'export';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onQuickExport: () => void;
  onOpenPdfModal?: () => void;
  studentCount: number;
  groupsCount: number;
  onOpenReminders?: () => void;
  activeReminderCount?: number;
  onOpenBotSettings?: () => void;
  currentUser?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
    teacherCode?: string | null;
  } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onQuickExport,
  onOpenPdfModal,
  studentCount,
  groupsCount,
  onOpenReminders,
  activeReminderCount = 0,
  onOpenBotSettings,
  currentUser,
  onLogout,
}) => {
  const t = TRANSLATIONS[lang];
  const { canEdit } = useAuth();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  return (
    <header className="bg-[#1B2A4A] text-white border-b border-[#2C3E7A] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Center Title & Branding */}
          <div className="flex items-center gap-3 text-center md:text-right">
            <Logo size="lg" className="hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white font-serif">
                  {lang === 'om' ? t.appName : CENTER_NAME_AR}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2C3E7A] text-[#E8A87C] border border-[#E8A87C]/30">
                  ١٤٤٨ هـ
                </span>
              </div>
              <p className="text-[11px] text-[#E8A87C] font-semibold tracking-wider mt-0.5 dir-ltr text-right md:text-right">
                {CENTER_NAME_EN} — Management Portal
              </p>
            </div>
          </div>

          {/* Language Selector & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Language Switcher Pills */}
            <div className="flex bg-[#142038] p-1 rounded-xl border border-[#2C3E7A]">
              <button
                onClick={() => setLang('om')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'om'
                    ? 'bg-[#E8A87C] text-[#1B2A4A]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Afaan Oromoo
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-[#E8A87C] text-[#1B2A4A]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#E8A87C] text-[#1B2A4A]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 bg-[#142038] px-3.5 py-1.5 rounded-lg border border-[#2C3E7A] text-xs">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span className="text-slate-300"><strong className="text-white font-bold">{groupsCount}</strong> Halkaawwan</span>
              </div>
              <span className="text-[#2C3E7A]">|</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span className="text-slate-300"><strong className="text-white font-bold">{studentCount}</strong> Barattoota</span>
              </div>
            </div>

            {onOpenReminders && (
              <button
                onClick={onOpenReminders}
                className="relative flex items-center gap-1.5 bg-[#142038] hover:bg-[#2C3E7A] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer border border-[#2C3E7A]"
                title="Beeksisa & Taddidii"
              >
                <Bell className="w-4 h-4 text-[#E8A87C]" />
                <span className="hidden sm:inline">Beeksisa</span>
                {activeReminderCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                    {activeReminderCount}
                  </span>
                )}
              </button>
            )}

            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer border border-red-500"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>PDF</span>
              </button>
            )}

            <button
              onClick={onQuickExport}
              className="flex items-center gap-1.5 bg-[#E8A87C] hover:bg-[#d9976b] text-[#1B2A4A] px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>

            {/* Admin Permission Lock Toggle Button */}
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-md transition-all cursor-pointer border ${
                canEdit
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
              title="Hayyama Barreessuu (Edit Permission Status)"
            >
              {canEdit ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline">{canEdit ? 'Barreessuu: Bannameera' : 'Barreessuu: Cufameera'}</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 bg-[#142038] px-2.5 py-1 rounded-lg border border-[#2C3E7A]">
                <div className="w-6 h-6 rounded-full bg-[#2C3E7A] text-[#E8A87C] flex items-center justify-center font-bold text-xs border border-[#E8A87C]">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white max-w-[120px] truncate leading-tight">
                    {currentUser.displayName || 'Barsiisaa'}
                  </span>
                  {currentUser.teacherCode && (
                    <span className="text-[9px] text-[#E8A87C] font-mono leading-tight font-bold">
                      {currentUser.teacherCode}
                    </span>
                  )}
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="bg-red-600/90 hover:bg-red-600 text-white px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-red-400"
                    title="Ba'i (Logout)"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-[#2C3E7A]/60 pt-3">
          
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#E8A87C]" />
            <span>{t.tabRegister}</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'teacher_attendance'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#E8A87C]" />
            <span>{t.tabTeacherAttendance}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 text-[#E8A87C]" />
            <span>{t.tabNotifications}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#E8A87C]" />
            <span>{t.tabAnalytics}</span>
          </button>

          <button
            onClick={() => setActiveTab('tuition_fee')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'tuition_fee'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#E8A87C]" />
            <span>Kaffaltii Ji'aa</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#E8A87C]" />
            <span>Google Classroom</span>
          </button>

          <button
            onClick={() => setActiveTab('student_id')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'student_id'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#E8A87C]" />
            <span>ID & QR Barataa</span>
          </button>

          <button
            onClick={() => setActiveTab('parent_portal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'parent_portal'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#E8A87C]" />
            <span>Daree Maatii</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'certificates'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#E8A87C]" />
            <span>Certifiketiilee</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-[#E8A87C]" />
            <span>Gabaasa Waliigalaa</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'python'
                ? 'bg-[#2C3E7A] text-white shadow-sm font-bold border-b-2 border-[#E8A87C]'
                : 'text-white/70 hover:bg-[#2C3E7A]/50 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4 text-[#E8A87C]" />
            <span>{t.tabPython}</span>
          </button>
        </div>
      </div>

      <AdminPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
      />
    </header>
  );
};

