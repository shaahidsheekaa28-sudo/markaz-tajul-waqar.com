import React, { useState } from 'react';
import {
  Bell,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Clock,
  Filter,
  Sparkles,
  Calendar,
  CheckSquare,
  Square,
  BookmarkPlus,
} from 'lucide-react';

export interface ReminderItem {
  id: string;
  title: string;
  category: 'verification' | 'attendance' | 'homework' | 'custom';
  priority: 'high' | 'medium' | 'low';
  studentName?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

interface ReminderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  onAddReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAutoGenerateReminders?: () => void;
}

export const ReminderManagerModal: React.FC<ReminderManagerModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onAutoGenerateReminders,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'verification' | 'attendance' | 'homework' | 'custom'>('custom');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newStudentName, setNewStudentName] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      studentName: newStudentName.trim() || undefined,
      dueDate: newDueDate || undefined,
    });

    setNewTitle('');
    setNewStudentName('');
    setNewDueDate('');
  };

  const filteredReminders = reminders.filter((item) => {
    if (activeFilter === 'active') return !item.completed;
    if (activeFilter === 'completed') return item.completed;
    return true;
  });

  const activeCount = reminders.filter((r) => !r.completed).length;

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">عالي</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">متوسط</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">عادي</span>;
    }
  };

  const getCategoryLabel = (cat: ReminderItem['category']) => {
    switch (cat) {
      case 'verification':
        return 'توقيعات وتوثيق';
      case 'attendance':
        return 'متابعة حضور';
      case 'homework':
        return 'واجبات ومراجعة';
      default:
        return 'ملاحظة عامة';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative text-right overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold text-xl shadow-sm relative">
              <Bell className="w-6 h-6 text-[#E8A87C]" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {activeCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1B2A4A]">نظام التذكيرات والتنبيهات القرءانية</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                إدارة متابعة التوقيعات، المهام والمهام المعلقة لمعلمي الحلقات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1 pl-1 scrollbar-thin scrollbar-thumb-gray-300 flex-1">
          
          {/* Quick Auto-Generate Smart Reminders Bar */}
          {onAutoGenerateReminders && (
            <div className="bg-[#E8F0FE] p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1B2A4A]" />
                <span className="text-xs font-bold text-[#1B2A4A]">
                  توليد التنبيهات الذكية تلقائياً من سجل المتابعة الحالي
                </span>
              </div>
              <button
                type="button"
                onClick={onAutoGenerateReminders}
                className="bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs border border-[#2C3E7A]"
              >
                تحديث التنبيهات
              </button>
            </div>
          )}

          {/* New Reminder Form */}
          <form onSubmit={handleAddSubmit} className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-[#E8A87C]" />
              <span>إضافة تذكير جديد:</span>
            </h4>

            <input
              type="text"
              placeholder="عنوان التذكير (مثال: متابعة التوقيعات المعلقة لليوم)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#2C3E7A]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">اسم الطالب (اختياري)</label>
                <input
                  type="text"
                  placeholder="اسم الطالب..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">الأولويات</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="high">عالي (مهم جداً)</option>
                  <option value="medium">متوسط</option>
                  <option value="low">عادي</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">تصنيف التذكير</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="verification">توقيعات وتوثيق</option>
                  <option value="attendance">متابعة حضور</option>
                  <option value="homework">واجبات ومراجعة</option>
                  <option value="custom">عام</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E8A87C]" />
              <span>إضافة إلى قائمة التذكيرات</span>
            </button>
          </form>

          {/* Filters Bar */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#1B2A4A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                الكل ({reminders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'active'
                    ? 'bg-[#1B2A4A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                نشط ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-[#1B2A4A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                مكتمل ({reminders.length - activeCount})
              </button>
            </div>

            <span className="text-[11px] font-bold text-gray-500">
              قائمة التذكيرات
            </span>
          </div>

          {/* Reminders List */}
          <div className="space-y-2">
            {filteredReminders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold">لا توجد تذكيرات ضمن هذه التصفية حالياً</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  يمكنك إضافة تذكيرات جديدة من النموذج أعلاه أو الضغط على تحديث التنبيهات.
                </p>
              </div>
            ) : (
              filteredReminders.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    item.completed
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-300 shadow-2xs hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(item.id)}
                      className="mt-0.5 text-gray-500 hover:text-[#27AE60] cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 text-[#27AE60]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            item.completed ? 'line-through text-gray-500' : 'text-[#1B2A4A]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {getPriorityBadge(item.priority)}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 flex-wrap">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.studentName && (
                          <span className="text-[#2C3E7A] font-bold">
                            الطالب: {item.studentName}
                          </span>
                        )}
                        <span>• {item.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteReminder(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="حذف التذكير"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#1B2A4A] text-white font-bold text-xs shadow hover:bg-[#2C3E7A] cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
