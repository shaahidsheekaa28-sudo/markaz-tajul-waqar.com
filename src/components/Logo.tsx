import React, { useState } from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
  '3xl': 'w-36 h-36',
  '4xl': 'w-44 h-44',
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const dimensionClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden transition-transform duration-200 select-none ${dimensionClass} ${
        showBorder ? 'ring-2 ring-[#E8A87C]/80 shadow-md' : ''
      } ${className}`}
    >
      <img
        src={hasError ? '/icon.svg' : '/logo.png'}
        alt="مركز تاج الوقار لعلوم القرآن والآثار"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  );
};
