import React, { useMemo } from 'react';

interface AliveOrbProps {
  state?: 'idle' | 'listening' | 'assimilating' | 'speaking';
  volume?: number; // 0 to 1
  size?: number;
  className?: string;
}

/**
 * ChatGPT-Style Voice Mode Orb:
 * Sleek, minimalist, fluid organic ripples with concentric breathing waves.
 * Clean, tactile, and responsive to voice volume and speech states without messy glowing background dots.
 */
export const AliveOrb: React.FC<AliveOrbProps> = ({
  state = 'idle',
  volume = 0,
  size = 140,
  className = '',
}) => {
  // Fluid scale based on volume and state
  const reactiveScale = useMemo(() => {
    if (state === 'listening') {
      return 1 + Math.min(0.28, volume * 0.45);
    }
    if (state === 'speaking') {
      return 1.08;
    }
    if (state === 'assimilating') {
      return 1.04;
    }
    return 1;
  }, [state, volume]);

  const waveOffset = Math.min(18, Math.round(volume * 24));

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-label={`Protégé voice state: ${state}`}
    >
      {/* Outer subtle concentric fluid wave 1 */}
      <div
        className="absolute inset-[-14%] rounded-full border border-[#1E1B18]/15 transition-all duration-300 pointer-events-none"
        style={{
          transform: `scale(${reactiveScale * (state === 'speaking' ? 1.06 : 1.02)})`,
          opacity: state === 'listening' ? 0.4 + volume * 0.5 : state === 'speaking' ? 0.6 : 0.25,
          borderColor: state === 'speaking' ? '#58CC02' : state === 'listening' ? '#1CB0F6' : '#1E1B18',
        }}
      />

      {/* Outer subtle concentric fluid wave 2 */}
      <div
        className="absolute inset-[-6%] rounded-full border border-[#1E1B18]/10 transition-all duration-200 pointer-events-none"
        style={{
          transform: `scale(${reactiveScale * (state === 'listening' ? 1.04 : 1)})`,
          opacity: state === 'listening' ? 0.5 + volume * 0.4 : 0.3,
        }}
      />

      {/* Main Core Orb Sphere (ChatGPT Voice Mode Aesthetic) */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-150 ease-out shadow-md"
        style={{
          transform: `scale(${reactiveScale})`,
          background: '#1A1816', // Deep carbon ink paper feel
          border: '3px solid #FAF7F0',
          boxShadow: '0 8px 24px -4px rgba(30, 27, 24, 0.18)',
        }}
      >
        {/* SVG Fluid Organic Concentric Rings Inside the Orb */}
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full ${state === 'assimilating' ? 'animate-spin' : ''}`}
          style={{
            animationDuration: state === 'assimilating' ? '6s' : '12s',
          }}
        >
          <defs>
            <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={state === 'speaking' ? '#58CC02' : state === 'listening' ? '#1CB0F6' : '#FAF7F0'} stopOpacity="0.85" />
              <stop offset="100%" stopColor={state === 'speaking' ? '#22C55E' : state === 'listening' ? '#0284C7' : '#D5CDBC'} stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Core organic wave ring 1 */}
          <circle
            cx="50"
            cy="50"
            r={24 + waveOffset * 0.5}
            fill="none"
            stroke="url(#orbGrad)"
            strokeWidth="2.5"
            className="transition-all duration-200"
            opacity={0.8}
          />

          {/* Core organic wave ring 2 */}
          <circle
            cx="50"
            cy="50"
            r={34 + waveOffset * 0.7}
            fill="none"
            stroke="url(#orbGrad)"
            strokeWidth="1.8"
            strokeDasharray={state === 'speaking' ? '4 2' : 'none'}
            className="transition-all duration-200"
            opacity={0.6}
          />

          {/* Core organic wave ring 3 */}
          <circle
            cx="50"
            cy="50"
            r={42 + waveOffset * 0.4}
            fill="none"
            stroke="url(#orbGrad)"
            strokeWidth="1.2"
            className="transition-all duration-300"
            opacity={0.4}
          />

          {/* Center pupil dot */}
          <circle
            cx="50"
            cy="50"
            r={state === 'listening' ? 6 + volume * 8 : state === 'speaking' ? 8 : 5}
            fill={state === 'speaking' ? '#58CC02' : state === 'listening' ? '#1CB0F6' : '#FAF7F0'}
            className="transition-all duration-100"
          />
        </svg>
      </div>

      {/* Bottom State Pill Indicator */}
      <div className="absolute -bottom-7 flex items-center justify-center">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white border border-[#E5DFD3] text-[#7D766C] shadow-xs">
          {state === 'idle' && 'Ready to Listen'}
          {state === 'listening' && 'Listening to you...'}
          {state === 'assimilating' && 'Thinking...'}
          {state === 'speaking' && 'Speaking...'}
        </span>
      </div>
    </div>
  );
};
