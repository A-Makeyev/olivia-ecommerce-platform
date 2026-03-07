import React from 'react';

const AccountsIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="accountsGradient" x1="4" y1="4" x2="20" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0085FF" />
          <stop offset="1" stopColor="#35CFFF" />
        </linearGradient>
      </defs>

      <rect 
        x="2" 
        y="4" 
        width="20" 
        height="12" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      
      <path 
        d="M20 7H4" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.3" 
      />

      <path 
        d="M6 13L9 10L12 12L18 6" 
        stroke="url(#accountsGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      <circle cx="18" cy="6" r="1.5" fill="url(#accountsGradient)" />

      <path 
        d="M9 20H15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M12 16V20" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      
      <rect x="5" y="9" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
      <rect x="14" y="11" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
};

export default AccountsIcon;
