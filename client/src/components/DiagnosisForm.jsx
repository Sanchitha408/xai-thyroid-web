import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Stethoscope, User, ShieldAlert } from 'lucide-react';
import DemoPatients from './DemoPatients';
import { sanitizeDiagnosisInputs } from '../utils/sanitize';

export default function DiagnosisForm({ onSubmit, loading = false, presetValues = null }) {
  const { t } = useTranslation();
  const [isDoctorMode, setIsDoctorMode] = useState(true);

  // Initial blood test state values
  const [values, setValues] = useState({
    tsh: 1.5,
    t3: 1.2,
    tt4: 100,
    fti: 110,
    age: 40,
    sex: 'Female'
  });

  // Handle local slider populate callback
  const handlePresetSelect = (presetValues) => {
    setValues(presetValues);
  };

  const handleSliderChange = (field, val) => {
    setValues((prev) => ({ ...prev, [field]: parseFloat(val) }));
  };

  const handleSexChange = (sex) => {
    setValues((prev) => ({ ...prev, sex }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    // Sanitize values on submit
    const sanitized = sanitizeDiagnosisInputs(values);
    onSubmit(sanitized);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-poppins">
      {/* Mode Switcher */}
      <div className="flex justify-between items-center bg-bg-card border border-border p-1.5 rounded-xl self-start">
        <button
          type="button"
          onClick={() => setIsDoctorMode(true)}
          className={`flex items-center gap-2 py-1.5 px-4 rounded-lg font-orbitron text-xs font-semibold tracking-wider transition-all duration-300 ${
            isDoctorMode ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
          }`}
        >
          <Stethoscope size={14} />
          <span>{t('diagnose.doctor_mode')}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsDoctorMode(false)}
          className={`flex items-center gap-2 py-1.5 px-4 rounded-lg font-orbitron text-xs font-semibold tracking-wider transition-all duration-300 ${
            !isDoctorMode ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
          }`}
        >
          <User size={14} />
          <span>{t('diagnose.patient_mode')}</span>
        </button>
      </div>

      {/* Preset demo triggers */}
      <DemoPatients onSelectPreset={handlePresetSelect} disabled={loading} />

      <hr className="border-border my-2" />

      {/* Input Sliders & Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TSH Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="form-label">{t('diagnose.tsh_label')}</label>
            <span className="font-orbitron text-sm font-semibold text-secondary">{values.tsh} <span className="text-[10px] text-muted font-normal font-poppins">mIU/L</span></span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.05"
            value={values.tsh}
            onChange={(e) => handleSliderChange('tsh', e.target.value)}
            disabled={loading}
          />
          {isDoctorMode ? (
            <span className="text-[10px] text-muted">
              {t('diagnose.normal_range')}: <span className="text-secondary font-medium">0.4 - 4.0 mIU/L</span> (Elevated = Hypo, Depressed = Hyper)
            </span>
          ) : (
            <span className="text-[10px] text-muted">Hormone that controls thyroid activity.</span>
          )}
        </div>

        {/* T3 Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="form-label">{t('diagnose.t3_label')}</label>
            <span className="font-orbitron text-sm font-semibold text-secondary">{values.t3} <span className="text-[10px] text-muted font-normal font-poppins">nmol/L</span></span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={values.t3}
            onChange={(e) => handleSliderChange('t3', e.target.value)}
            disabled={loading}
          />
          {isDoctorMode ? (
            <span className="text-[10px] text-muted">
              {t('diagnose.normal_range')}: <span className="text-secondary font-medium">0.8 - 2.0 nmol/L</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted">Active thyroid hormone in the blood.</span>
          )}
        </div>

        {/* TT4 (Total T4) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="form-label">{t('diagnose.tt4_label')}</label>
            <span className="font-orbitron text-sm font-semibold text-secondary">{values.tt4} <span className="text-[10px] text-muted font-normal font-poppins">nmol/L</span></span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="1"
            value={values.tt4}
            onChange={(e) => handleSliderChange('tt4', e.target.value)}
            disabled={loading}
          />
          {isDoctorMode ? (
            <span className="text-[10px] text-muted">
              {t('diagnose.normal_range')}: <span className="text-secondary font-medium">60 - 140 nmol/L</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted">Total Thyroxine hormone level.</span>
          )}
        </div>

        {/* FTI Index */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="form-label">{t('diagnose.fti_label')}</label>
            <span className="font-orbitron text-sm font-semibold text-secondary">{values.fti}</span>
          </div>
          <input
            type="range"
            min="0"
            max="400"
            step="1"
            value={values.fti}
            onChange={(e) => handleSliderChange('fti', e.target.value)}
            disabled={loading}
          />
          {isDoctorMode ? (
            <span className="text-[10px] text-muted">
              {t('diagnose.normal_range')}: <span className="text-secondary font-medium">65 - 155</span> (Free Thyroxine Index)
            </span>
          ) : (
            <span className="text-[10px] text-muted">Estimates free active hormone levels.</span>
          )}
        </div>

        {/* Age Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="form-label">{t('diagnose.age_label')}</label>
            <span className="font-orbitron text-sm font-semibold text-secondary">{values.age} <span className="text-[10px] text-muted font-normal font-poppins">Yrs</span></span>
          </div>
          <input
            type="range"
            min="1"
            max="120"
            step="1"
            value={values.age}
            onChange={(e) => handleSliderChange('age', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Sex Selection */}
        <div className="flex flex-col gap-2">
          <label className="form-label">{t('diagnose.sex_label')}</label>
          <div className="grid grid-cols-2 gap-3 bg-bg-card/50 border border-border p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleSexChange('Female')}
              className={`py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                values.sex === 'Female' ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
              }`}
              disabled={loading}
            >
              {t('diagnose.female')}
            </button>
            <button
              type="button"
              onClick={() => handleSexChange('Male')}
              className={`py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                values.sex === 'Male' ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
              }`}
              disabled={loading}
            >
              {t('diagnose.male')}
            </button>
          </div>
        </div>
      </div>

      {/* Extreme inputs caution alert banner */}
      {(values.tsh > 20 || values.tsh < 0.1) && (
        <div className="flex items-start gap-3 bg-danger/10 border border-danger/30 rounded-xl p-3.5 text-xs text-danger font-poppins">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Attention:</strong> Enter TSH values outside normal physiological expectations might represent extreme critical conditions or typing error. Ensure data entry validity.
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 font-orbitron text-sm font-semibold tracking-wider"
      >
        <Activity size={18} />
        <span>{loading ? t('diagnose.btn_analyzing') : t('diagnose.btn_diagnose')}</span>
      </button>
    </form>
  );
}
