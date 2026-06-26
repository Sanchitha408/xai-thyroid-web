import React from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, FileText, Lock, Award, Heart, CheckCircle } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-28 pb-16 px-6 font-poppins">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        
        {/* Title */}
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h1 className="font-orbitron font-extrabold text-3xl md:text-5xl text-white tracking-wide">
            {t('about.title')}
          </h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* 1. Core Model Architecture */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <Brain size={20} />
            <span>{t('about.section1Title')}</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t('about.section1Text')}
          </p>
          <ul className="list-disc pl-6 text-sm text-muted flex flex-col gap-2">
            <li>{t('about.section1Item1')}</li>
            <li>{t('about.section1Item2')}</li>
            <li>{t('about.section1Item3')}</li>
          </ul>
        </div>

        {/* 2. SHAP Explainability */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <FileText size={20} />
            <span>{t('about.section2Title')}</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t('about.section2Text')}
          </p>
        </div>

        {/* 3. Clinical Guidelines */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <Award size={20} />
            <span>{t('about.section3Title')}</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t('about.section3Text')}
          </p>
        </div>

        {/* 4. Privacy & Compliance */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border p-6 rounded-2xl">
          <h2 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
            <Lock size={18} className="text-success" />
            <span>{t('about.section4Title')}</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed mt-2">
            {t('about.section4Text')}
          </p>
        </div>

      </div>
    </div>
  );
}
