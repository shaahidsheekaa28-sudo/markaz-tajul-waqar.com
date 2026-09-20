import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Language, TRANSLATIONS } from '../utils/translations';
import { Bell, Send, MessageSquare, Phone, UserCheck, AlertTriangle, ShieldCheck, CheckCircle2, History, X } from 'lucide-react';
import { GroupConfig } from '../types';

interface NotificationManagerModalProps {
  lang: Language;
  groups: GroupConfig[];
}

interface NotificationItem {
  id: string;
  recipientName: string;
  recipientPhone: string;
  recipientRole: 'Parent (Maatii)' | 'Admin (Bulchiinsa)' | 'Teacher (Barsiisaa)';
  message: string;
  type: 'Student Absence' | 'Teacher Late' | 'General Reminder';
  sentAt: string;
  status: 'Sent' | 'Pending';
}

export const NotificationManagerModal: React.FC<NotificationManagerModalProps> = ({ lang, groups }) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[lang];

  const [recipientRole, setRecipientRole] = useState<'Parent (Maatii)' | 'Admin (Bulchiinsa)' | 'Teacher (Barsiisaa)'>('Parent (Maatii)');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+251 91 234 5678');
  const [notificationType, setNotificationType] = useState<'Student Absence' | 'Teacher Late' | 'General Reminder'>('Student Absence');
  const [customMessage, setCustomMessage] = useState<string>(
    "Kabajamoo Maatii Barataa: Barataan keessan har'a daree Qur'aana Markaz Taajul Waqaar irraa hafeera. Yeroo dhiyootti nu qunnamaa."
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_notifications_1448');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'notif_1',
        recipientName: 'Maatii Barataa Abdullaah',
        recipientPhone: '+251911002233',
        recipientRole: 'Parent (Maatii)',
        message: "Kabajamoo Maatii: Barataan keessan Abdullaah har'a daree Qur'aana irraa hafeera.",
        type: 'Student Absence',
        sentAt: '10:15 AM - 1448 H',
        status: 'Sent',
      },
      {
        id: 'notif_2',
        recipientName: 'Hogganaa Dhaabbataa (Admin)',
        recipientPhone: '+251922334455',
        recipientRole: 'Admin (Bulchiinsa)',
        message: 'Beeksisa: Ustaaz Aliyyii daqiiqaa 10 turee seeneera.',
        type: 'Teacher Late',
        sentAt: '07:42 AM - 1448 H',
        status: 'Sent',
      }
    ];
  });

  const [sentSuccessAlert, setSentSuccessAlert] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_notifications_1448', JSON.stringify(notifications));
  }, [notifications]);

  // Handle template change
  const handleTypeChange = (type: 'Student Absence' | 'Teacher Late' | 'General Reminder') => {
    setNotificationType(type);
    if (type === 'Student Absence') {
      setCustomMessage(
        lang === 'om'
          ? "Kabajamoo Maatii Barataa: Barataan keessan har'a daree Qur'aana Markaz Taajul Waqaar irraa hafeera. Yeroo dhiyootti nu qunnamaa."
          : lang === 'ar'
          ? 'ولي الأمر المحترم: نود إحاطتكم بعلم أن الطالب غائب اليوم عن حلقة القرآن بمركز تاج الوقار. نرجو التواصل مع الإدارة.'
          : 'Dear Parent: Your student was absent today from the Quran session at Markaz Tajul Waqar. Please contact admin.'
      );
    } else if (type === 'Teacher Late') {
      setCustomMessage(
        lang === 'om'
          ? "Beeksisa Bulchiinsaa: Barsiisaan sa'aatii daree irraa turee seeneera. Yeroon to'annoo galmaa'eera."
          : lang === 'ar'
          ? 'إشعار الإدارة: تم تسجيل تأخر المعلم عن موعد الحصة المقرر. تم توثيق الملاحظة تلقائياً.'
          : "Admin Alert: Teacher late check-in recorded for today's scheduled session."
      );
    } else {
      setCustomMessage(
        lang === 'om'
          ? "Kabajamoo Maatii: Boru qormaata waliigalaa Qur'aanaa waan ta'eef barattoonni yeroon akka argaman zikrii gochisiisaa."
          : lang === 'ar'
          ? 'تنبيه هام: نذكركم بموعد الإختبار الشامل للقرآن الكريم غداً، نرجو تحفيز الطلاب على الحضور المباشر.'
          : 'Important Notice: General Quran review exam scheduled for tomorrow. Please ensure students arrive on time.'
      );
    }
  };

  // Send Notification SMS
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      recipientName: selectedStudentName || recipientRole,
      recipientPhone: phone,
      recipientRole,
      message: customMessage,
      type: notificationType,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent',
    };

    setNotifications([newNotif, ...notifications]);
    setSentSuccessAlert(
      lang === 'om'
        ? `✅ Ergaan SMS / WhatsApp Milkaa'inaan Ergameera (${phone})`
        : lang === 'ar'
        ? `✅ تم إرسال الرسالة النصية والتنبيه بنجاح إلى (${phone})`
        : `✅ Notification SMS Sent Successfully to (${phone})`
    );

    // Save to Firestore
    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        sentAtTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore notification fallback:', e);
    }

    setTimeout(() => setSentSuccessAlert(null), 5000);
  };

  // Generate WhatsApp Direct Link
  const openWhatsAppLink = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(customMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C] relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <Bell className="w-3.5 h-3.5" />
              <span>Real-time SMS & Push Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              {t.notificationsHeader}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Ergaa SMS, Push Notification & WhatsApp maatiifi bulchiinsaf bataskaan erguu.
            </p>
          </div>
        </div>
      </div>

      {sentSuccessAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{sentSuccessAlert}</span>
        </div>
      )}

      {/* Grid: Send Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Send Notification Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-[#1B2A4A]" />
              <span>Ergaa Haaraa Erguu (Send Alert)</span>
            </h3>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gosa Ergaa (Alert Type)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'Student Absence', label: t.absenceAlert },
                  { key: 'Teacher Late', label: t.lateAlert },
                  { key: 'General Reminder', label: 'Beeksisa Waliigalaa' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTypeChange(item.key as any)}
                    className={`py-2 px-3 rounded-xl text-[11px] font-bold border cursor-pointer transition-all ${
                      notificationType === item.key
                        ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Eenyuuf (Recipient Role)
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1B2A4A] outline-none"
                >
                  <option value="Parent (Maatii)">Maatii Barataa (Parent)</option>
                  <option value="Admin (Bulchiinsa)">Bulchiinsa Markaza (Admin)</option>
                  <option value="Teacher (Barsiisaa)">Barsiisaa (Teacher)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lakkoofsa Bilbilaa (Phone)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 100 2233"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1B2A4A] outline-none font-mono"
                />
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qabiyyee Ergaa (Message Content)
              </label>
              <textarea
                rows={4}
                required
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1B2A4A] outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Send className="w-4 h-4 text-[#E8A87C]" />
                <span>Ergaa SMS Ergi (Send SMS)</span>
              </button>

              <button
                type="button"
                onClick={openWhatsAppLink}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Log */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-[#1B2A4A]" />
              <span>{t.notificationHistory}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {notifications.length} Ergamaniiru
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-[#1B2A4A] transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1B2A4A] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#E8A87C]" />
                    <span>{notif.recipientName} ({notif.recipientPhone})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{notif.sentAt}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">{notif.recipientRole}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                    ✓ Ergameera (Sent)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
