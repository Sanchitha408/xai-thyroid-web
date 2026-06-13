import React, { useEffect, useState } from 'react';
import { animateConfidenceRing } from '../animations/gsapAnimations';

export default function ConfidenceRing({ value = 0 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Run GSAP counter animation
    animateConfidenceRing(setProgress, value);
  }, [value]);

  // SVG parameters
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color dynamic rules based on prediction confidence
  const getColor = () => {
    if (progress < 60) return '#EF4444'; // Danger
    if (progress < 85) return '#F59E0B'; // Warning
    return '#10B981'; // Success
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-out"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-orbitron font-bold text-2xl text-secondary">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
