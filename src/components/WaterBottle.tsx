import React from 'react';
import { formatWater } from '../utils';

interface Props {
  current: number;
  goal: number;
  unit: 'ml' | 'oz';
}

export const WaterBottle: React.FC<Props> = ({ current, goal, unit }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  
  // Pink to pale yellow gradient
  const waterColorStart = "#F39EB6";
  const waterColorEnd = "#FFE4EF";

  return (
    <div className="relative w-full max-w-[280px] mx-auto flex flex-col items-center group">
      
      {/* Percentage Text with Glow */}
      <div className="absolute -top-10 flex flex-col items-center">
        <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent drop-shadow-md">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="relative w-48 h-72 drop-shadow-2xl mt-4">
        {/* Glow Effect behind bottle */}
        <div 
          className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full transition-all duration-1000"
          style={{ transform: `scale(${0.8 + (percentage / 200)})` }}
        />

        <svg viewBox="0 0 200 300" className="w-full h-full relative z-10 overflow-visible">
          <defs>
            {/* Water Fill Gradient */}
            <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={waterColorStart} />
              <stop offset="100%" stopColor={waterColorEnd} />
            </linearGradient>
            
            {/* Bottle Glass Reflection Gradient */}
            <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="20%" stopColor="white" stopOpacity="0.1" />
              <stop offset="80%" stopColor="white" stopOpacity="0.0" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>

            <clipPath id="bottle-shape">
              <path d="M 60 20 
                       C 60 10, 140 10, 140 20 
                       L 140 40
                       C 140 60, 170 70, 170 120
                       L 170 260
                       C 170 290, 30 290, 30 260
                       L 30 120
                       C 30 70, 60 60, 60 40 
                       Z" />
            </clipPath>
          </defs>

          {/* Bottle Back/Background */}
          <path 
            d="M 60 20 C 60 10, 140 10, 140 20 L 140 40 C 140 60, 170 70, 170 120 L 170 260 C 170 290, 30 290, 30 260 L 30 120 C 30 70, 60 60, 60 40 Z" 
            fill="rgba(255, 255, 255, 0.1)" 
            stroke="rgba(255, 255, 255, 0.4)" 
            strokeWidth="2"
            className="dark:fill-slate-800/30 dark:stroke-slate-600/50"
          />

          {/* Masked Water Fill */}
          <g clipPath="url(#bottle-shape)">
            <g style={{ 
              transform: `translateY(${280 - (percentage * 2.6)}px)`, 
              transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}>
              
              {/* Animated Waves */}
              <path 
                className="animate-wave opacity-50"
                d="M -200 0 Q -150 -20, -100 0 T 0 0 T 100 0 T 200 0 T 300 0 T 400 0 L 400 400 L -200 400 Z"
                fill="url(#water-gradient)"
              />
              <path 
                className="animate-wave opacity-80"
                style={{ animationDelay: '-1.5s', animationDuration: '4s' }}
                d="M -200 0 Q -150 20, -100 0 T 0 0 T 100 0 T 200 0 T 300 0 T 400 0 L 400 400 L -200 400 Z"
                fill="url(#water-gradient)"
              />
              <path 
                className="animate-wave opacity-100"
                style={{ animationDelay: '-0.5s', animationDuration: '3.5s' }}
                d="M -200 5 Q -150 -10, -100 5 T 0 5 T 100 5 T 200 5 T 300 5 T 400 5 L 400 400 L -200 400 Z"
                fill="url(#water-gradient)"
              />

              {/* Animated Bubbles inside water */}
              {percentage > 5 && Array.from({ length: 8 }).map((_, i) => (
                <circle 
                  key={i}
                  cx={40 + Math.random() * 120} 
                  cy={100 + Math.random() * 100} 
                  r={2 + Math.random() * 4} 
                  fill="white" 
                  className="animate-bubble"
                  style={{ 
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </g>
          </g>

          {/* Bottle Front Glass Reflection */}
          <path 
            d="M 60 20 C 60 10, 140 10, 140 20 L 140 40 C 140 60, 170 70, 170 120 L 170 260 C 170 290, 30 290, 30 260 L 30 120 C 30 70, 60 60, 60 40 Z" 
            fill="url(#glass-reflection)" 
            className="pointer-events-none"
          />

          {/* Bottle Cap */}
          <path d="M 65 5 L 135 5 L 135 15 L 65 15 Z" fill="#E2E8F0" className="dark:fill-slate-600" />
          <path d="M 70 0 L 130 0 L 130 5 L 70 5 Z" fill="#CBD5E1" className="dark:fill-slate-500" />
        </svg>

      </div>

      {/* Stats Below */}
      <div className="mt-6 text-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm">
        <div className="font-bold text-slate-800 dark:text-white text-lg flex items-baseline justify-center gap-1">
          <span className="text-2xl text-brand-primary">
            {formatWater(current, unit)}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            / {formatWater(goal, unit)}
          </span>
        </div>
        {current >= goal && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-brand-accent/30 to-brand-accent/10 text-brand-accent dark:text-brand-accent rounded-full text-sm font-bold border border-brand-accent/30">
            🎉 Daily Goal Achieved!
          </div>
        )}
      </div>
    </div>
  );
};
