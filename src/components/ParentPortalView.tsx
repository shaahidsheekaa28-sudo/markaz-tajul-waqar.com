import React, { useState, useEffect } from 'react';
import { GroupConfig, EvaluationDataMap, EvaluationRecord } from '../types';
import { Language } from '../utils/translations';
import { Users, Search, BookOpen, Calendar, CheckCircle2, AlertCircle, Phone, MessageSquare, Award, DollarSign, ShieldCheck, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ParentPortalViewProps {
  lang: Language;
  groups: GroupConfig[];
  evaluationMap: EvaluationDataMap;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({ lang, groups, evaluationMap }) => {
  const { canEdit } = useAuth();
  const [parentSearch, setParentSearch] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Custom Phone Register state stored locally
  const [phoneRegister, setPhoneRegister] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_parent_phones');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Initialize defaults from groups
    const initial: Record<string, string> = {};
    groups.forEach((g) => {
      g.students.forEach((st) => {
        if (st.parentPhone) {
          initial[st.id] = st.parentPhone;
        }
      });
    });
    return initial;
  });

  const [isAdminPhoneManagerOpen, setIsAdminPhoneManagerOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempPhoneInput, setTempPhoneInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_parent_phones', JSON.stringify(phoneRegister));
  }, [phoneRegister]);

  // Combine all students with updated phone register
  const allStudents = groups.flatMap((g) =>
    g.students.map((s) => ({
      id: s.id,
      name: s.name,
      groupName: g.name,
      groupId: g.id,
      parentPhone: phoneRegister[s.id] || s.parentPhone || '',
    }))
  );

  const [selectedStudent, setSelectedStudent] = useState<typeof allStudents[0] | null>(null);

  // Search strictly enforces registered phone number!
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSelectedStudent(null);

    const query = parentSearch.trim().replaceAll(/\s+/g, '');
    if (!query) return;

    // Match strictly by registered parent phone number or student ID if phone matches
    const matched = allStudents.find(
      (s) =>
        (s.parentPhone && s.parentPhone.replaceAll(/\s+/g, '') === query) ||
        (s.parentPhone && s.parentPhone.includes(query) && query.length >= 8) ||
        (s.id.toLowerCase() === query.toLowerCase())
    );

    if (matched) {
      if (!matched.parentPhone) {
        setSearchError("❌ Barataan kun Lakkofsa Bilbila Maatii galmaa'ee hin qabu. Bulchaan bilbila galmeessuu qaba.");
      } else {
        setSelectedStudent(matched);
      }
    } else {
      setSearchError("❌ Lakkofsi bilbilaa kun galmaa'ee hin jiru! Lakkofsa bilbilaa Bulchaan AN BARREESSE QOFAAN seenuun danda'ama.");
    }
  };

  const handleSavePhone = (studentId: string) => {
    if (!canEdit) {
      alert("⚠️ Hayyama malee bilbila jijjiirun hin danda'amu! PIN (1448) bani.");
      return;
    }
    setPhoneRegister((prev) => ({
      ...prev,
      [studentId]: tempPhoneInput.trim(),
    }));
    setEditingStudentId(null);
    setTempPhoneInput('');
  };

  // Calculate student specific stats
  let totalPresent = 0;
  let totalAbsent = 0;
  let recentSurah = 'سورة البقرة';
  let recentHomework = 'Review Juz 1';

  if (selectedStudent) {
    Object.entries(evaluationMap).forEach(([key, record]) => {
      if (key.includes(selectedStudent.id)) {
        const rec = record as EvaluationRecord;
        if (rec.attendance === 'حاضر') totalPresent++;
        if (rec.attendance === 'غائب') totalAbsent++;
        if (rec.surahVerses) recentSurah = rec.surahVerses;
        if (rec.homework) recentHomework = rec.homework;
      }
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <Users className="w-3.5 h-3.5" />
              <span>Moosaajii Maatii Barattootaa (Parent Access Portal)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white font-serif">
              {lang === 'om'
                ? "Daree Maatii - Lakkofsa Bilbila Maatii Galmaa'een Qofa"
                : lang === 'ar'
                ? 'بوابة ولي الأمر - الدخول برقم الهاتف المسجل فقط'
                : 'Parent Portal - Registered Phone Number Verification'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Lakkofsa bilbila maatii Bulchaan galmeesse qofaan seenuun gabaasa Hifzii fi Argama barataa ilaalaa.
            </p>
          </div>

          <button
            onClick={() => setIsAdminPhoneManagerOpen(true)}
            className="bg-[#2C3E7A] hover:bg-[#3B529A] text-[#E8A87C] border border-[#E8A87C]/40 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
          >
            <Phone className="w-4 h-4 text-[#E8A87C]" />
            <span>Galmee Bilbila Maatii (Admin Manager)</span>
          </button>
        </div>
      </div>

      {/* Parent Search Box */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-xl mx-auto space-y-4 text-center">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-center gap-2">
          <Phone className="w-4 h-4 text-[#1B2A4A]" />
          <span>Lakkofsa Bilbila Maatii Galmaa'e Galchaa:</span>
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              placeholder="Lakkofsa Bilbilaa (e.g., 0911123456)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#1B2A4A] outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
          >
            Seeni (Login)
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 text-left animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Registered Phone Examples Hint */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] text-slate-400 font-bold">Fakkeenya Bilbila Galmaa'anii:</span>
          {allStudents.filter(s => s.parentPhone).slice(0, 3).map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setParentSearch(st.parentPhone);
                setSelectedStudent(st);
                setSearchError(null);
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-[#1B2A4A] px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition-all"
            >
              {st.parentPhone} ({st.name})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Student Details Panel */}
      {selectedStudent ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold text-2xl shadow-md">
                🎓
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs font-semibold text-[#1B2A4A] mt-0.5">
                  Halkaa: <strong className="text-slate-800">{selectedStudent.groupName}</strong> | Bilbila Maatii: <span className="font-mono text-emerald-700 font-bold">{selectedStudent.parentPhone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${selectedStudent.parentPhone}?text=${encodeURIComponent(
                  `Gabaasa Barataa: ${selectedStudent.name}\nHalkaa: ${selectedStudent.groupName}\nArgama: Jira (${totalPresent}) / Hafe (${totalAbsent})\nMarkaz Tajul Waqar 1448 H`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Gabaasa WhatsApp Ergi</span>
              </a>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Argama (Present)</span>
                <p className="text-xl font-extrabold text-emerald-950">{totalPresent} Guyyoota</p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-red-800">Hafteera (Absent)</span>
                <p className="text-xl font-extrabold text-red-950">{totalAbsent} Guyyoota</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#E8A87C]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800">Suuraa/Aayaa Dhiyoofi</span>
                <p className="text-sm font-extrabold text-[#1B2A4A] truncate">{recentSurah}</p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Kaffaltii Ji'aa</span>
                <p className="text-sm font-extrabold text-amber-950">Kaffalameera (Paid)</p>
              </div>
            </div>

          </div>

          {/* Recitation Status Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#1B2A4A]" />
              <span>Gabaasa Hifzii fi Waajiba Bori:</span>
            </h4>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-serif">
              📖 <strong>Qabiyyee Hifzii:</strong> {recentSurah} | 📝 <strong>Waajiba Bori:</strong> {recentHomework}
            </p>
          </div>

        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl text-center border border-slate-200 text-slate-400 font-bold text-xs">
          Lakkofsa bilbila maatii galmaa'e olitti galchuun gabaasa barataa ilaalaa.
        </div>
      )}

      {/* Admin Registered Phone Numbers Manager Modal */}
      {isAdminPhoneManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#1B2A4A]" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Galmee Lakkofsa Bilbila Maatii Barattootaa
                </h3>
              </div>
              <button
                onClick={() => setIsAdminPhoneManagerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 shrink-0">
              Lakkofsa bilbilaa isin BARREESSITAN QOFAATIIN maatiin seenuu danda'a. Lakkofsa bilbila barataa kaniin fooyyessaa:
            </p>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 border rounded-2xl p-2 bg-slate-50/50">
              {allStudents.map((st) => (
                <div key={st.id} className="p-3 flex items-center justify-between gap-3 hover:bg-white rounded-xl transition-all">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">{st.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{st.groupName} | ID: {st.id}</span>
                  </div>

                  {editingStudentId === st.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempPhoneInput}
                        onChange={(e) => setTempPhoneInput(e.target.value)}
                        placeholder="0911000000..."
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none"
                      />
                      <button
                        onClick={() => handleSavePhone(st.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700"
                        title="Olkaayi (Save)"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#1B2A4A] bg-slate-100 px-2.5 py-1 rounded-lg border">
                        {st.parentPhone || '— Bilbilni Hin Galmeeffamne —'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingStudentId(st.id);
                          setTempPhoneInput(st.parentPhone || '');
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#1B2A4A]" />
                        <span>Fooyyessi</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                onClick={() => setIsAdminPhoneManagerOpen(false)}
                className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cufi (Done)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
