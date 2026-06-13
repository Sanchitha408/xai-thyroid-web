import React from 'react';

export default function HealthGauge({ value = 1.0 }) {
  // TSH values: Hyper < 0.4, Normal 0.4 - 4.0, Hypo > 4.0
  const normalizedVal = parseFloat(value);

  // Map TSH input value to semicircular angle (from -90 to +90 degrees)
  // Normal range: 0.4 to 4.0 is centered
  const getNeedleRotation = () => {
    if (normalizedVal <= 0.1) return -80;
    if (normalizedVal >= 15.0) return 80;

    // Logarithmic scaling works best for TSH since normal is 0.4-4.0 and hyper goes low, hypo goes high
    if (normalizedVal < 0.4) {
      // Hyperthyroid zone: map [0.1, 0.4] to [-80, -35]
      const ratio = (normalizedVal - 0.1) / 0.3;
      return -80 + ratio * 45;
    } else if (normalizedVal <= 4.0) {
      // Normal zone: map [0.4, 4.0] to [-35, 35]
      const ratio = (normalizedVal - 0.4) / 3.6;
      return -35 + ratio * 70;
    } else {
      // Hypothyroid zone: map [4.0, 15.0] to [35, 80]
      const ratio = (normalizedVal - 4.0) / 11.0;
      return 35 + ratio * 45;
    }
  };

  const rotationAngle = getNeedleRotation();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-32 overflow-hidden flex items-end justify-center">
        {/* Semicircular track */}
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" /> {/* Hyper - red */}
              <stop offset="30%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#10B981" /> {/* Normal - green */}
              <stop offset="65%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#3B82F6" /> {/* Hypo - blue */}
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>

        {/* Needle */}
        <div
          style={{ transform: `rotate(${rotationAngle}deg)`, transformOrigin: 'bottom center' }}
          className="absolute bottom-0 w-1.5 h-20 bg-white rounded-t-full transition-transform duration-1000 ease-out"
        >
          {/* Needle visual circle anchor */}
          <div className="absolute -bottom-2 -left-1.5 w-4.5 h-4.5 bg-white border-2 border-bg-dark rounded-full" />
        </div>
      </div>

      {/* Grid labels below arcs */}
      <div className="flex justify-between w-64 mt-2 font-orbitron text-[10px] text-muted tracking-wide px-3">
        <span className="text-danger font-semibold">HYPER</span>
        <span className="text-success font-semibold">NORMAL</span>
        <span className="text-primary font-semibold">HYPO</span>
      </div>
      <div className="mt-1 font-poppins text-xs text-muted">
        TSH: <span className="text-secondary font-semibold">{value} mIU/L</span>
      </div>
    </div>
  );
}
