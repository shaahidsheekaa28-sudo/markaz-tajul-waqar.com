import React, { useState } from 'react';
import { GroupConfig } from '../types';
import { GroupIcon } from './GroupIcon';
import { GroupCustomizeModal } from './GroupCustomizeModal';
import { Plus, UserPlus, BookCheck, Palette, Edit2 } from 'lucide-react';

interface GroupSelectorProps {
  groups: GroupConfig[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onOpenStudentManager: () => void;
  onAddGroup: () => void;
  onSaveGroupCustomization?: (groupId: string, updates: Partial<GroupConfig>) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenStudentManager,
  onAddGroup,
  onSaveGroupCustomization,
}) => {
  const [editingGroup, setEditingGroup] = useState<GroupConfig | null>(null);
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-[#2C3E7A]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1B2A4A]">الحلقات القرءانية المقيدة</h2>
              {selectedGroup?.teacherName && (
                <span className="text-[11px] font-bold bg-[#1B2A4A]/10 text-[#1B2A4A] px-2 py-0.5 rounded-full border border-[#1B2A4A]/20">
                  معلم الحلقة: {selectedGroup.teacherName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-normal mt-0.5">
              اختر الحلقة للبدء في المتابعة أو خصص أيقونتها، أستاذها، ولونها للتمييز البصري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            onClick={() => setEditingGroup(selectedGroup)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer border border-amber-200"
            title="تخصيص أيقونة ولون هذه الحلقة"
          >
            <Palette className="w-3.5 h-3.5 text-amber-700" />
            <span>تخصيص الحلقة</span>
          </button>

          <button
            onClick={onOpenStudentManager}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] text-xs font-semibold transition-colors cursor-pointer border border-gray-200"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#2C3E7A]" />
            <span>طلاب {selectedGroup?.name} ({selectedGroup?.students.length})</span>
          </button>

          <button
            onClick={onAddGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2C3E7A] hover:bg-[#1B2A4A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#E8A87C]" />
            <span>إضافة حلقة جديدة</span>
          </button>
        </div>
      </div>

      {/* Tabs / Buttons Bar with Group Icons and Color Indicators */}
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((group) => {
          const isSelected = group.id === selectedGroupId;
          const groupColor = group.color || '#1B2A4A';

          return (
            <div key={group.id} className="relative group/tab flex items-center">
              <button
                onClick={() => onSelectGroup(group.id)}
                style={{
                  borderColor: isSelected ? groupColor : undefined,
                  borderRightColor: isSelected ? groupColor : undefined,
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1B2A4A] text-white shadow-sm border-r-4'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-[#1B2A4A]'
                }`}
              >
                {/* Custom Group Icon with group color accent */}
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${groupColor}20`,
                  }}
                >
                  <GroupIcon
                    iconName={group.icon || 'book'}
                    className="w-3.5 h-3.5"
                    color={isSelected ? '#ffffff' : groupColor}
                  />
                </div>

                <div className="flex flex-col text-right">
                  <span>حلقة {group.name}</span>
                  {group.teacherName && (
                    <span
                      className={`text-[9px] font-semibold ${
                        isSelected ? 'text-[#E8A87C]' : 'text-[#2C3E7A]'
                      }`}
                    >
                      👤 {group.teacherName}
                    </span>
                  )}
                </div>

                {/* Color Dot indicator */}
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/50 shrink-0"
                  style={{ backgroundColor: groupColor }}
                  title={`اللون المميز: ${groupColor}`}
                />

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isSelected ? 'bg-white/15 text-[#E8A87C]' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {group.students.length}
                </span>

                {group.isMuadhSpecial && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-700 px-1 py-0.5 rounded font-bold">
                    خاص
                  </span>
                )}
              </button>

              {/* Edit Icon button on hover/selected */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingGroup(group);
                }}
                className="p-1.5 bg-white text-gray-500 hover:text-[#1B2A4A] hover:bg-amber-100 rounded-md border border-gray-200 text-xs shadow-2xs mr-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                title="تعديل أيقونة ولون الحلقة"
              >
                <Edit2 className="w-3 h-3 text-amber-700" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Customize Group Modal */}
      {editingGroup && onSaveGroupCustomization && (
        <GroupCustomizeModal
          isOpen={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
          onSaveGroupCustomization={onSaveGroupCustomization}
        />
      )}
    </div>
  );
};

