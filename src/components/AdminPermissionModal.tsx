import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPermissionModal: React.FC<AdminPermissionModalProps> = ({ isOpen, onClose }) => {
  const { canEdit, unlockEditPermission, lockEditPermission } = useAuth();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const ok = unlockEditPermission(pinInput);
    if (ok) {
      setSuccessMsg("🔓 Hayyamni Barreessuu (Edit Permission) Milkaa'inaan Bannameera!");
      setPinInput('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } else {
      setErrorMsg('❌ Koodii PIN dogoggoraa! Hayyama argachuuf PIN sirrii (e.g., 1448) galchaa.');
    }
  };

  const handleLock = () => {
    lockEditPermission();
    setSuccessMsg('🔒 Hayyamni Barreessuu Cufameera (Read-Only Mode Active).');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow-md ${
            canEdit ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {canEdit ? <Unlock className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6 text-amber-600" />}
          </div>

          <h3 className="font-serif font-extrabold text-slate-900 text-lg">
            Bulchiinsa Hayyama Barreessuu (Admin Permission Lock)
          </h3>
          <p className="text-xs text-slate-500">
            {canEdit
              ? "Hayyamni barreessuu (Edit Mode) amma BANNAMERA. Hayyama gubbaarraa malee maatiin ykn keessummaan akka hin jijjiirre cuftu dhesse."
              : "Hayyamni barreessuu (Edit Mode) CUFAMEERA. Jijjiirama gochuuf koodii PIN Bulchaa galchaa."}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {canEdit ? (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleLock}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Cufi / Read-Only Mode Aanaasi (Lock Edits)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center italic">
              {"Yoo cuftan, namni kamiyyuu hayyama malee data jijjiiruu hin danda'u."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Koodii PIN Bulchaa (Admin PIN):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Koodii PIN galchaa (PIN default: 1448)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#1B2A4A] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-[#E8A87C]" />
              <span>Bani (Unlock Edit Permission)</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
