import React, { useState, useEffect } from 'react';
import { GroupConfig } from '../types';
import { Language } from '../utils/translations';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Search, Printer, DollarSign, Download, Filter, Send, Plus, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface TuitionFeeManagerViewProps {
  lang: Language;
  groups: GroupConfig[];
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  month: string;
  amount: number;
  status: 'Paid (Kaffalameera)' | 'Unpaid (Hin Kaffalamne)' | 'Partial (Garamiin)';
  paidDate?: string;
  receiptNo: string;
  notes?: string;
}

const HIJRI_MONTHS_LIST = [
  '1448-Muharram',
  '1448-Safar',
  '1448-Rabi I',
  '1448-Rabi II',
  '1448-Jumada I',
  '1448-Jumada II',
  '1448-Rajab',
  '1448-Sha`ban',
  '1448-Ramadan',
  '1448-Shawwal',
  '1448-Dhu al-Qi`dah',
  '1448-Dhu al-Hijjah',
];

export const TuitionFeeManagerView: React.FC<TuitionFeeManagerViewProps> = ({ lang, groups }) => {
  const { canEdit } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('1448-Muharram');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  
  // Storage of payment records
  const [records, setRecords] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_tuition_1448');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default generate initial records for students in groups
    const initial: PaymentRecord[] = [];
    let counter = 1001;
    groups.forEach((g) => {
      g.students.forEach((st, idx) => {
        const isPaid = idx % 2 === 0;
        initial.push({
          id: `pay_${g.id}_${st.id}_muharram`,
          studentId: st.id,
          studentName: st.name,
          groupId: g.id,
          groupName: g.name,
          month: '1448-Muharram',
          amount: 300,
          status: isPaid ? 'Paid (Kaffalameera)' : 'Unpaid (Hin Kaffalamne)',
          paidDate: isPaid ? '01 Muharram 1448' : undefined,
          receiptNo: `REC-1448-${counter++}`,
        });
      });
    });
    return initial;
  });

  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_tuition_1448', JSON.stringify(records));
  }, [records]);

  // Toggle status
  const handleTogglePayment = async (recId: string) => {
    if (!canEdit) {
      alert("⚠️ Hayyama malee jijjiirama gochuun hin danda'amu! Hayyama Bulchaa (PIN: 1448) bani.");
      return;
    }
    const updated = records.map((r) => {
      if (r.id === recId) {
        const nextStatus = r.status.includes('Paid')
          ? ('Unpaid (Hin Kaffalamne)' as const)
          : ('Paid (Kaffalameera)' as const);
        return {
          ...r,
          status: nextStatus,
          paidDate: nextStatus.includes('Paid') ? new Date().toLocaleDateString() : undefined,
        };
      }
      return r;
    });
    setRecords(updated);

    // Sync to Firestore
    try {
      const target = updated.find((r) => r.id === recId);
      if (target) {
        await setDoc(doc(db, 'tuition_payments', target.id), {
          ...target,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('Firestore tuition payment update fallback:', e);
    }
  };

  // Filtered
  const filteredRecords = records.filter((r) => {
    const matchesMonth = r.month === selectedMonth;
    const matchesQuery = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Paid'
        ? r.status.includes('Paid')
        : !r.status.includes('Paid');
    return matchesMonth && matchesQuery && matchesStatus;
  });

  // Calculate totals
  const totalPaidCount = filteredRecords.filter((r) => r.status.includes('Paid')).length;
  const totalUnpaidCount = filteredRecords.filter((r) => !r.status.includes('Paid')).length;
  const totalAmountCollected = filteredRecords
    .filter((r) => r.status.includes('Paid'))
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Finansii & Kaffaltii Barattootaa (Tuition & Fees)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white font-serif">
              {lang === 'om'
                ? "Hordoffii Kaffaltii Ji'aanii Barattootaa 1448 H"
                : lang === 'ar'
                ? 'إدارة الرسوم والمصروفات الشهرية للطلاب ١٤٤٨ هـ'
                : 'Monthly Student Tuition Fee Management 1448 H'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Kaffaltii ji'aanii barattootaa to'achuu, nagahee PDF uumuu fi gabaasa kaffaltii qopheessuu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#142038] p-3 rounded-2xl border border-[#2C3E7A] text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Kaffaltii Waliigala (Collected)</span>
              <span className="text-lg font-extrabold text-[#E8A87C] font-mono">{totalAmountCollected.toLocaleString()} ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Barattoota Kaffalan (Paid)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalPaidCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Hin Kaffalamne (Unpaid)</p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-1">{totalUnpaidCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Gatigiin Ji'aa (Monthly Rate)</p>
            <h3 className="text-2xl font-extrabold text-[#1B2A4A] mt-1 font-mono">300 ETB</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B2A4A] flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Ji'a (Hijri Month):</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A] outline-none"
          >
            {HIJRI_MONTHS_LIST.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Barataa / Garee barbaadi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1B2A4A] outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['All', 'Paid', 'Unpaid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'All' ? 'Hunda (All)' : st === 'Paid' ? 'Kaffalameera' : 'Hin Kaffalamne'}
            </button>
          ))}
        </div>
      </div>

      {/* Tuition Records Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#1B2A4A] text-white text-xs uppercase font-bold">
                <th className="p-3 text-center">Nagahee #</th>
                <th className="p-3 text-right">Maqaa Barataa</th>
                <th className="p-3 text-center">Halkaa / Garee</th>
                <th className="p-3 text-center">Ji'a</th>
                <th className="p-3 text-center">Gatigiin</th>
                <th className="p-3 text-center">Haala Kaffaltii</th>
                <th className="p-3 text-center">Tarkaanfii (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                    Ragaan kaffaltii hin argamne.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isPaid = rec.status.includes('Paid');
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3 text-center font-mono font-bold text-slate-500">
                        {rec.receiptNo}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {rec.studentName}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-600">
                        {rec.groupName}
                      </td>
                      <td className="p-3 text-center font-medium text-slate-500">
                        {rec.month}
                      </td>
                      <td className="p-3 text-center font-bold font-mono text-[#1B2A4A]">
                        {rec.amount} ETB
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleTogglePayment(rec.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              isPaid
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {isPaid ? 'Jijjiiri (Unpaid)' : 'Kaffali (Mark Paid)'}
                          </button>

                          {isPaid && (
                            <button
                              onClick={() => setSelectedReceipt(rec)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                              title="Nagahee PDF Printi"
                            >
                              <Printer className="w-4 h-4 text-[#1B2A4A]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Printable Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div id="tuition-receipt-print-area" className="p-6 border-2 border-dashed border-[#1B2A4A]/20 rounded-2xl bg-slate-50 space-y-4">
              <div className="text-center border-b pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                  🕌
                </div>
                <h3 className="font-serif font-extrabold text-[#1B2A4A] text-lg">
                  MARKAZ TAAJUL WAQAAR
                </h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold">NAGAHEE KAFFALTII (OFFICIAL TUITION RECEIPT)</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-bold">Lakk. Nagahee:</span>
                  <span className="font-mono font-bold text-[#1B2A4A]">{selectedReceipt.receiptNo}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-bold">Barataa:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-bold">Halkaa / Garee:</span>
                  <span className="font-bold text-slate-700">{selectedReceipt.groupName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-bold">Ji'a Hijrii:</span>
                  <span className="font-bold text-slate-700">{selectedReceipt.month}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500 font-bold">Guyyaa Kaffaltii:</span>
                  <span className="font-semibold text-slate-600">{selectedReceipt.paidDate || 'Today'}</span>
                </div>
                <div className="flex justify-between border-b pb-1 pt-1 bg-[#1B2A4A] text-white p-2 rounded-xl">
                  <span className="font-bold">Gatigiin Kaffalame:</span>
                  <span className="font-mono font-bold text-[#E8A87C] text-sm">{selectedReceipt.amount} ETB</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] text-emerald-700 font-bold bg-emerald-100 p-1.5 rounded-lg border border-emerald-300">
                  ✓ Kaffaltiin Guutummaatti Galmaa'eera (PAID IN FULL)
                </p>
                <p className="text-[9px] text-slate-400 mt-2">Jazakumullahu Khairan - Markaz Tajul Waqar 1448 H</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cufi (Close)
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1B2A4A] hover:bg-[#2C3E7A] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-[#E8A87C]" />
                <span>Print Nagahee</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
