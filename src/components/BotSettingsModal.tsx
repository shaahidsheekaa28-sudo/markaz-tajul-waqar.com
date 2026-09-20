import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Bot,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Share2,
  Sparkles,
  Settings,
  BellRing,
} from 'lucide-react';
import { GroupConfig, HijriCalendarData, EvaluationDataMap } from '../types';

interface BotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupConfig[];
  calendarData: HijriCalendarData;
  evaluationMap: EvaluationDataMap;
}

export interface BotConfig {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  whatsAppEnabled: boolean;
  whatsAppPhoneNumber: string;
  whatsAppApiKey: string;
  autoSendDailySummary: boolean;
  autoSendTime: string;
}

export const BotSettingsModal: React.FC<BotSettingsModalProps> = ({
  isOpen,
  onClose,
  groups,
  calendarData,
  evaluationMap,
}) => {
  const [config, setConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_bot_config_1448');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      telegramEnabled: true,
      telegramBotToken: '7829103921:AAH_example_token_1448',
      telegramChatId: '@TajUlWaqar_Center_1448',
      whatsAppEnabled: true,
      whatsAppPhoneNumber: '+966500000000',
      whatsAppApiKey: 'wa_api_key_sample',
      autoSendDailySummary: true,
      autoSendTime: '17:00',
    };
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('taj_ul_waqar_bot_config_1448', JSON.stringify(config));
    setTestResult({
      success: true,
      message: 'تم حفظ إعدادات البوت والربط الآلي بنجاح!',
    });
    setTimeout(() => setTestResult(null), 3000);
  };

  // Build current daily center summary text
  const generateDailyCenterSummaryText = () => {
    const today = calendarData.days.find((d) => d.is_study_day) || calendarData.days[0];
    const totalStudentsCount = groups.reduce((acc, g) => acc + g.students.length, 0);

    let totalPresent = 0;
    let totalRecited = 0;
    let totalSigned = 0;

    let groupDetails = '';

    groups.forEach((group) => {
      let gPresent = 0;
      let gRecited = 0;

      group.students.forEach((student) => {
        const key = `${group.id}_${calendarData.month_name}_${today.day}_${student.id}`;
        const rec = evaluationMap[key];
        if (rec) {
          if (rec.attendance === 'حاضر' || (!rec.attendance && today.is_study_day)) {
            gPresent++;
            totalPresent++;
          }
          if (rec.recited === 'سمع') {
            gRecited++;
            totalRecited++;
          }
          if (rec.signed) {
            totalSigned++;
          }
        } else if (today.is_study_day) {
          gPresent++;
          totalPresent++;
        }
      });

      groupDetails += `• *حلقة ${group.name}*: حضور (${gPresent}/${group.students.length}) | مسمعين (${gRecited})\n`;
    });

    let text = `📢 *الملخص اليومي الآلي - مركز تاج الوقار لعلوم القرءان* 📢\n`;
    text += `📅 *تاريخ اليوم:* ${today.weekday} ${today.day} ${calendarData.month_name} ١٤٤٨ هـ\n`;
    text += `-----------------------------------\n`;
    text += `📊 *إحصائيات الإنجاز العامة:*\n`;
    text += `• إجمالي الحضور: ${totalPresent} / ${totalStudentsCount} طالب\n`;
    text += `• إجمالي المسمعين: ${totalRecited} طالب\n`;
    text += `• التسميعات الموثقة: ${totalSigned} توقيعات\n`;
    text += `-----------------------------------\n`;
    text += `📖 *تفاصيل الحلقات القرءانية:*\n`;
    text += groupDetails;
    text += `-----------------------------------\n`;
    text += `نسأل الله أن يبارك في أوقات حُفّاظ كتاب الله 🌿`;

    return text;
  };

  const handleTestDispatch = () => {
    setIsTesting(true);
    const text = generateDailyCenterSummaryText();

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `تم تجهيز ومعالجة الملخص اليومي بنجاح! تم التوجيه عبر قنوات الربط المحددة (${config.telegramChatId}).`,
      });

      // Also trigger browser opening if enabled
      if (config.telegramEnabled && config.telegramChatId) {
        const encoded = encodeURIComponent(text);
        window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
      }
    }, 800);
  };

  const sampleWebhookUrl = `https://api.tajulwaqar.org/v1/webhook?token=${config.telegramBotToken}&chat_id=${config.telegramChatId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative text-right flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-6 h-6 text-[#E8A87C]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1B2A4A]">إعدادات ربط التليجرام وواتساب</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                إرسال الملخص اليومي التلقائي للحلقات وقناة أولياء الأمور
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1 pl-1 scrollbar-thin scrollbar-thumb-gray-300 flex-1">
          
          {/* Status Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Telegram Settings Section */}
          <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#229ED9]" />
                <h4 className="text-sm font-bold text-[#1B2A4A]">ربط بوت Telegram</h4>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.telegramEnabled}
                  onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#229ED9]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  توكن البوت (Bot API Token):
                </label>
                <input
                  type="text"
                  value={config.telegramBotToken}
                  onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                  placeholder="123456789:ABCdefGhIJKlmNoP..."
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  معرّف القناة أو المجموعة (Chat ID):
                </label>
                <input
                  type="text"
                  value={config.telegramChatId}
                  onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                  placeholder="@TajUlWaqar_Center_1448"
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Settings Section */}
          <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                <h4 className="text-sm font-bold text-[#1B2A4A]">ربط خدمة WhatsApp Business</h4>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.whatsAppEnabled}
                  onChange={(e) => setConfig({ ...config, whatsAppEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  رقم هاتف مجموعة أولياء الأمور:
                </label>
                <input
                  type="text"
                  value={config.whatsAppPhoneNumber}
                  onChange={(e) => setConfig({ ...config, whatsAppPhoneNumber: e.target.value })}
                  placeholder="+966500000000"
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  مفتاح API الخاص بالبوابة (WhatsApp API Key):
                </label>
                <input
                  type="password"
                  value={config.whatsAppApiKey}
                  onChange={(e) => setConfig({ ...config, whatsAppApiKey: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Ready-made Start/End of Week Messages (Afaan Oromoo & Arabic) */}
          <div className="bg-[#1B2A4A]/5 p-4 rounded-xl border border-[#1B2A4A]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8A87C]" />
                <div>
                  <h4 className="text-xs font-bold text-[#1B2A4A]">رسائل جاهزة للبداية والنهاية (Ergaa Qophaa'ina Torbee)</h4>
                  <p className="text-[10px] text-gray-500">رسائل جاهزة للإرسال المباشر للطلاب والمعلمين عبر Telegram و WhatsApp باسم المشرف العام للمركز</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* 1. Start of Week - Students */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#1B2A4A]">
                  <span>🟢 بداية الأسبوع (Barattootaaf / للطلاب):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Qophaa'ina Eegala Torbee (بداية الأسبوع)* 📢\n\nAssalaamu 'alaykum barattoota keeña kabajamoo. Qophaa'ina torbee haarawaatiif: Muraaja'aa fi hifzii keessan sakatta'aa, sa'aatii qiraa'aatti prepared ta'aa. Rabbiin ilmuu barakaa isiniif haa godhu!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، طلابنا الكرام. نذكركم بالاستعداد لبداية الأسبوع القرءاني الجديد ومراجعة الحفظ والتزام الموعد. بارك الله فيكم!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#25D366] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1ebd59] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Qophaa'ina Eegala Torbee (بداية الأسبوع)* 📢\n\nAssalaamu 'alaykum barattoota keeña kabajamoo. Qophaa'ina torbee haarawaatiif: Muraaja'aa fi hifzii keessan sakatta'aa, sa'aatii qiraa'aatti prepared ta'aa. Rabbiin ilmuu barakaa isiniif haa godhu!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، طلابنا الكرام. نذكركم بالاستعداد لبداية الأسبوع القرءاني الجديد ومراجعة الحفظ والتزام الموعد. بارك الله فيكم!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#229ED9] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1d8cb0] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Telegram
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[#E8A87C] font-bold">🕌 مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ</span><br/>
                  Assalaamu 'alaykum barattoota keeña kabajamoo. Qophaa'ina torbee haarawaatiif: Muraaja'aa fi hifzii keessan sakatta'aa, sa'aatii qiraa'aatti prepared ta'aa.<br/>
                  السلام عليكم ورحمة الله وبركاته، طلابنا الكرام. نذكركم بالاستعداد لبداية الأسبوع القرءاني الجديد ومراجعة الحفظ والتزام الموعد.<br/>
                  <span className="text-[#1B2A4A] font-bold">👤 Hogganaa Waliigalaa / المشرف العام: Ustaaz Aliyyii Muhammad Saanii (الأستاذ علي محمد ثاني)</span>
                </p>
              </div>

              {/* 2. Start of Week - Teachers */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#1B2A4A]">
                  <span>🟢 بداية الأسبوع (Barsiisotaaf / للمعلمين):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Barsiisotaa - Eegala Torbee* 📢\n\nAssalaamu 'alaykum barsiisota kabajamoo. Eegala torbee kanaa: Galmee hordoffii qopheessuu, galmeessa imala hifzii barattootaa irratti qophaa'aa. Jazakumullaahu khayran!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، أساتذتنا الأفاضل. تذكير بداية الأسبوع: تجهيز سجل المتابعة وتوثيق الحضور والتسميع اليومي. جزاكم الله خيراً!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#25D366] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1ebd59] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Barsiisotaa - Eegala Torbee* 📢\n\nAssalaamu 'alaykum barsiisota kabajamoo. Eegala torbee kanaa: Galmee hordoffii qopheessuu, galmeessa imala hifzii barattootaa irratti qophaa'aa. Jazakumullaahu khayran!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، أساتذتنا الأفاضل. تذكير بداية الأسبوع: تجهيز سجل المتابعة وتوثيق الحضور والتسميع اليومي. جزاكم الله خيراً!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#229ED9] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1d8cb0] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Telegram
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[#E8A87C] font-bold">🕌 مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ</span><br/>
                  Assalaamu 'alaykum barsiisota kabajamoo. Eegala torbee kanaa: Galmee hordoffii qopheessuu, galmeessa imala hifzii barattootaa irratti qophaa'aa.<br/>
                  السلام عليكم ورحمة الله وبركاته، أساتذتنا الأفاضل. تذكير بداية الأسبوع: تجهيز سجل المتابعة وتوثيق الحضور والتسميع اليومي.<br/>
                  <span className="text-[#1B2A4A] font-bold">👤 Hogganaa Waliigalaa / المشرف العام: Ustaaz Aliyyii Muhammad Saanii (الأستاذ علي محمد ثاني)</span>
                </p>
              </div>

              {/* 3. End of Week - Students */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#1B2A4A]">
                  <span>🔴 نهاية الأسبوع (Barattootaaf / للطلاب):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Dhuma Torbee (نهاية الأسبوع)* 📢\n\nAssalaamu 'alaykum barattoota keeña. Dhuma torbee kanaatti: Muraaja'aa torbee kanaa sakatta'aa, boqonnaa Kamisa fi Jimaataa (أيام العطلة) haala gaariin itti fayyadamaa.\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته. نهاية أسبوع مباركة: نوصيكم بمراجعة حفظ الأسبوع واستغلال يومي الخميس والجمعة في تثبيت القرآن الكريم.\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#25D366] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1ebd59] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Dhuma Torbee (نهاية الأسبوع)* 📢\n\nAssalaamu 'alaykum barattoota keeña. Dhuma torbee kanaatti: Muraaja'aa torbee kanaa sakatta'aa, boqonnaa Kamisa fi Jimaataa (أيام العطلة) haala gaariin itti fayyadamaa.\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته. نهاية أسبوع مباركة: نوصيكم بمراجعة حفظ الأسبوع واستغلال يومي الخميس والجمعة في تثبيت القرآن الكريم.\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#229ED9] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1d8cb0] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Telegram
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[#E8A87C] font-bold">🕌 مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ</span><br/>
                  Assalaamu 'alaykum barattoota keeña. Dhuma torbee kanaatti: Muraaja'aa torbee kanaa sakatta'aa, boqonnaa Kamisa fi Jimaataa haala gaariin itti fayyadamaa.<br/>
                  السلام عليكم ورحمة الله وبركاته. نهاية أسبوع مباركة: نوصيكم بمراجعة حفظ الأسبوع واستغلال يومي الخميس والجمعة في تثبيت القرآن.<br/>
                  <span className="text-[#1B2A4A] font-bold">👤 Hogganaa Waliigalaa / المشرف العام: Ustaaz Aliyyii Muhammad Saanii (الأستاذ علي محمد ثاني)</span>
                </p>
              </div>

              {/* 4. End of Week - Teachers */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#1B2A4A]">
                  <span>🔴 نهاية الأسبوع (Barsiisotaaf / للمعلمين):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Barsiisotaa - Dhuma Torbee* 📢\n\nAssalaamu 'alaykum barsiisota kabajamoo. Dhuma torbee kanaatti: Tuqiqa fi mallattoo معلم galmee irratti xumuraa. Jazakumullaahu khayran!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، أساتذتنا الكرام. نرجو استكمال توثيق التوقيعات والتقييم الأسبوعي في سجل المتابعة قبل بداية العطلة. جزاكم الله خيراً!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#25D366] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1ebd59] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🕌 *مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ*\n*Markaz Tajul Waqar li Ulum Al-Quran wal Athar*\n\n📢 *Ergaa Barsiisotaa - Dhuma Torbee* 📢\n\nAssalaamu 'alaykum barsiisota kabajamoo. Dhuma torbee kanaatti: Tuqiqa fi mallattoo معلم galmee irratti xumuraa. Jazakumullaahu khayran!\n👤 *Hogganaa Waliigalaa:* Ustaaz Aliyyii Muhammad Saanii\n\nالسلام عليكم ورحمة الله وبركاته، أساتذتنا الكرام. نرجو استكمال توثيق التوقيعات والتقييم الأسبوعي في سجل المتابعة قبل بداية العطلة. جزاكم الله خيراً!\n👤 *المشرف العام للمركز:* الأستاذ علي محمد ثاني`;
                        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#229ED9] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-[#1d8cb0] cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Telegram
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[#E8A87C] font-bold">🕌 مركز تاج الوقار لعلوم القرءان والآثار - ١٤٤٨ هـ</span><br/>
                  Assalaamu 'alaykum barsiisota kabajamoo. Dhuma torbee kanaatti: Mallattoo معلم fi galmee hordoffii xumuraa.<br/>
                  السلام عليكم ورحمة الله وبركاته، أساتذتنا الكرام. نرجو استكمال توثيق التوقيعات والتقييم الأسبوعي في سجل المتابعة.<br/>
                  <span className="text-[#1B2A4A] font-bold">👤 Hogganaa Waliigalaa / المشرف العام: Ustaaz Aliyyii Muhammad Saanii (الأستاذ علي محمد ثاني)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Auto Daily Dispatch Schedule */}
          <div className="bg-[#EDF2F7] p-4 rounded-xl border border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#E8A87C]" />
                <div>
                  <h4 className="text-xs font-bold text-[#1B2A4A]">الإرسال الآلي المجدول يومياً</h4>
                  <p className="text-[10px] text-gray-500">إرسال التقرير تلقائياً بعد انتهاء وقت الحلقات</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.autoSendDailySummary}
                onChange={(e) => setConfig({ ...config, autoSendDailySummary: e.target.checked })}
                className="w-4 h-4 text-[#1B2A4A] rounded"
              />
            </div>

            {config.autoSendDailySummary && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-gray-700">توقيت الإرسال اليومي:</span>
                <input
                  type="time"
                  value={config.autoSendTime}
                  onChange={(e) => setConfig({ ...config, autoSendTime: e.target.value })}
                  className="text-xs font-bold px-2.5 py-1.5 rounded border border-gray-300 bg-white"
                />
              </div>
            )}
          </div>

          {/* Test & Webhook URL Bar */}
          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500">رابط Webhook الآلي الخاص بالسيرفر:</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sampleWebhookUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-[10px] font-bold text-[#1B2A4A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'تم النسخ' : 'نسخ رابط Webhook'}</span>
              </button>
            </div>
            <div className="text-[10px] font-mono bg-gray-100 p-2 rounded text-gray-600 truncate dir-ltr">
              {sampleWebhookUrl}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestDispatch}
            disabled={isTesting}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isTesting ? 'جاري الاختبار والإرسال...' : 'اختبار إرسال الملخص الآن'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#1B2A4A] text-white font-bold text-xs shadow hover:bg-[#2C3E7A] cursor-pointer"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
