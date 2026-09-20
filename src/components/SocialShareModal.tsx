import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareText: string;
  subtitle?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  shareText,
  subtitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTelegramShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative text-right flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold shadow-sm">
              <Share2 className="w-5 h-5 text-[#E8A87C]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-4 space-y-4 overflow-y-auto flex-1 pr-1 pl-1">
          <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-gray-300 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto select-all">
            {shareText}
          </div>

          {/* Social Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={handleTelegramShare}
              className="flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1d8cb0] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر Telegram</span>
            </button>

            {/* Copy Clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer col-span-2 sm:col-span-1"
            >
              {copied ? <Check className="w-4 h-4 text-[#27AE60]" /> : <Copy className="w-4 h-4 text-[#E8A87C]" />}
              <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ التقرير'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
