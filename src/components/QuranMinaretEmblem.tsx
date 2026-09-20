import React from 'react';

interface QuranMinaretEmblemProps {
  className?: string;
  size?: number;
}

export const QuranMinaretEmblem: React.FC<QuranMinaretEmblemProps> = ({
  className = '',
  size = 130,
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Gold Gradient Palette */}
          <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E498" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7A1E" />
          </linearGradient>

          <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#A47014" />
            <stop offset="100%" stopColor="#6C4605" />
          </linearGradient>

          <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F7F4EA" />
            <stop offset="100%" stopColor="#EDE6D1" />
          </linearGradient>

          <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#966A20" />
            <stop offset="50%" stopColor="#6E4A0C" />
            <stop offset="100%" stopColor="#4A3105" />
          </linearGradient>

          <linearGradient id="rehalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B37D28" />
            <stop offset="50%" stopColor="#8C5C13" />
            <stop offset="100%" stopColor="#5D3A08" />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= BACKGROUND MINARET ================= */}
        <g id="minaret" transform="translate(100, 10)">
          {/* Crescent Finial */}
          <path
            d="M20 18 A 5 5 0 1 1 20 28 A 6 6 0 1 0 20 18 Z"
            fill="url(#goldLight)"
            filter="url(#softGlow)"
          />
          {/* Spire Pin */}
          <line x1="20" y1="28" x2="20" y2="34" stroke="url(#goldLight)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="34" r="2.5" fill="url(#goldLight)" />

          {/* Minaret Dome / Cupola */}
          <path
            d="M13 52 C 13 40, 20 34, 20 34 C 20 34, 27 40, 27 52 Z"
            fill="url(#goldLight)"
            stroke="url(#goldDark)"
            strokeWidth="1"
          />

          {/* Upper Balcony / Gallery */}
          <rect x="10" y="52" width="20" height="4" rx="1.5" fill="url(#goldDark)" />
          {/* Railing lines */}
          <line x1="12" y1="50" x2="28" y2="50" stroke="url(#goldLight)" strokeWidth="1.5" />
          <line x1="14" y1="50" x2="14" y2="52" stroke="url(#goldDark)" strokeWidth="1" />
          <line x1="20" y1="50" x2="20" y2="52" stroke="url(#goldDark)" strokeWidth="1" />
          <line x1="26" y1="50" x2="26" y2="52" stroke="url(#goldDark)" strokeWidth="1" />

          {/* Minaret Upper Shaft */}
          <rect x="13" y="56" width="14" height="24" fill="url(#goldLight)" stroke="url(#goldDark)" strokeWidth="1" />
          {/* Arched Window in Shaft */}
          <path d="M17 68 C 17 64, 23 64, 23 68 L 23 74 L 17 74 Z" fill="#6C4605" />

          {/* Lower Balcony */}
          <rect x="9" y="80" width="22" height="5" rx="2" fill="url(#goldDark)" />
          {/* Minaret Main Shaft */}
          <path d="M12 85 L 11 140 L 29 140 L 28 85 Z" fill="url(#goldLight)" stroke="url(#goldDark)" strokeWidth="1" />
          {/* Slender Arched Windows */}
          <path d="M18 95 C 18 92, 22 92, 22 95 L 22 104 L 18 104 Z" fill="#6C4605" />
          <path d="M18 114 C 18 111, 22 111, 22 114 L 22 123 L 18 123 Z" fill="#6C4605" />
        </g>

        {/* ================= REHAL (WOODEN BOOKSTAND) ================= */}
        <g id="rehal" transform="translate(0, 5)">
          {/* Left Leg Back */}
          <path
            d="M 60 135 L 95 168 L 90 178 L 50 145 Z"
            fill="url(#rehalGrad)"
            stroke="#4A3105"
            strokeWidth="1"
          />
          {/* Right Leg Back */}
          <path
            d="M 140 135 L 105 168 L 110 178 L 150 145 Z"
            fill="url(#rehalGrad)"
            stroke="#4A3105"
            strokeWidth="1"
          />
          {/* Main X Crossing Front Plate */}
          <path
            d="M 52 144 L 148 144 L 140 156 L 60 156 Z"
            fill="url(#coverGrad)"
            stroke="#382103"
            strokeWidth="1"
          />
          {/* Rehal Base Foot Trim */}
          <path
            d="M 75 160 L 100 176 L 125 160 L 118 152 L 100 164 L 82 152 Z"
            fill="url(#goldDark)"
          />
        </g>

        {/* ================= OPEN HOLY QURAN ================= */}
        <g id="quran" transform="translate(0, 5)">
          {/* Quran Leather Cover (Back Border) */}
          <path
            d="M 42 120 L 98 140 L 158 120 L 154 78 L 98 94 L 46 78 Z"
            fill="url(#coverGrad)"
            stroke="#2B1A02"
            strokeWidth="2"
          />
          {/* Gilded Book Edges */}
          <path
            d="M 44 118 L 98 137 L 156 118 L 154 113 L 98 132 L 46 113 Z"
            fill="url(#goldLight)"
            stroke="url(#goldDark)"
            strokeWidth="0.8"
          />

          {/* Book Spine Center Crest */}
          <path
            d="M 98 94 L 102 94 L 102 138 L 98 138 Z"
            fill="url(#goldDark)"
          />

          {/* Left Page Leaf */}
          <path
            d="M 46 80 C 65 74, 88 88, 98 95 L 98 135 C 88 128, 65 114, 44 120 Z"
            fill="url(#pageGrad)"
            stroke="#D8CFBC"
            strokeWidth="1.2"
          />

          {/* Right Page Leaf */}
          <path
            d="M 154 80 C 135 74, 112 88, 102 95 L 102 135 C 112 128, 135 114, 156 120 Z"
            fill="url(#pageGrad)"
            stroke="#D8CFBC"
            strokeWidth="1.2"
          />

          {/* Page Text & Decorative Calligraphy Lines (Left Page) */}
          {/* Surah Header Cartouche */}
          <rect
            x="54"
            y="87"
            width="36"
            height="7"
            rx="2"
            fill="none"
            stroke="url(#goldLight)"
            strokeWidth="1.2"
          />
          <line x1="57" y1="90.5" x2="87" y2="90.5" stroke="url(#goldDark)" strokeWidth="1.5" strokeDasharray="2 1" />

          {/* Ayah Lines */}
          <line x1="52" y1="99" x2="92" y2="103" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="51" y1="105" x2="91" y2="109" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="50" y1="111" x2="89" y2="115" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="49" y1="117" x2="85" y2="120" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />

          {/* Page Text & Decorative Calligraphy Lines (Right Page) */}
          {/* Surah Header Cartouche */}
          <rect
            x="110"
            y="87"
            width="36"
            height="7"
            rx="2"
            fill="none"
            stroke="url(#goldLight)"
            strokeWidth="1.2"
          />
          <line x1="113" y1="90.5" x2="143" y2="90.5" stroke="url(#goldDark)" strokeWidth="1.5" strokeDasharray="2 1" />

          {/* Ayah Lines */}
          <line x1="108" y1="103" x2="148" y2="99" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="109" y1="109" x2="149" y2="105" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="111" y1="115" x2="150" y2="111" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="115" y1="120" x2="151" y2="117" stroke="#8C7A58" strokeWidth="1.2" strokeLinecap="round" />

          {/* Bookmark Ribbon Hanging Down */}
          <path
            d="M 100 134 Q 97 148, 92 156 L 96 156 Q 101 148, 102 134 Z"
            fill="url(#goldLight)"
          />
          <path
            d="M 92 156 L 87 165 L 93 162 L 98 165 L 96 156 Z"
            fill="url(#goldDark)"
          />
        </g>
      </svg>
    </div>
  );
};
