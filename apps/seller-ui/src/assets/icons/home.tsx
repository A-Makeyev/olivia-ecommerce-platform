import React from 'react';

const HomeIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="homeGradient" x1="9" y1="14" x2="15" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0085FF" />
          <stop offset="1" stopColor="#35CFFF" />
        </linearGradient>
      </defs>

      <path 
        d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      <path 
        d="M9 21V14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14V21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      <path 
        d="M9 21V14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14V21H9Z" 
        fill="url(#homeGradient)" 
        fillOpacity="0.2"
      />
      
      <circle cx="12" cy="7.5" r="1" fill="url(#homeGradient)" />
    </svg>
  );
};

export default HomeIcon;
