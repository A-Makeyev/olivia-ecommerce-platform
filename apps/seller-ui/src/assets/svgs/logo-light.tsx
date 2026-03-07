import React from 'react';

const LogoLight = ({ className = "w-10 h-10", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="arrowGradient" x1="26" y1="64" x2="85" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0085FF" />
          <stop offset="1" stopColor="#35CFFF" />
        </linearGradient>
      </defs>

      <path 
        d="M10 25H18.5 L25 62 H72 L78 25 H40" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      <circle cx="33" cy="78" r="6" fill="currentColor" />
      <circle cx="64" cy="78" r="6" fill="currentColor" />
      
      <g>
        <path 
          d="M26 62 L45 35 L58 48 L88 15" 
          stroke="url(#arrowGradient)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M72 15 H88 V31 L88 15 Z" 
          fill="url(#arrowGradient)" 
          stroke="url(#arrowGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      <path 
        d="M48 45H68L72 32H54Z" 
        fill="url(#arrowGradient)" 
        fillOpacity="0.1" 
      />
    </svg>
  );
};

export default LogoLight;
