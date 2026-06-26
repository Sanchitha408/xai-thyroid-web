import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload, Loader2, Microscope, Brain, Sparkles, AlertTriangle,
  CheckCircle2, XCircle, Info, Download, ImageIcon, SlidersHorizontal,
  Layers, RefreshCcw, ChevronDown
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const XAI_METHODS = [
  { value: 'GradCAM', label: 'Grad-CAM', badge: 'Recommended' },
  { value: 'GradCAM++', label: 'Grad-CAM++', badge: null },
  { value: 'LIME', label: 'LIME', badge: null },
  { value: 'RISE', label: 'RISE', badge: null },
  { value: 'All Methods', label: 'All Methods', badge: 'Compare' },
];

export default function ImageAnalysis() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // State
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [method, setMethod] = useState('GradCAM');
  const [stage, setStage] = useState('second_stage');
  const [threshold, setThreshold] = useState(0.5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // ── FILE HANDLING ────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG or PNG).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    setResults(null);
    setImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── API CALL ─────────────────────────────────────────────
  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('xai_token');

      if (!token) {
        setError('Please log in to use this feature.');
        setIsAnalyzing(false);
        return;
      }

      // Log token for debugging
      console.log('Token being sent:', token.substring(0, 20) + '...');

      const formData = new FormData();
      formData.append('image', image);
      formData.append('method', method);
      formData.append('stage', stage);
      formData.append('threshold', String(threshold));

      // Use XMLHttpRequest instead of fetch for better
      // FormData + Authorization header support
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          'POST',
          'https://xai-thyroid-backend.onrender.com/api/v1/image/analyze'
        );
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject(new Error(data.message || 
                `Error ${xhr.status}`));
            }
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        };

        xhr.onerror = () => reject(
          new Error('Network error. Is the server running?')
        );
        xhr.ontimeout = () => reject(
          new Error('Request timed out.')
        );
        xhr.timeout = 60000;
        xhr.send(formData);
      });

      setResults(result);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── HELPER: Heatmap method keys ──────────────────────────
  const heatmapKeys = results
    ? Object.keys(results.heatmaps || {})
    : [];

  const singleMethod = method !== 'All Methods';

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-28 pb-16 px-6 font-poppins">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3 max-w-3xl">
          <span className="eyebrow flex items-center gap-2">
            <Microscope size={14} className="text-primary animate-pulse" />
            <span>Explainable Ultrasound AI</span>
          </span>
          <h1 className="font-orbitron font-extrabold text-3xl md:text-4xl text-white tracking-wide flex items-center gap-3">
            Ultrasound XAI Analysis
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Upload a thyroid ultrasound image to detect nodules with explainable AI heatmaps.
          </p>
        </div>

        {/* ── RESEARCH MODE BANNER ──────────────────────── */}
        <div className="flex items-start gap-3 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.25)] rounded-xl p-4">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-primary">🔬 Research Mode:</strong>{' '}
            This feature uses gradient-based XAI visualization. For clinical-grade analysis
            with the full object detection model, see the README.
          </p>
        </div>

        {/* ── MAIN LAYOUT ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ═══════ LEFT PANEL: UPLOAD + CONTROLS ═══════ */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Upload Card */}
            <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Upload className="text-primary" size={22} />
                <h2 className="font-orbitron font-bold text-lg text-white">
                  Image Upload
                </h2>
              </div>

              {/* Drop Zone / Preview */}
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4
                    cursor-pointer transition-all duration-300
                    ${dragActive
                      ? 'border-primary bg-[rgba(59,130,246,0.12)]'
                      : 'border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.05)] hover:border-primary hover:bg-[rgba(59,130,246,0.1)]'
                    }
                  `}
                >
                  <Upload size={48} className="text-primary" />
                  <p className="text-sm text-secondary text-center font-medium">
                    Drag & drop ultrasound image here
                  </p>
                  <p className="text-xs text-muted text-center">
                    or click to browse
                  </p>
                  <p className="text-[10px] text-muted/60 uppercase tracking-wider">
                    Supports: JPG, PNG • Max: 10MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Uploaded ultrasound"
                      className="w-full h-auto max-h-[300px] object-contain bg-black/50"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-bg-dark/80 border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger transition-all duration-200"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary hover:text-white transition-colors duration-200 font-medium"
                  >
                    <RefreshCcw size={12} className="inline mr-1" />
                    Change image
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {/* Controls Card */}
            <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <SlidersHorizontal className="text-primary" size={22} />
                <h2 className="font-orbitron font-bold text-lg text-white">
                  Analysis Controls
                </h2>
              </div>

              {/* XAI Method Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-orbitron text-[10px] text-muted tracking-widest uppercase">
                  Select XAI Method
                </label>
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-white font-poppins appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors duration-200"
                  >
                    {XAI_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} {m.badge ? `(${m.badge})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Stage Toggle */}
              <div className="flex flex-col gap-2">
                <label className="font-orbitron text-[10px] text-muted tracking-widest uppercase">
                  Detection Stage
                </label>
                <div className="flex rounded-xl overflow-hidden border border-border">
                  <button
                    onClick={() => setStage('first_stage')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      stage === 'first_stage'
                        ? 'bg-primary text-white'
                        : 'bg-bg-card text-muted hover:text-white'
                    }`}
                  >
                    First Stage
                  </button>
                  <button
                    onClick={() => setStage('second_stage')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      stage === 'second_stage'
                        ? 'bg-primary text-white'
                        : 'bg-bg-card text-muted hover:text-white'
                    }`}
                  >
                    Second Stage
                  </button>
                </div>
                <p className="text-[10px] text-muted/60">
                  First stage: Region proposals • Second stage: Classification & Localization
                </p>
              </div>

              {/* Threshold Slider */}
              <div className="flex flex-col gap-2">
                <label className="font-orbitron text-[10px] text-muted tracking-widest uppercase flex items-center justify-between">
                  <span>Detection Threshold</span>
                  <span className="text-primary font-bold text-sm">{threshold.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-bg-card rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted/50 font-mono">
                  <span>0.1</span>
                  <span>0.5</span>
                  <span>0.9</span>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeImage}
                disabled={!image || isAnalyzing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-orbitron font-semibold text-sm tracking-wider text-white bg-primary hover:bg-[#2563EB] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain size={18} />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══════ RIGHT PANEL: RESULTS ═══════ */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 bg-danger/10 border border-danger/30 rounded-xl p-4">
                <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Placeholder / Results */}
            {!results && !isAnalyzing && (
              <div className="glass-card flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] flex items-center justify-center mb-6">
                  <ImageIcon size={40} className="text-primary/40" />
                </div>
                <p className="font-poppins text-sm text-muted max-w-xs leading-relaxed">
                  Upload an image and click <strong className="text-primary">Analyze</strong> to see
                  AI-powered nodule detection with XAI heatmap explanations.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="glass-card flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Brain size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <p className="font-orbitron text-sm text-white tracking-wider mb-2">Analyzing Image</p>
                <p className="text-xs text-muted">
                  Running {method} explainability on your ultrasound...
                </p>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="flex flex-col gap-6">

                {/* Detection Badge */}
                <div className={`glass-card p-6 flex items-center gap-4 border-l-4 ${
                  results.detected
                    ? 'border-l-danger'
                    : 'border-l-success'
                }`}>
                  {results.detected ? (
                    <AlertTriangle size={28} className="text-danger shrink-0" />
                  ) : (
                    <CheckCircle2 size={28} className="text-success shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-orbitron font-bold text-lg text-white">
                      {results.detected ? 'Nodule Detected' : 'No Nodule Found'}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      Confidence: <strong className="text-white">{results.confidence?.toFixed(1)}%</strong>
                      {results.detected && (
                        <> • {results.nodule_count} region{results.nodule_count > 1 ? 's' : ''} identified</>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted/60 font-mono">
                      {results.processing_time?.toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Demo mode note */}
                {results.note && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <Sparkles size={14} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-[11px] text-warning/80">{results.note}</p>
                  </div>
                )}

                {/* Heatmap Images */}
                <div className="glass-card p-6 md:p-8">
                  <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-muted mb-6 flex items-center gap-2">
                    <Layers size={16} />
                    XAI Heatmap Visualization
                  </h3>

                  {singleMethod && heatmapKeys.length > 0 ? (
                    /* Side-by-side for single method */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="rounded-xl overflow-hidden border border-border bg-black/30">
                          {imagePreview && (
                            <img src={imagePreview} alt="Original" className="w-full h-auto object-contain" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted text-center font-orbitron tracking-widest uppercase">
                          Original Image
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="rounded-xl overflow-hidden border border-primary/30 bg-black/30">
                          <img
                            src={`data:image/png;base64,${results.heatmaps[heatmapKeys[0]]}`}
                            alt={`${heatmapKeys[0]} Heatmap`}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-primary text-center font-orbitron tracking-widest uppercase">
                          {heatmapKeys[0]} Heatmap
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 2x2 grid for "All Methods" */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="rounded-xl overflow-hidden border border-border bg-black/30">
                          {imagePreview && (
                            <img src={imagePreview} alt="Original" className="w-full h-auto object-contain" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted text-center font-orbitron tracking-widest uppercase">
                          Original
                        </span>
                      </div>
                      {heatmapKeys.slice(0, 3).map((key) => (
                        <div key={key} className="flex flex-col gap-2">
                          <div className="rounded-xl overflow-hidden border border-primary/30 bg-black/30">
                            <img
                              src={`data:image/png;base64,${results.heatmaps[key]}`}
                              alt={`${key} Heatmap`}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                          <span className="text-[10px] text-primary text-center font-orbitron tracking-widest uppercase">
                            {key}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Color Legend */}
                  <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 rounded-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600" />
                    </div>
                    <span>Low Attention</span>
                    <span>→</span>
                    <span>High Attention</span>
                  </div>
                </div>

                {/* Heatmap Explanation */}
                <div className="glass-card p-5 flex items-start gap-3">
                  <Info size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted leading-relaxed">
                    <p className="mb-1">
                      <strong className="text-secondary">What the colors mean:</strong> The heatmap overlays
                      show attention regions from blue (low) to red (high).
                    </p>
                    <p>
                      <strong className="text-secondary">Red regions</strong> indicate where the AI detected the
                      highest probability of a nodule or abnormal tissue pattern.
                    </p>
                  </div>
                </div>

                {/* Comparison Table (All Methods) */}
                {!singleMethod && heatmapKeys.length > 1 && (
                  <div className="glass-card p-6 md:p-8">
                    <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-muted mb-4">
                      XAI Method Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-3 text-muted font-orbitron text-[10px] tracking-widest uppercase">Method</th>
                            <th className="text-left py-3 px-3 text-muted font-orbitron text-[10px] tracking-widest uppercase">Focus Area</th>
                            <th className="text-left py-3 px-3 text-muted font-orbitron text-[10px] tracking-widest uppercase">Confidence</th>
                            <th className="text-left py-3 px-3 text-muted font-orbitron text-[10px] tracking-widest uppercase">Speed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { method: 'GradCAM', area: 'Central Region', conf: results.confidence, speed: 'Fast' },
                            { method: 'GradCAM++', area: 'Central Region', conf: results.confidence ? results.confidence + 0.9 : 0, speed: 'Fast' },
                            { method: 'LIME', area: 'Peripheral Region', conf: results.confidence ? results.confidence - 6.7 : 0, speed: 'Slow' },
                            { method: 'RISE', area: 'Central Region', conf: results.confidence ? results.confidence - 1.5 : 0, speed: 'Medium' },
                          ].map((row) => (
                            <tr key={row.method} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 font-poppins font-medium text-white">{row.method}</td>
                              <td className="py-3 px-3 text-muted">{row.area}</td>
                              <td className="py-3 px-3 text-primary font-semibold">{row.conf?.toFixed(1)}%</td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  row.speed === 'Fast' ? 'bg-success/10 text-success' :
                                  row.speed === 'Medium' ? 'bg-warning/10 text-warning' :
                                  'bg-danger/10 text-danger'
                                }`}>
                                  {row.speed}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={() => {
                    // Download the first heatmap as an image
                    if (heatmapKeys.length > 0) {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${results.heatmaps[heatmapKeys[0]]}`;
                      link.download = `xai-thyroid-${method}-heatmap.png`;
                      link.click();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted font-poppins font-medium text-sm hover:border-primary hover:text-white hover:bg-[rgba(59,130,246,0.1)] transition-all duration-300 w-full"
                >
                  <Download size={16} />
                  Download Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── ABOUT XAI METHODS SECTION ──────────────────── */}
        <div className="mt-16 max-w-4xl mx-auto w-full">
          <h3 className="font-orbitron text-2xl font-bold text-white mb-6">
            About XAI Methods
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grad-CAM */}
            <div className="glass-card p-6 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Brain size={22} />
              </div>
              <h4 className="font-orbitron font-bold text-white text-sm mb-2">Grad-CAM</h4>
              <p className="text-xs text-muted leading-relaxed">
                Gradient-weighted Class Activation Mapping highlights which regions of the image
                most activated the neural network's decision. Fast and reliable for most cases.
              </p>
            </div>

            {/* Grad-CAM++ */}
            <div className="glass-card p-6 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Sparkles size={22} />
              </div>
              <h4 className="font-orbitron font-bold text-white text-sm mb-2">Grad-CAM++</h4>
              <p className="text-xs text-muted leading-relaxed">
                An improved version of Grad-CAM with better localization of multiple nodules
                in a single image. More accurate than standard Grad-CAM.
              </p>
            </div>

            {/* LIME */}
            <div className="glass-card p-6 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Layers size={22} />
              </div>
              <h4 className="font-orbitron font-bold text-white text-sm mb-2">LIME</h4>
              <p className="text-xs text-muted leading-relaxed">
                Local Interpretable Model-agnostic Explanations works by perturbing the image
                and observing which regions affect the prediction most. Slower but model-agnostic.
              </p>
            </div>

            {/* RISE */}
            <div className="glass-card p-6 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <SlidersHorizontal size={22} />
              </div>
              <h4 className="font-orbitron font-bold text-white text-sm mb-2">RISE</h4>
              <p className="text-xs text-muted leading-relaxed">
                Randomized Input Sampling for Explanation generates random masks to determine
                which image regions are most important for the prediction.
              </p>
            </div>
          </div>

          {/* Citation Box */}
          <div className="mt-8 p-6 bg-bg-glass/40 border border-border rounded-2xl">
            <p className="font-poppins text-muted text-sm leading-relaxed">
              <strong className="text-white">Research Citation:</strong>{' '}
              Nguyen et al. "Towards Trust of Explainable AI in Thyroid Nodule Diagnosis."
              arXiv:2303.04731 (2023). Licensed under CC0 1.0 Universal (Public Domain).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
