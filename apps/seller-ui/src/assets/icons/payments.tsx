import React from 'react';

const PaymentsIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="paymentGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0085FF" />
          <stop offset="1" stopColor="#35CFFF" />
        </linearGradient>
      </defs>

      <rect 
        x="2" 
        y="5" 
        width="20" 
        height="14" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      
      <path 
        d="M2 9H22" 
        stroke="currentColor" 
        strokeWidth="2" 
      />

      <rect 
        x="5" 
        y="13" 
        width="4" 
        height="3" 
        rx="0.5" 
        fill="url(#paymentGradient)" 
      />

      <path 
        d="M12 14.5H18" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.5"
      />
      <path 
        d="M12 16.5H16" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.5"
      />
    </svg>
  );
};

export default PaymentsIcon;
