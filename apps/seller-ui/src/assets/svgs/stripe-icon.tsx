import React from 'react';


interface StripeBadgeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  rounded?: number;
}

const StripeBadge: React.FC<StripeBadgeProps> = ({ 
  size = 20, 
  rounded = 5, 
  ...props 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="40" height="40" rx={rounded} fill="#635BFF" />
    <path 
      d="M23.11 16.51c-1.81-.67-2.8-1.19-2.8-2 0-.69.57-1.09 1.58-1.09 1.86 0 3.76.72 5.08 1.36l.74-4.58C26.67 9.61 24.54 8.8 21.6 8.8c-2.08 0-3.81.54-5.05 1.56-1.29 1.06-1.96 2.6-1.96 4.45 0 3.37 2.06 4.8 5.4 6.02 2.15.77 2.87 1.31 2.87 2.15 0 .82-.7 1.29-1.96 1.29-1.56 0-4.14-.77-5.83-1.76l-.75 4.63c1.64.91 4.31 1.83 7.08 1.83 2.2 0 4.04-.52 5.27-1.51 1.39-1.09 2.1-2.7 2.1-4.78 0-3.44-2.1-4.88-5.46-6.09h.01z" 
      fill="white"
    />
  </svg>
);

export default StripeBadge;
