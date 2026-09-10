import React from 'react';

interface ProtegeMarkProps {
  size?: number;
  highlight?: boolean;
}

export const ProtegeMark: React.FC<ProtegeMarkProps> = ({ size = 28, highlight = false }) => {
  return (
    <div
      className="relative flex items-center justify-center rounded-xl transition-transform"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tactile Paper Stamped Badge Background */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill={highlight ? '#58CC02' : '#FFFFFF'}
          stroke={highlight ? '#46A302' : '#E5DFD3'}
          strokeWidth="2.5"
        />
        {/* Subtle inner paper stitch line */}
        <rect
          x="5"
          y="5"
          width="30"
          height="30"
          rx="7"
          fill="none"
          stroke={highlight ? '#46A302' : '#F0ECE1'}
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        {/* Open book / paper fold symbol */}
        <path
          d="M12 15C14.5 14 17.5 14.5 20 16C22.5 14.5 25.5 14 28 15V27C25.5 26 22.5 26.5 20 28C17.5 26.5 14.5 26 12 27V15Z"
          fill={highlight ? '#FFFFFF' : '#FAF7F0'}
          stroke={highlight ? '#FFFFFF' : '#1E1B18'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Center spine */}
        <line
          x1="20"
          y1="16"
          x2="20"
          y2="28"
          stroke={highlight ? '#58CC02' : '#1E1B18'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Little ink pen nib pointing down */}
        <polygon
          points="20,9 18,13 22,13"
          fill={highlight ? '#FFFFFF' : '#FF9600'}
        />
      </svg>
    </div>
  );
};
