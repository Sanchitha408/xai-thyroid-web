import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getHistory, getRecord } from '../services/diagnosisService';
import { Loader2 } from 'lucide-react';

export default function Compare() {
  const { user } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [recordA, setRecordA] = useState(null);
  const [recordB, setRecordB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const result = await getHistory(1, 50);
        setHistoryList(result?.records || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-dark text-secondary pt-32 pb-16 px-6 font-poppins flex flex-col items-center justify-center text-center">
        <h1 className="font-orbitron font-bold text-3xl mb-4 text-white">📊 Comparison Mode</h1>
        <p className="text-muted mb-8 max-w-md">Please log in to access comparison mode.</p>
        <Link to="/auth" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const renderBadge = (prediction) => {
    if (!prediction) return null;
    const lower = prediction.toLowerCase();
    if (lower.includes('normal')) return <span className="text-success bg-success/10 border border-success/30 px-2 py-1 rounded text-xs font-bold uppercase">{prediction}</span>;
    if (lower.includes('hypo')) return <span className="text-danger bg-danger/10 border border-danger/30 px-2 py-1 rounded text-xs font-bold uppercase">{prediction}</span>;
    if (lower.includes('hyper')) return <span className="text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded text-xs font-bold uppercase">{prediction}</span>;
    return <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-bg-glass text-muted">{prediction}</span>;
  };

  const renderValue = (valA, valB, isValA = true) => {
    if (valA === undefined || valB === undefined) return isValA ? valA : valB;
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    if (isNaN(numA) || isNaN(numB)) return isValA ? valA : valB;
    
    // Check if diff > 20%
    const diff = Math.abs(numA - numB);
    const max = Math.max(Math.abs(numA), Math.abs(numB));
    const isSignificant = max > 0 && (diff / max) > 0.20;
    
    const displayVal = isValA ? valA : valB;
    if (isSignificant) {
      return (
        <span className="text-warning font-semibold flex items-center gap-1">
          {displayVal} ⚠️
        </span>
      );
    }
    return displayVal;
  };

  const getTrend = () => {
    if (!recordA || !recordB) return null;
    if (recordA.prediction === recordB.prediction) {
      return { trend: 'same', message: 'Your thyroid levels are stable. Continue monitoring regularly.', icon: '→', color: 'text-muted' };
    }
    
    const dateA = new Date(recordA.createdAt).getTime();
    const dateB = new Date(recordB.createdAt).getTime();
    
    const newest = dateA >= dateB ? recordA : recordB;
    const oldest = dateA >= dateB ? recordB : recordA;
    
    const newestLower = newest.prediction?.toLowerCase() || '';
    const oldestLower = oldest.prediction?.toLowerCase() || '';
    
    if (newestLower.includes('normal') && !oldestLower.includes('normal')) {
      return { trend: 'improving', message: 'Great progress! Your thyroid health is showing improvement. Keep following your treatment plan.', icon: '↑', color: 'text-success' };
    } else if (!newestLower.includes('normal') && oldestLower.includes('normal')) {
      return { trend: 'worsening', message: 'Your values show some concern. Please consult your doctor soon.', icon: '↓', color: 'text-danger' };
    } else {
      return { trend: 'same', message: 'Your values remain abnormal. Keep following your treatment plan.', icon: '→', color: 'text-warning' };
    }
  };

  const loadFullRecord = async (id, setRecord) => {
    try {
      const result = await getRecord(id);
      setRecord(result?.record);
    } catch (err) {
      console.error('Failed to load full record:', err);
    }
  };

  const handleSelectA = (e) => {
    const id = parseInt(e.target.value);
    loadFullRecord(id, setRecordA);
  };

  const handleSelectB = (e) => {
    const id = parseInt(e.target.value);
    loadFullRecord(id, setRecordB);
  };

  const trendData = getTrend();

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-32 pb-16 px-6 font-poppins">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="font-orbitron font-extrabold text-3xl md:text-4xl text-white tracking-wide">
            📊 Comparison Mode
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Compare two diagnoses to track your thyroid health
          </p>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32}/></div>
        ) : historyList.length < 2 ? (
          <div className="glass-card p-8 text-center text-muted">
            You need at least two diagnosis records to use comparison mode.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Panel A */}
              <div className="flex flex-col gap-4">
                <label className="form-label text-white">Select Diagnosis A</label>
                <select className="form-input bg-bg-card border-border text-secondary p-3 rounded-lg focus:border-primary transition-colors outline-none" onChange={handleSelectA} defaultValue="">
                  <option value="" disabled>Select a record...</option>
                  {historyList.map(item => (
                    <option key={item.id} value={item.id}>
                      {formatDate(item.createdAt)} — {item.prediction} ({item.confidence > 1 ? Math.round(item.confidence) : Math.round(item.confidence * 100)}%)
                    </option>
                  ))}
                </select>
              </div>
              {/* Panel B */}
              <div className="flex flex-col gap-4">
                <label className="form-label text-white">Select Diagnosis B</label>
                <select className="form-input bg-bg-card border-border text-secondary p-3 rounded-lg focus:border-primary transition-colors outline-none" onChange={handleSelectB} defaultValue="">
                  <option value="" disabled>Select a record...</option>
                  {historyList.map(item => (
                    <option key={item.id} value={item.id}>
                      {formatDate(item.createdAt)} — {item.prediction} ({item.confidence > 1 ? Math.round(item.confidence) : Math.round(item.confidence * 100)}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {recordA && recordB && (
              <div className="glass-card overflow-hidden mt-6 shadow-card border border-border rounded-xl backdrop-blur-glass transition-all">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-bg-card border-b border-border font-orbitron text-sm">
                        <th className="py-4 px-6 text-muted font-semibold tracking-wider">Feature</th>
                        <th className="py-4 px-6 text-white font-semibold tracking-wider">Diagnosis A</th>
                        <th className="py-4 px-6 text-white font-semibold tracking-wider">Diagnosis B</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-border/50 bg-bg-dark hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">Date</td>
                        <td className="py-4 px-6 text-secondary">{formatDate(recordA.createdAt)}</td>
                        <td className="py-4 px-6 text-secondary">{formatDate(recordB.createdAt)}</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-glass hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">Prediction</td>
                        <td className="py-4 px-6">{renderBadge(recordA.prediction)}</td>
                        <td className="py-4 px-6">{renderBadge(recordB.prediction)}</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-dark hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">Confidence</td>
                        <td className="py-4 px-6 text-secondary">{recordA.confidence > 1 ? Math.round(recordA.confidence) : Math.round(recordA.confidence * 100)}%</td>
                        <td className="py-4 px-6 text-secondary">{recordB.confidence > 1 ? Math.round(recordB.confidence) : Math.round(recordB.confidence * 100)}%</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-glass hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">TSH</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.TSH, recordB.patient_data?.TSH, true)}</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.TSH, recordB.patient_data?.TSH, false)}</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-dark hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">T3</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.T3, recordB.patient_data?.T3, true)}</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.T3, recordB.patient_data?.T3, false)}</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-glass hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">TT4</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.TT4, recordB.patient_data?.TT4, true)}</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.TT4, recordB.patient_data?.TT4, false)}</td>
                      </tr>
                      <tr className="border-b border-border/50 bg-bg-dark hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">FTI</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.FTI, recordB.patient_data?.FTI, true)}</td>
                        <td className="py-4 px-6">{renderValue(recordA.patient_data?.FTI, recordB.patient_data?.FTI, false)}</td>
                      </tr>
                      <tr className="bg-bg-glass hover:bg-bg-card transition-colors">
                        <td className="py-4 px-6 font-medium text-muted">Age</td>
                        <td className="py-4 px-6 text-secondary">{recordA.patient_data?.age}</td>
                        <td className="py-4 px-6 text-secondary">{recordB.patient_data?.age}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {trendData && (
                  <div className="p-6 border-t border-border bg-bg-card flex flex-col gap-2 rounded-b-xl">
                    <h3 className="font-orbitron font-semibold text-white tracking-wide">Health Trend</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-2xl font-bold ${trendData.color}`}>
                        {trendData.icon}
                      </span>
                      <p className="text-sm text-secondary font-medium tracking-wide">
                        {trendData.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
