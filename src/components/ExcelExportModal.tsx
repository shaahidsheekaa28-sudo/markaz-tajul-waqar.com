import React, { useState } from 'react';
import { GroupConfig, EvaluationDataMap, ExportScope } from '../types';
import { generateExcelWorkbook } from '../utils/excelGenerator';
import { Download, FileSpreadsheet, CheckCircle, Sparkles, Layers, RefreshCw, X } from 'lucide-react';

interface ExcelExportModalProps {
  groups: GroupConfig[];
  selectedGroup: GroupConfig;
  selectedMonth: string;
  evaluationMap: EvaluationDataMap;
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  groups,
  selectedGroup,
  selectedMonth,
  evaluationMap,
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFilename, setExportedFilename] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (scope: ExportScope, singleGroup?: GroupConfig) => {
    setIsExporting(true);
    setExportedFilename(null);

    try {
      const filename = await generateExcelWorkbook({
        groups,
        monthsScope: scope,
        selectedSingleGroup: singleGroup,
        selectedSingleMonth: selectedMonth,
        evaluationMap,
      });

      setExportedFilename(filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('حدث خطأ أثناء إنشاء ملف الإكسيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
          <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center shadow-md">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">توليد ملفات Excel المنسقة</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              توليد سجلات الإكسيل بتصميم مركز تاج الوقار الاحترافي (1448 هـ)
            </p>
          </div>
        </div>

        {/* Status notification */}
        {exportedFilename && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span>تم إنشاء وتحميل الملف بنجاح: </span>
              <strong className="block text-sm font-bold text-emerald-950 mt-0.5">{exportedFilename}</strong>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Remaining Months File */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-[#1B2A4A] text-[#E8A87C]">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">سجل باقي الشهور (بعد صفر)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                ينشئ ملف شامل لكل الحلقات يحتوي على جميع الشهور المتبقية من ربيع الأول إلى ذو الحجة.
              </p>
            </div>

            <button
              disabled={isExporting}
              onClick={() => handleExport('remaining')}
              className="w-full flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#E8A87C]" />}
              <span>توليد ملف الأشهر المتبقية</span>
            </button>
          </div>

          {/* Option 2: Full Year File */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-[#2C3E7A] text-white">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">السجل السنوي الكامل (١٢ شهر)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                ينشئ ملف يحتوي على العام الهجري كامل من محرم إلى ذو الحجة لجميع الحلقات القرءانية.
              </p>
            </div>

            <button
              disabled={isExporting}
              onClick={() => handleExport('full_year')}
              className="w-full flex items-center justify-center gap-2 bg-[#2C3E7A] hover:bg-[#1B2A4A] text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>توليد السجل السنوي الكامل</span>
            </button>
          </div>

          {/* Option 3: Individual Selected Group */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-[#E8A87C] text-[#1B2A4A]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">حلقة {selectedGroup.name} فقط</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                توليد ملف إكسيل منفصل لحلقة {selectedGroup.name} فقط ({selectedGroup.students.length} طلاب).
              </p>
            </div>

            <button
              disabled={isExporting}
              onClick={() => handleExport('remaining', selectedGroup)}
              className="w-full flex items-center justify-center gap-2 bg-[#E8A87C] hover:bg-[#d8976b] text-[#1B2A4A] py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>توليد ملف حلقة {selectedGroup.name}</span>
            </button>
          </div>

          {/* Option 4: Current Month Only */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-800 text-white">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">شهر {selectedMonth} فقط</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                توليد ملف إكسيل مخصص لشهر {selectedMonth} لجميع الحلقات القرءانية.
              </p>
            </div>

            <button
              disabled={isExporting}
              onClick={() => handleExport('current_month')}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>توليد ملف شهر {selectedMonth}</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            تنبيه: يتضمن الملف المولد التقييمات والحضور المدخلة في النظام تلقائياً.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
