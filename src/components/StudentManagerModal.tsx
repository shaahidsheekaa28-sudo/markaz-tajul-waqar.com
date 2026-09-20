import React, { useState } from 'react';
import { GroupConfig, Student } from '../types';
import { Users, UserPlus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface StudentManagerModalProps {
  group: GroupConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGroupStudents: (groupId: string, newStudents: Student[]) => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  group,
  isOpen,
  onClose,
  onUpdateGroupStudents,
}) => {
  const [students, setStudents] = useState<Student[]>(group.students);
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: `${group.id}_s_${Date.now()}`,
      name: newStudentName.trim(),
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    onUpdateGroupStudents(group.id, updated);
    setNewStudentName('');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('هل أنت تأكد من حذف الطالب من الحلقة؟')) {
      const updated = students.filter((s) => s.id !== studentId);
      setStudents(updated);
      onUpdateGroupStudents(group.id, updated);
    }
  };

  const handleStartEditing = (s: Student) => {
    setEditingStudentId(s.id);
    setEditingName(s.name);
  };

  const handleSaveEditing = (studentId: string) => {
    if (!editingName.trim()) return;
    const updated = students.map((s) => (s.id === studentId ? { ...s, name: editingName.trim() } : s));
    setStudents(updated);
    onUpdateGroupStudents(group.id, updated);
    setEditingStudentId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === students.length - 1)) {
      return;
    }
    const newStudents = [...students];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newStudents[index];
    newStudents[index] = newStudents[targetIdx];
    newStudents[targetIdx] = temp;

    setStudents(newStudents);
    onUpdateGroupStudents(group.id, newStudents);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-right">
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
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">إدارة طلاب حلقة {group.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة، تعديل أسماء وترتيب الطلاب المقيدين بهذه الحلقة ({students.length} طلاب)
            </p>
          </div>
        </div>

        {/* Add Student Form */}
        <form onSubmit={handleAddStudent} className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="أدخل اسم الطالب الجديد..."
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2C3E7A] bg-slate-50 font-semibold"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#E8A87C]" />
            <span>إضافة طالب</span>
          </button>
        </form>

        {/* Students List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-300">
          {students.map((student, idx) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-xs"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                  {idx + 1}
                </span>

                {editingStudentId === student.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-blue-400 bg-white font-bold text-slate-900 flex-1 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEditing(student.id)}
                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingStudentId(null)}
                      className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === students.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEditing(student)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStudent(student.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1B2A4A] text-white font-bold text-xs shadow hover:bg-[#2C3E7A] cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
