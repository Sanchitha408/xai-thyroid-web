import React, { useState, useEffect } from 'react';

const healthTips = [
  "💡 TSH above 4.0 mIU/L may indicate an underactive thyroid.",
  "💡 Women are 5-8x more likely to develop thyroid disorders.",
  "💡 Regular exercise can help maintain healthy thyroid function.",
  "💡 Iodine deficiency is a leading cause of thyroid disorders globally.",
  "💡 Thyroid disorders affect nearly 750 million people worldwide.",
  "💡 Most thyroid conditions are highly treatable when caught early.",
  "💡 T3 and T4 hormones regulate metabolism, energy, and mood.",
  "💡 A simple blood test can detect most thyroid conditions.",
  "💡 Stress and poor sleep can affect thyroid hormone levels.",
  "💡 Early detection leads to much better treatment outcomes.",
];

const DiagnosisLoader = ({ isVisible }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentTip(prev => (prev + 1) % healthTips.length);
        setFadeIn(true);
      }, 300);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center w-full">
      
      {/* Animated pulsing rings */}
      <div className="relative w-24 h-24 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-ping [animation-delay:0.3s]" />
        {/* Inner circle */}
        <div className="absolute inset-4 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      
      {/* Analyzing text */}
      <h3 className="font-orbitron text-white text-xl font-bold mb-2">
        Analyzing...
      </h3>
      <p className="font-poppins text-muted text-sm mb-8">
        AI model processing your blood test values
      </p>
      
      {/* Health tip */}
      <div className="max-w-sm bg-bg-glass backdrop-blur-glass border border-border rounded-xl p-4 min-h-[80px] flex items-center justify-center"
           style={{ 
             opacity: fadeIn ? 1 : 0, 
             transition: 'opacity 0.3s ease' 
           }}>
        <p className="font-poppins text-muted text-sm leading-relaxed">
          {healthTips[currentTip]}
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0,1,2].map(i => (
          <div key={i} 
               className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
               style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
};

export default DiagnosisLoader;
