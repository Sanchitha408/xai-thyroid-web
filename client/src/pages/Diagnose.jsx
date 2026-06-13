import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Loader2, Sparkles } from 'lucide-react';
import DiagnosisForm from '../components/DiagnosisForm';
import ResultPanel from '../components/ResultPanel';
import { predict } from '../services/diagnosisService';

export default function Diagnose() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Results states
  const [result, setResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [recordId, setRecordId] = useState(null);

  const handleDiagnose = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setPatientData(formData);

    try {
      const response = await predict(formData);
      const data = response.data;
      
      // Expected backend response: { success: true, record_id: "...", prediction: "...", confidence: 0.95, explanation: "...", shap: [...] }
      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        explanation: data.explanation,
        shap: data.shap
      });
      setRecordId(data.record_id);
    } catch (err) {
      console.error('Diagnosis failed:', err);
      const errMsg = err.response?.data?.message || t('errors.generic');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-28 pb-16 px-6 font-poppins">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Title Heading */}
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="eyebrow flex items-center gap-2">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span>CLINICAL DECISION INTERFACE</span>
          </span>
          <h1 className="font-orbitron font-extrabold text-3xl md:text-4xl text-white tracking-wide">
            {t('nav.diagnose')}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Enter biometric parameters to execute the neural network predictions and display local SHAP explainability variables.
          </p>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Input Form */}
          <div className="lg:col-span-5 glass-card p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Stethoscope className="text-primary" size={24} />
              <h2 className="font-orbitron font-bold text-lg text-white">
                {t('diagnose.heading')}
              </h2>
            </div>
            <DiagnosisForm onSubmit={handleDiagnose} loading={loading} />
          </div>

          {/* Right panel: Live Results Display */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-[450px]">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-bg-card/40 border border-border rounded-2xl p-6 text-center">
                <Loader2 className="text-primary animate-spin mb-4" size={40} />
                <p className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                  {t('diagnose.btn_analyzing')}
                </p>
                <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed">
                  Computing model predictions and running local SHAP contributions calculations. Please wait...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-danger/5 border border-dashed border-danger/30 rounded-2xl p-6 text-center">
                <span className="text-danger font-semibold mb-2">Diagnosis Error</span>
                <p className="font-poppins text-sm text-muted max-w-sm leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && (
              <ResultPanel result={result} patientData={patientData} recordId={recordId} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
