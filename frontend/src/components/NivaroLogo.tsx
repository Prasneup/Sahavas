import React from 'react';

interface NivaroLogoProps {
  className?: string;
  size?: number | string;
}

export const NivaroLogo: React.FC<NivaroLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 512 512" 
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized Pagoda/N path */}
      <path 
        d="M 120 260 Q 145 255 160 250 L 160 410 M 160 250 L 230 180 L 352 410 L 352 250 Q 367 255 392 260" 
        stroke="currentColor" 
        strokeWidth="40" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Marigold orange accent dot at peak */}
      <circle cx="230" cy="125" r="24" fill="#F59E0B" />
    </svg>
  );
};
