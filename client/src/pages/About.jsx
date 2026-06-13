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
          <span className="eyebrow">METHODOLOGY & CLINICAL STANDARDS</span>
          <h1 className="font-orbitron font-extrabold text-3xl md:text-5xl text-white tracking-wide">
            Methodology
          </h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Clinical validation, model design architectures, and explainability workflows behind XAI Thyroid.
          </p>
        </div>

        {/* 1. Core Model Architecture */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <Brain size={20} />
            <span>1. Neural Model & Architecture</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            The XAI Thyroid system leverages a robust machine learning model trained on historical clinical indicator databases. The network uses multi-layered perceptrons to map critical biomarkers (TSH, T3, TT4, FTI, Age, Sex) to thyroid outcomes classes:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted flex flex-col gap-2">
            <li><strong>Normal Thyroid Function:</strong> Base metabolic operations within target homeostatic zones.</li>
            <li><strong>Hypothyroid Condition:</strong> Underactive thyroid output commonly characterized by elevated TSH values.</li>
            <li><strong>Hyperthyroid Condition:</strong> Hyperactive thyroid output indicated by depressed TSH and elevated free hormones.</li>
          </ul>
        </div>

        {/* 2. SHAP Explainability */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <FileText size={20} />
            <span>2. SHAP Explainability Engine</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            To prevent "black box" outcomes, we compute local feature attribution scores via the <strong>SHAP (Shapley Additive exPlanations)</strong> framework. Based on cooperative game theory, SHAP attributes positive or negative weights to each blood indicator, showing exactly which levels forced the model's diagnostic direction. This visual evidence empowers healthcare practitioners to confirm or adjust recommendations.
          </p>
        </div>

        {/* 3. Clinical Guidelines */}
        <div className="flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xl text-primary flex items-center gap-2">
            <Award size={20} />
            <span>3. Clinical Safety Standards</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            To ensure clinician-grade reliability, the narrative explanations are dynamically structured using Large Language Models under tight system instruction filters. Every explanation is formulated to prioritize medical caution, highlighting physiological bounds, warning on borderline cases, and referencing diagnostic limits.
          </p>
        </div>

        {/* 4. Privacy & Compliance */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border p-6 rounded-2xl">
          <h2 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
            <Lock size={18} className="text-success" />
            <span>Privacy & Technical Compliance</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed mt-2">
            All records are encrypted at rest using industry-standard AES-256 protocols. The system conforms with HIPAA security standards, ensuring no personally identifiable biological details are shared, and diagnostic data is fully compartmentalized behind authorized JWT sessions.
          </p>
        </div>

      </div>
    </div>
  );
}
