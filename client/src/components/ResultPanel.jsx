import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import ConfidenceRing from './ConfidenceRing';
import HealthGauge from './HealthGauge';
import ShapChart from './ShapChart';
import RadarChart from './RadarChart';
import ReportDownload from './ReportDownload';
import { initResultAnimation } from '../animations/gsapAnimations';
import useAuth from '../hooks/useAuth';

export default function ResultPanel({ result = null, patientData = null, recordId = null }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (result) {
      initResultAnimation(panelRef);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-2xl p-6 text-center">
        <HelpCircle size={48} className="text-muted/30 mb-4" />
        <p className="font-poppins text-sm text-muted max-w-xs leading-relaxed">
          {t('diagnose.placeholder')}
        </p>
      </div>
    );
  }

  const outcome = result.prediction.toLowerCase();
  const confidence = result.confidence;

  const isNormal = outcome.includes('normal');
  const isHypo = outcome.includes('hypo');
  const isHyper = outcome.includes('hyper');

  // Set outcome display properties
  const getOutcomeDetails = () => {
    if (isNormal) {
      return {
        icon: <CheckCircle2 className="text-success" size={28} />,
        badgeClass: 'badge-normal',
        title: t('result.normal'),
        desc: t('result.normal_desc')
      };
    }
    if (isHypo) {
      return {
        icon: <AlertTriangle className="text-danger" size={28} />,
        badgeClass: 'badge-hypo',
        title: t('result.hypothyroid'),
        desc: t('result.hypo_desc')
      };
    }
    return {
      icon: <AlertOctagon className="text-warning" size={28} />,
      badgeClass: 'badge-hyper',
      title: t('result.hyperthyroid'),
      desc: t('result.hyper_desc')
    };
  };

  const details = getOutcomeDetails();

  return (
    <div
      ref={panelRef}
      id="diagnosis-report-container"
      className="glass-card p-6 md:p-8 flex flex-col gap-8 text-secondary overflow-hidden"
    >
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-bg-glass border border-border rounded-xl">
            {details.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-orbitron font-bold text-lg leading-none">
                {t('result.prediction')}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider ${details.badgeClass}`}>
                {t(`predictions.${result.prediction}`) || result.prediction}
              </span>
            </div>
            <p className="font-poppins text-sm text-muted mt-2 max-w-md">
              {details.desc}
            </p>
          </div>
        </div>

        {/* Confidence Ring Indicator */}
        <div className="flex flex-col items-center self-center md:self-auto">
          <span className="font-orbitron text-[10px] text-muted tracking-widest uppercase mb-1">
            {t('result.confidence')}
          </span>
          <ConfidenceRing value={confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100)} />
        </div>
      </div>

      {/* Uncertainty & Borderline Alert Banners */}
      {confidence < 0.7 && (
        <div className="flex gap-3 bg-warning/10 border border-warning/30 rounded-xl p-3.5 text-xs text-warning leading-relaxed font-poppins">
          <AlertOctagon size={16} className="shrink-0 mt-0.5" />
          <span>{t('result.low_confidence_warn')}</span>
        </div>
      )}

      {/* Main Gauges & Profiles (Doctor Visual Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-border pb-8">
        <div className="flex flex-col items-center justify-center bg-bg-glass/40 border border-border rounded-2xl p-6 min-h-[200px]">
          <span className="font-orbitron text-[10px] text-muted tracking-widest uppercase mb-4 self-start">
            {t('result.tsh_gauge')}
          </span>
          <HealthGauge value={patientData?.tsh} />
        </div>

        <div className="flex flex-col items-center justify-center bg-bg-glass/40 border border-border rounded-2xl p-6 min-h-[200px]">
          <span className="font-orbitron text-[10px] text-muted tracking-widest uppercase mb-4 self-start">
            {t('result.blood_profile_radar')}
          </span>
          <RadarChart patientData={patientData} />
        </div>
      </div>

      {/* SHAP Graph Visualizations */}
      <div className="border-b border-border pb-8">
        <h4 className="font-orbitron font-semibold text-sm tracking-wider uppercase mb-4 text-muted">
          {t('result.shap_heading')}
        </h4>
        <div id="shap-chart-pdf-container">
          <ShapChart shapValues={result.shap} />
        </div>
      </div>

      {/* Clinical Narrative Narrative explanation */}
      <div>
        <h4 className="font-orbitron font-semibold text-sm tracking-wider uppercase mb-3 text-muted">
          {t('result.narrative_heading')}
        </h4>
        <div className="bg-bg-glass/30 border border-border rounded-2xl p-5">
          <p className="font-poppins text-sm leading-relaxed text-secondary whitespace-pre-line">
            {result.explanation}
          </p>
        </div>
      </div>

      {/* PDF Download Trigger */}
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 pt-4 border-t border-border">
        <p className="font-poppins text-[10px] text-muted italic text-center md:text-left">
          {t('result.disclaimer')}
        </p>
        <ReportDownload
          result={result}
          inputs={patientData}
          user={user}
        />
      </div>
    </div>
  );
}
