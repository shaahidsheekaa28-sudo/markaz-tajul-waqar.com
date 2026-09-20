import React, { useState } from 'react';
import { GroupConfig } from '../types';
import { Language } from '../utils/translations';
import { QrCode, Printer, Search, UserCheck, ShieldCheck, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface StudentIdCardViewProps {
  lang: Language;
  groups: GroupConfig[];
}

export const StudentIdCardView: React.FC<StudentIdCardViewProps> = ({ lang, groups }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [scanInput, setScanInput] = useState<string>('');
  const [scannedStudentMsg, setScannedStudentMsg] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];
  const allStudents = groups.flatMap((g) => g.students.map((s) => ({ ...s, groupName: g.name, groupId: g.id })));

  const currentStudent =
    allStudents.find((s) => s.id === selectedStudentId) ||
    (selectedGroup?.students[0]
      ? { ...selectedGroup.students[0], groupName: selectedGroup.name, groupId: selectedGroup.id }
      : null);

  // Handle Scan Check-in
  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const matched = allStudents.find(
      (s) => s.id.toLowerCase() === scanInput.toLowerCase() || s.name.toLowerCase().includes(scanInput.toLowerCase())
    );

    if (matched) {
      setSelectedStudentId(matched.id);
      setSelectedGroupId(matched.groupId);
      setScannedStudentMsg(`✅ Barataan Scan Ta'eera: ${matched.name} (${matched.groupName}) - Argamni Galmaa'eera!`);
    } else {
      setScannedStudentMsg(`❌ Barataan ID/Maqaa "${scanInput}" koodii scanner keessatti hin argamne.`);
    }

    setTimeout(() => setScannedStudentMsg(null), 5000);
    setScanInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <QrCode className="w-3.5 h-3.5" />
              <span>Waraqaa Eenyummaa Barataa & Scanner</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white font-serif">
              {lang === 'om'
                ? 'Waraqaa Eenyummaa (ID Cards) fi QR Scanner Barattootaa'
                : lang === 'ar'
                ? 'بطاقات الطلاب الرقمية والماسح الضوئي QR'
                : 'Student ID Cards & QR Attendance Scanner'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Waraqaa eenyummaa Koodii QR qabu uumuu, print gochuu fi Koodii scan gochuun argama galmeessuu.
            </p>
          </div>
        </div>
      </div>

      {scannedStudentMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm ${
          scannedStudentMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          <span>{scannedStudentMsg}</span>
        </div>
      )}

      {/* Grid: Scanner & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: QR Scanner & Controls */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* Quick Scanner Box */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#1B2A4A]" />
              <span>QR Code Attendance Scanner</span>
            </h3>

            <form onSubmit={handleSimulateScan} className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">
                Lakk. ID ykn Koodii QR Scan Gochuuf Funaani:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="ID Barataa (e.g., st_101)..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#1B2A4A] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                >
                  Scan
                </button>
              </div>
            </form>
          </div>

          {/* Group and Student Picker */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Filannoo Barataa (Select Student)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Garee / Halkaa:</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    const g = groups.find((gr) => gr.id === e.target.value);
                    if (g && g.students[0]) setSelectedStudentId(g.students[0].id);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#1B2A4A] outline-none"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Barataa:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#1B2A4A] outline-none"
                >
                  {selectedGroup?.students.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: ID Card Preview Card */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          
          <div className="text-center">
            <h3 className="font-serif font-extrabold text-slate-800 text-base">
              Waraqaa Eenyummaa Barataa (Printable Student ID Card)
            </h3>
            <p className="text-xs text-slate-500">
              Waraqaan eenyummaa kun barataa fi maatiif akka saanduqa eenyummaatti tajaajila.
            </p>
          </div>

          {currentStudent ? (
            <div id="printable-student-id-card" className="w-[340px] sm:w-[380px] bg-gradient-to-b from-[#1B2A4A] via-[#142038] to-[#0D1526] text-white p-6 rounded-3xl shadow-2xl border-2 border-[#E8A87C] relative overflow-hidden space-y-5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#2C3E7A] pb-3">
                <div className="flex items-center gap-2">
                  <Logo size="sm" />
                  <div>
                    <h4 className="font-serif font-extrabold text-xs text-white">MARKAZ TAAJUL WAQAAR</h4>
                    <p className="text-[9px] text-[#E8A87C] font-mono">STUDENT ID • 1448 H</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#2C3E7A] text-[#E8A87C] px-2 py-0.5 rounded-full border border-[#E8A87C]/30">
                  OFFICIAL
                </span>
              </div>

              {/* Student Photo & Details */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl bg-slate-200 border-2 border-[#E8A87C] flex items-center justify-center text-slate-400 font-bold text-2xl shrink-0 shadow-inner">
                  👤
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Maqaa Barataa</span>
                    <strong className="text-sm font-extrabold text-white block truncate">{currentStudent.name}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Halkaa / Garee</span>
                    <span className="font-semibold text-[#E8A87C] block truncate">{currentStudent.groupName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Lakk. ID</span>
                    <span className="font-mono font-bold text-slate-300 block">{currentStudent.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Graphic Section */}
              <div className="bg-white p-3 rounded-2xl flex items-center justify-between gap-3 text-slate-900 shadow-lg">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-extrabold text-[#1B2A4A] block">VERIFIED QURAN STUDENT</span>
                  <p className="text-[8px] text-slate-500">Scan QR Code for Instant Verification & Attendance</p>
                </div>
                
                {/* SVG Visual QR Code */}
                <div className="w-14 h-14 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                    <path d="M2,2H10V10H2V2M4,4V8H8V4H4M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M18,14V18H14V14H18M14,18V22H18V18H14M18,20V22H22V20H18Z" />
                  </svg>
                </div>
              </div>

              <div className="text-center pt-1">
                <p className="text-[8px] text-slate-400 font-mono">Markaz Tajul Waqar for Quranic Sciences • Hijri 1448</p>
              </div>

            </div>
          ) : (
            <div className="text-slate-400 text-xs">Barataan hin filatamne.</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#E8A87C]" />
              <span>Print Student ID Card</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
