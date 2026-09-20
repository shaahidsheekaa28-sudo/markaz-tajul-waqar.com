import React from 'react';
import { HIJRI_MONTHS, getRemainingMonths1448 } from '../utils/hijriCalendar';
import { Calendar, Filter } from 'lucide-react';
import { ExportScope } from '../types';

interface MonthSelectorProps {
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  viewMode: 'all_days' | 'study_only' | 'weekend_only';
  onSetViewMode: (mode: 'all_days' | 'study_only' | 'weekend_only') => void;
  scopeMode: ExportScope;
  onSetScopeMode: (scope: ExportScope) => void;
  selectedDayNumber: number | 'all';
  onSelectDayNumber: (day: number | 'all') => void;
  totalDaysInMonth: number;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onSelectMonth,
  viewMode,
  onSetViewMode,
  scopeMode,
  onSetScopeMode,
  selectedDayNumber,
  onSelectDayNumber,
  totalDaysInMonth,
}) => {
  const remainingMonths = getRemainingMonths1448();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-100">
        {/* Scope Modes */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#2C3E7A]" />
          <h3 className="text-sm font-bold text-[#1B2A4A]">التقويم والنطاق الزمني 1448 هـ</h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSetScopeMode('remaining')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
              scopeMode === 'remaining'
                ? 'bg-[#1B2A4A] text-white border-[#2C3E7A] shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            الأشهر المتبقية (بعد صفر)
          </button>

          <button
            onClick={() => onSetScopeMode('full_year')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
              scopeMode === 'full_year'
                ? 'bg-[#1B2A4A] text-white border-[#2C3E7A] shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            السنة الكاملة (١٤٤٨ هـ)
          </button>

          <button
            onClick={() => onSetScopeMode('current_month')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
              scopeMode === 'current_month'
                ? 'bg-[#1B2A4A] text-white border-[#2C3E7A] shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            شهر محدد فقط
          </button>
        </div>
      </div>

      {/* Month Buttons Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {HIJRI_MONTHS.map((month, idx) => {
          const isSelected = selectedMonth === month;

          return (
            <button
              key={month}
              onClick={() => onSelectMonth(month)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer min-w-[80px] border ${
                isSelected
                  ? 'bg-[#2C3E7A] text-white border-[#E8A87C] border-r-2 shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs">{month}</span>
              <span className="text-[9px] font-normal opacity-75 mt-0.5">
                شهر {(idx + 1).toString().padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Options & Day Jump Selector */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {/* Day Filter Toggle */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">تصفية الأيام:</span>
          <div className="inline-flex p-0.5 bg-gray-100 rounded-md text-xs font-medium border border-gray-200">
            <button
              onClick={() => onSetViewMode('all_days')}
              className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'all_days'
                  ? 'bg-white text-[#1B2A4A] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              جميع الأيام ({totalDaysInMonth})
            </button>
            <button
              onClick={() => onSetViewMode('study_only')}
              className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'study_only'
                  ? 'bg-[#E8F0FE] text-[#1B2A4A] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 أيام الدراسة
            </button>
            <button
              onClick={() => onSetViewMode('weekend_only')}
              className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'weekend_only'
                  ? 'bg-[#F0E6E6] text-red-900 shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 أيام العطلة
            </button>
          </div>
        </div>

        {/* Day Jumper */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">الانتقال ليوم معين:</span>
          <select
            value={selectedDayNumber}
            onChange={(e) =>
              onSelectDayNumber(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
            }
            className="text-xs bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2C3E7A]"
          >
            <option value="all">عرض جميع أيام الشهر</option>
            {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                اليوم {d} من {selectedMonth}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
