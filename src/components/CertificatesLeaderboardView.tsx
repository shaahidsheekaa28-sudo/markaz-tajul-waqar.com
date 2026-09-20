import React, { useState } from 'react';
import { GroupConfig } from '../types';
import { Language } from '../utils/translations';
import { Award, Trophy, Printer, Sparkles, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface CertificatesLeaderboardViewProps {
  lang: Language;
  groups: GroupConfig[];
}

export const CertificatesLeaderboardView: React.FC<CertificatesLeaderboardViewProps> = ({ lang, groups }) => {
  const [activeSubTab, setActiveSubTab] = useState<'certificates' | 'leaderboard'>('certificates');
  
  const [selectedStudentName, setSelectedStudentName] = useState<string>('Abdullaah Ahmad');
  const [selectedJuz, setSelectedJuz] = useState<string>('Juz 30 (Amma)');
  const [teacherName, setTeacherName] = useState<string>('Ustaaz Aliyyii');
  const [issueDate, setIssueDate] = useState<string>('15 Muharram 1448 H');

  const allStudents = groups.flatMap((g) => g.students.map((s) => ({ ...s, groupName: g.name })));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <Award className="w-3.5 h-3.5" />
              <span>Certifiketii Xumura Juz'ii & Barattoota Fleexii</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white font-serif">
              {lang === 'om'
                ? "Waraqaa Ragaa (Certificate Generator) fi Barattoota Fleexii Ji'aa"
                : lang === 'ar'
                ? 'شهادات التقدير وختم أجزاء القرآن ولوحة الشرف'
                : 'Quran Completion Certificates & Top Students Leaderboard'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Waraqaa ragaa xumura Juz'ii uumuu, print gochuu fi barattoota qabxii gaarii qaban badhaasuu.
            </p>
          </div>

          <div className="flex bg-[#142038] p-1 rounded-2xl border border-[#2C3E7A]">
            <button
              onClick={() => setActiveSubTab('certificates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'certificates' ? 'bg-[#E8A87C] text-[#1B2A4A]' : 'text-slate-300 hover:text-white'
              }`}
            >
              📜 Waraqaa Ragaa (Certificates)
            </button>
            <button
              onClick={() => setActiveSubTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'leaderboard' ? 'bg-[#E8A87C] text-[#1B2A4A]' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏆 Barattoota Fleexii (Leaderboard)
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'certificates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 lg:col-span-1">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <Sparkles className="w-4 h-4 text-[#1B2A4A]" />
              <span>Odeeffannoo Certifiketii Galchaa</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Maqaa Barataa:</label>
                <input
                  type="text"
                  value={selectedStudentName}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Juz'ii Xumurame:</label>
                <select
                  value={selectedJuz}
                  onChange={(e) => setSelectedJuz(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#1B2A4A] outline-none"
                >
                  <option value="Juz 30 (Amma)">Juz 30 (Amma)</option>
                  <option value="Juz 29 (Tabarak)">Juz 29 (Tabarak)</option>
                  <option value="Juz 28 (Qad Sami'a)">Juz 28 (Qad Sami'a)</option>
                  <option value="Juz 1-5 (5 Ajzaa')">Juz 1-5 (5 Ajzaa')</option>
                  <option value="Guutuu Qur'aana (30 Ajzaa')">Guutuu Qur'aana (30 Ajzaa')</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maqaa Barsiisaa / Ustaaza:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guyyaa (Date):</label>
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer pt-2"
            >
              <Printer className="w-4 h-4 text-[#E8A87C]" />
              <span>Print Certificate (PDF)</span>
            </button>
          </div>

          {/* Printable Certificate Frame */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-100 p-6 rounded-3xl border border-slate-200">
            
            <div id="printable-certificate-frame" className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl border-8 border-double border-[#1B2A4A] relative space-y-6 text-center text-slate-800">
              
              {/* Islamic Pattern Header */}
              <div className="border-b-2 border-[#E8A87C] pb-4 space-y-2 flex flex-col items-center">
                <Logo size="lg" className="shadow-lg" />
                <span className="text-xl">﷽</span>
                <h3 className="font-serif font-extrabold text-2xl text-[#1B2A4A] tracking-wide">
                  MARKAZ TAAJUL WAQAAR
                </h3>
                <p className="text-[10px] text-[#E8A87C] font-bold uppercase tracking-widest">
                  CENTER FOR QURANIC SCIENCES • HIJRI 1448
                </p>
              </div>

              {/* Certificate Title */}
              <div className="space-y-2">
                <div className="inline-block bg-[#1B2A4A] text-[#E8A87C] px-6 py-1.5 rounded-full text-xs font-serif font-extrabold shadow-md">
                  WARAQAA RAGAA XUMURA JUZ'II (CERTIFICATE OF ACHIEVEMENT)
                </div>
                <p className="text-xs text-slate-600 font-serif italic pt-2">
                  Waraqaan Ragaa Kun Barataa/Barattuu Armaan Gadiitiif Kennameera:
                </p>
              </div>

              {/* Student Name */}
              <div className="py-2 border-b border-slate-200">
                <h2 className="text-2xl font-serif font-extrabold text-[#1B2A4A] tracking-wide">
                  {selectedStudentName}
                </h2>
              </div>

              {/* Achievement Body */}
              <p className="text-xs text-slate-700 leading-relaxed font-serif px-4">
                Barataan/ttuun kun barnoota Hifzii fi Tajwiida Qur'aana Kabajamaa cichoominaan hordofuudhaan <strong className="text-[#1B2A4A] font-extrabold">{selectedJuz}</strong> milkaa'inaan xumuree/teera.
              </p>

              {/* Signatures Footer */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Barsiisaa (Teacher)</span>
                  <strong className="text-slate-800 font-serif block mt-1">{teacherName}</strong>
                  <span className="text-[9px] text-slate-400 block italic">Mallattoo / Signature</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Hogganaa Markazaa</span>
                  <strong className="text-[#1B2A4A] font-serif block mt-1">Dr. Sheikh Ahmad</strong>
                  <span className="text-[9px] text-slate-400 block italic">Chaappaa Markazaa / Seal</span>
                </div>
              </div>

              <div className="pt-2 text-[9px] font-mono text-slate-400">
                Guyyaa Kenname: {issueDate} • Verification ID: TJW-1448-CERT
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Leaderboard Subtab */
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-serif font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Barattoota Fleexii Ji'aa 1448 H (Top Quran Students)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Barattoota argama qulqulluu fi Hifzii gaarii qaban sadarkaa isaaniitiin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allStudents.slice(0, 6).map((st, idx) => (
              <div
                key={st.id}
                className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-md'
                    : idx === 1
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-orange-50/50 border-orange-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs text-white ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-white/80 px-2.5 py-1 rounded-full border">
                    {idx === 0 ? '🏆 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm">{st.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{st.groupName}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200">
                  <span className="text-emerald-700">✓ 100% Argama</span>
                  <span className="text-[#1B2A4A]">⭐ Qabxii: 98/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
