import React, { useState } from 'react';
import { GroupConfig, EvaluationDataMap, HijriCalendarData } from '../types';
import { downloadRegisterPdf, triggerPrintPdf } from '../utils/pdfExport';
import { CENTER_NAME_AR, CENTER_NAME_EN } from '../data/initialData';
import { FileText, Download, Printer, CheckCircle, RefreshCw, X, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupConfig[];
  selectedGroup: GroupConfig;
  selectedMonth: string;
  calendarData: HijriCalendarData;
  evaluationMap: EvaluationDataMap;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  groups,
  selectedGroup,
  selectedMonth,
  calendarData,
  evaluationMap,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async (targetId: string, filename: string) => {
    setIsExporting(true);
    setSuccessMessage(null);
    try {
      await downloadRegisterPdf(targetId, filename);
      setSuccessMessage(`تم تحميل ملف PDF بنجاح: ${filename}`);
    } catch (err) {
      console.error(err);
      // Fallback to print
      triggerPrintPdf();
      setSuccessMessage('تم فتح نافذة الطباعة وحفظ PDF الخاصة بالمتصفح.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    triggerPrintPdf();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <Logo size="lg" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">تنزيل طباعة وحفظ PDF</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {CENTER_NAME_AR} (١٤٤٨ هـ) — {CENTER_NAME_EN}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="block font-bold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Official Header Preview Info */}
        <div className="mb-6 bg-[#142038] text-white p-4 rounded-2xl border border-[#2C3E7A] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="xs" showBorder={false} />
              <span className="text-[#E8A87C] font-bold text-sm">{CENTER_NAME_AR}</span>
            </div>
            <span className="bg-[#2C3E7A] px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">١٤٤٨ هـ</span>
          </div>
          <p className="text-slate-300 font-medium">{CENTER_NAME_EN}</p>
          <div className="pt-2 border-t border-[#2C3E7A] flex flex-wrap items-center justify-between text-[11px] text-slate-300">
            <span>👤 <strong>Hogganaa Waliigalaa / المشرف العام:</strong> Ustaaz Aliyyii Muhammad Saanii (الأستاذ علي محمد ثاني)</span>
            <span>📅 <strong>الشهر المحدد:</strong> {selectedMonth}</span>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Download Register Table PDF */}
          <div className="bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-[#1B2A4A] text-[#E8A87C]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">سجل المتابعة اليومي (PDF)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                توليد وتحميل جدول المتابعة والتسميع اليومي لحلقة <strong>{selectedGroup.name}</strong> لشهر {selectedMonth}.
              </p>
            </div>

            <button
              disabled={isExporting}
              onClick={() => handleDownloadPdf('daily-register-table-container', `Taj_Ul_Waqar_Register_${selectedGroup.name}_1448.pdf`)}
              className="w-full flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#E8A87C]" />}
              <span>تحميل سجل المتابعة PDF</span>
            </button>
          </div>

          {/* Option 2: Instant High Quality Native PDF Print */}
          <div className="bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-emerald-700 text-white">
                  <Printer className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">طباعة ومُحفظ المتصفح (Print to PDF)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                فتح نافذة الطباعة المباشرة مع تنسيق عالي الجودة متوافق مع الحفظ بصيغة PDF لجميع الشاشات.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF مباشر</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتضمن الترويسة المعتمدة للمركز لعام ١٤٤٨ هـ</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
