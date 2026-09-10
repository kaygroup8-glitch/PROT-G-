import React from 'react';

interface StudentZeroMarkProps {
  className?: string;
  size?: number;
  highlight?: boolean;
}

/**
 * Signature Apple-grade emblem for STUDENT ZERO.
 * "The Zero Aperture": An intelligent unformed mind awaiting human teaching.
 * Featuring precision geometric nested rings, dual optical arcs, and an illuminated central focal pupil.
 */
export const StudentZeroMark: React.FC<StudentZeroMarkProps> = ({
  className = '',
  size = 32,
  highlight = true,
}) => {
  const uniqueId = React.useId().replace(/:/g, '_');
  const gradientId = `sz_grad_${uniqueId}`;
  const causticId = `sz_caustic_${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Student Zero emblem"
    >
      <defs>
        {/* Apple Intelligence inspired iridescent caustic gradient */}
        <linearGradient id={gradientId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2997FF" />
          <stop offset="50%" stopColor="#A259FF" />
          <stop offset="100%" stopColor="#F56565" />
        </linearGradient>

        <radialGradient id={causticId} cx="20" cy="20" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2997FF" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#A259FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle background caustic aura */}
      {highlight && (
        <circle cx="20" cy="20" r="16" fill={`url(#${causticId})`} />
      )}

      {/* Outer Precision Zero Loop */}
      <rect
        x="6"
        y="4"
        width="28"
        height="32"
        rx="14"
        stroke={highlight ? `url(#${gradientId})` : '#6E6E73'}
        strokeWidth="2"
        strokeOpacity={highlight ? '0.9' : '0.4'}
      />

      {/* Inner Concentric Aperture */}
      <rect
        x="13"
        y="11"
        width="14"
        height="18"
        rx="7"
        stroke={highlight ? '#F5F5F7' : '#86868B'}
        strokeWidth="1.5"
        strokeOpacity={highlight ? '0.85' : '0.5'}
        strokeDasharray="18 4"
      />

      {/* Central Neural Pupil / Core Point */}
      <circle
        cx="20"
        cy="20"
        r="3"
        fill={highlight ? '#2997FF' : '#F5F5F7'}
        className={highlight ? 'animate-pulse' : ''}
      />
    </svg>
  );
};
