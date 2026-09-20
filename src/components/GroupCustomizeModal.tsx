import React, { useState } from 'react';
import { GroupConfig, REGISTER_COLUMNS } from '../types';
import { GroupIcon, GROUP_ICONS_LIST, GROUP_PRESET_COLORS } from './GroupIcon';
import { X, Check, Palette, Sparkles, Edit3, Columns, Eye, EyeOff, LayoutGrid, UserCheck } from 'lucide-react';

interface GroupCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupConfig;
  onSaveGroupCustomization: (groupId: string, updates: Partial<GroupConfig>) => void;
  initialTab?: 'appearance' | 'columns';
}

export const GroupCustomizeModal: React.FC<GroupCustomizeModalProps> = ({
  isOpen,
  onClose,
  group,
  onSaveGroupCustomization,
  initialTab = 'appearance',
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'columns'>(initialTab);
  const [name, setName] = useState(group.name);
  const [teacherName, setTeacherName] = useState(group.teacherName || '');
  const [selectedIcon, setSelectedIcon] = useState(group.icon || 'book');
  const [selectedColor, setSelectedColor] = useState(group.color || '#1B2A4A');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(group.hiddenColumns || []);

  if (!isOpen) return null;

  const toggleColumnVisibility = (colId: string) => {
    setHiddenColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const showAllColumns = () => {
    setHiddenColumns([]);
  };

  const hideOptionalColumns = () => {
    // Keep core, recited, attendance, signed; hide notice, hesitation, stoppage, prompt
    setHiddenColumns(['notice', 'hesitation', 'stoppage', 'prompt']);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveGroupCustomization(group.id, {
      name: name.trim(),
      teacherName: teacherName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      hiddenColumns,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative text-right my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold shadow-sm transition-all shrink-0"
              style={{ backgroundColor: selectedColor }}
            >
              <GroupIcon iconName={selectedIcon} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">إعدادات وتخصيص حلقة {group.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                تخصيص الاسم، الأيقونة، اللون، وإظهار/إخفاء الأعمدة في الجدول
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Palette className="w-4 h-4 text-[#E8A87C]" />
            <span>اسم الحلقة والهوية البصرية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('columns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'columns'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Columns className="w-4 h-4 text-[#E8A87C]" />
            <span>إعدادات الأعمدة ({REGISTER_COLUMNS.length - hiddenColumns.length}/{REGISTER_COLUMNS.length})</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 pt-4 overflow-y-auto flex-1 pr-1">
          
          {/* TAB 1: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Group Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#2C3E7A]" />
                  <span>اسم الحلقة القرءانية:</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C3E7A] bg-gray-50 text-gray-800"
                  placeholder="مثال: حلقة زيد بن ثابت..."
                  required
                />
              </div>

              {/* Teacher/Ustaaz Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2C3E7A]" />
                  <span>اسم أستاذ/معلم الحلقة (Maqaa Ustaaza Halaqaa):</span>
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C3E7A] bg-gray-50 text-gray-800"
                  placeholder="أدخل اسم أستاذ/معلم الحلقة..."
                />
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A87C]" />
                  <span>اختر الأيقونة المميزة للحلقة:</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {GROUP_ICONS_LIST.map((item) => {
                    const isSelected = selectedIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIcon(item.id)}
                        title={item.label}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1B2A4A] bg-[#1B2A4A]/10 ring-2 ring-[#1B2A4A]'
                            : 'border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <GroupIcon
                          iconName={item.id}
                          className="w-5 h-5"
                          color={isSelected ? selectedColor : '#4A5568'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#3498DB]" />
                  <span>اختر اللون المميز للحلقة:</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {GROUP_PRESET_COLORS.map((col) => {
                    const isSelected = selectedColor.toLowerCase() === col.hex.toLowerCase();
                    return (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setSelectedColor(col.hex)}
                        title={col.name}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-sm relative border border-white"
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Option */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-500 font-bold">أو أدخل لوناً خاصاً (HEX):</span>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-gray-700">{selectedColor}</span>
              </div>
            </div>
          )}

          {/* TAB 2: Column Visibility */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div className="bg-[#EDF2F7] p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <span className="text-gray-700 font-bold">
                  حدد الأعمدة المراد إظهارها أو إخفاؤها في جدول التسميع اليومي:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={showAllColumns}
                    className="text-[11px] font-bold text-[#2C3E7A] hover:underline cursor-pointer"
                  >
                    إظهار الكل
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={hideOptionalColumns}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    نمط مبسط
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {REGISTER_COLUMNS.map((col) => {
                  const isHidden = hiddenColumns.includes(col.id);
                  const isVisible = !isHidden;

                  return (
                    <div
                      key={col.id}
                      onClick={() => toggleColumnVisibility(col.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isVisible
                          ? 'bg-white border-gray-300 hover:border-[#2C3E7A] shadow-2xs'
                          : 'bg-gray-100 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isVisible ? 'bg-[#1B2A4A] text-white' : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-[#1B2A4A] flex items-center gap-2">
                            <span>{col.label}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                              {col.id}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{col.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0 mr-2">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => {}} // Handled by outer div
                          className="w-4 h-4 accent-[#1B2A4A] rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1B2A4A] text-white font-bold text-xs shadow hover:bg-[#2C3E7A] cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#E8A87C]" />
              <span>حفظ التغييرات والتفضيلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

