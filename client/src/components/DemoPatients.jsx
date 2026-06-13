import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck } from 'lucide-react';
import { animateSliderPopulate } from '../animations/gsapAnimations';

const PRESETS = [
  {
    nameKey: 'demo.preset_healthy',
    tsh: 1.8,
    t3: 1.2,
    tt4: 98,
    fti: 102,
    age: 35,
    sex: 'Female',
    color: 'border-success/30 hover:border-success/60 text-success'
  },
  {
    nameKey: 'demo.preset_hypo',
    tsh: 9.6,
    t3: 0.5,
    tt4: 45,
    fti: 52,
    age: 52,
    sex: 'Male',
    color: 'border-danger/30 hover:border-danger/60 text-danger'
  },
  {
    nameKey: 'demo.preset_hyper',
    tsh: 0.05,
    t3: 4.8,
    tt4: 185,
    fti: 195,
    age: 28,
    sex: 'Female',
    color: 'border-warning/30 hover:border-warning/60 text-warning'
  }
];

export default function DemoPatients({ onSelectPreset, disabled = false }) {
  const { t } = useTranslation();

  const handleSelect = (preset) => {
    if (disabled) return;
    
    // Smoothly animate the sliders values shifting
    const targetValues = {
      tsh: preset.tsh,
      t3: preset.t3,
      tt4: preset.tt4,
      fti: preset.fti,
      age: preset.age,
      sex: preset.sex
    };

    onSelectPreset(targetValues);
  };

  return (
    <div className="flex flex-col gap-3 font-poppins">
      <span className="form-label">{t('diagnose.demo_patients')}</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => handleSelect(preset)}
            className={`flex items-center justify-between border bg-bg-card/40 hover:bg-bg-card rounded-xl p-3.5 text-left transition-all duration-300 font-medium text-xs md:text-sm ${preset.color} ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-secondary font-semibold">{t(preset.nameKey)}</span>
              <span className="text-[10px] text-muted font-normal tracking-wide">
                TSH: {preset.tsh} | T3: {preset.t3}
              </span>
            </div>
            <UserCheck size={16} className="shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
