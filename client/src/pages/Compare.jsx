import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, GitCompare } from 'lucide-react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const PredictionBadge = ({ value }) => {
  const colors = {
    Normal: 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[#10B981]',
    Hypothyroid: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[#EF4444]',
    Hyperthyroid: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[#F59E0B]',
  };
  return (
    <span className={`
      inline-block px-3 py-1 rounded-full text-xs 
      font-poppins font-semibold border
      ${colors[value] || colors.Normal}
    `}>
      {value}
    </span>
  );
};

const ChangeIndicator = ({ older, newer }) => {
  if (!older || !newer || older === newer) return null;
  const improved = newer < older; // lower TSH/T3 = better for hypo
  return (
    <span className={`
      ml-2 text-xs font-poppins
      ${improved ? 'text-[#10B981]' : 'text-[#EF4444]'}
    `}>
      {improved ? '↓' : '↑'} 
      {Math.abs(((newer - older) / older) * 100).toFixed(1)}%
    </span>
  );
};

export default function Compare() {
  const [history, setHistory] = useState([]);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compResult, setCompResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: fetch diagnosis history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/diagnosis/history?page=1&limit=50');
        setHistory(res.data?.records || res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const recordA = history.find(r => r.id === parseInt(selectedA, 10));
  const recordB = history.find(r => r.id === parseInt(selectedB, 10));

  const handleCompare = () => {
    setComparing(true);
    
    if (!recordA || !recordB) {
      setComparing(false);
      return;
    }
    
    // Sort by date so A is always older
    const [older, newer] = 
      new Date(recordA.created_at) < new Date(recordB.created_at)
        ? [recordA, recordB]
        : [recordB, recordA];
    
    setCompResult({ older, newer });
    setComparing(false);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-32 pb-16 px-6 font-poppins">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-orbitron font-bold text-3xl md:text-4xl text-white tracking-wide">
            📊 Compare Diagnoses
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Select two diagnosis records to compare your thyroid health over time
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : history.length < 2 ? (
          <div className="glass-card p-10 text-center text-muted border border-white/5 rounded-2xl bg-[rgba(255,255,255,0.02)]">
            <p className="mb-4">You need at least two diagnosis records to use comparison mode.</p>
            <Link 
              to="/diagnose" 
              className="inline-block px-6 py-2.5 bg-primary text-white font-orbitron font-semibold rounded-full hover:bg-blue-600 transition-all duration-300"
            >
              Start Diagnose
            </Link>
          </div>
        ) : (
          <>
            {/* Selection panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Diagnosis A Card */}
              <div className="flex flex-col gap-4">
                <h3 className="font-orbitron font-semibold text-lg text-white">Diagnosis A</h3>
                <select
                  value={selectedA}
                  onChange={(e) => setSelectedA(e.target.value)}
                  className="w-full bg-[#1a2235] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition-all duration-300 cursor-pointer"
                >
                  <option value="">Select a diagnosis</option>
                  {history.map((record) => (
                    <option key={record.id} value={record.id}>
                      {new Date(record.created_at).toLocaleDateString('en-GB')} — {record.prediction} ({record.confidence}%)
                    </option>
                  ))}
                </select>

                {/* Preview for Diagnosis A */}
                {recordA && (
                  <div className="glass-card p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">
                        {new Date(recordA.created_at).toLocaleDateString('en-GB')}
                      </span>
                      <PredictionBadge value={recordA.prediction} />
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-sm text-muted">Confidence:</span>
                      <span className="text-sm font-semibold text-white">{recordA.confidence}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">TSH (mIU/L)</span>
                        <span className="font-semibold text-white">{recordA.tsh}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">T3 (nmol/L)</span>
                        <span className="font-semibold text-white">{recordA.t3}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">TT4 (nmol/L)</span>
                        <span className="font-semibold text-white">{recordA.tt4}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">FTI</span>
                        <span className="font-semibold text-white">{recordA.fti}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnosis B Card */}
              <div className="flex flex-col gap-4">
                <h3 className="font-orbitron font-semibold text-lg text-white">Diagnosis B</h3>
                <select
                  value={selectedB}
                  onChange={(e) => setSelectedB(e.target.value)}
                  className="w-full bg-[#1a2235] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition-all duration-300 cursor-pointer"
                >
                  <option value="">Select a diagnosis</option>
                  {history.map((record) => (
                    <option key={record.id} value={record.id}>
                      {new Date(record.created_at).toLocaleDateString('en-GB')} — {record.prediction} ({record.confidence}%)
                    </option>
                  ))}
                </select>

                {/* Preview for Diagnosis B */}
                {recordB && (
                  <div className="glass-card p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">
                        {new Date(recordB.created_at).toLocaleDateString('en-GB')}
                      </span>
                      <PredictionBadge value={recordB.prediction} />
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-sm text-muted">Confidence:</span>
                      <span className="text-sm font-semibold text-white">{recordB.confidence}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">TSH (mIU/L)</span>
                        <span className="font-semibold text-white">{recordB.tsh}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">T3 (nmol/L)</span>
                        <span className="font-semibold text-white">{recordB.t3}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">TT4 (nmol/L)</span>
                        <span className="font-semibold text-white">{recordB.tt4}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col">
                        <span className="text-muted mb-0.5">FTI</span>
                        <span className="font-semibold text-white">{recordB.fti}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Compare Button */}
            <div className="flex justify-center my-8">
              {selectedA && selectedB && selectedA !== selectedB && (
                <button
                  onClick={handleCompare}
                  disabled={!selectedA || !selectedB || selectedA === selectedB || comparing}
                  className="
                    w-full max-w-xs mx-auto
                    flex items-center justify-center gap-2
                    px-8 py-4
                    rounded-xl
                    bg-[#3B82F6]
                    text-white
                    font-orbitron font-bold
                    text-base
                    hover:bg-[#2563EB]
                    hover:scale-105
                    hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
                    transition-all duration-300
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    disabled:hover:scale-100
                  "
                >
                  {comparing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <GitCompare size={18} />
                      Compare Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Results Display */}
            {compResult && (
              <div className="flex flex-col gap-8 mt-4">
                
                {/* 1. Comparison Table */}
                <div className="overflow-x-auto bg-[#070b19] border border-[rgba(255,255,255,0.06)] rounded-xl">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#111827]">
                        <th className="font-orbitron text-left px-6 py-4 text-white text-sm rounded-tl-xl">
                          Feature
                        </th>
                        <th className="font-orbitron text-center px-6 py-4 text-[#94A3B8] text-sm">
                          Earlier ({new Date(compResult.older.created_at).toLocaleDateString('en-GB')})
                        </th>
                        <th className="font-orbitron text-center px-6 py-4 text-white text-sm rounded-tr-xl">
                          Latest ({new Date(compResult.newer.created_at).toLocaleDateString('en-GB')})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          label: 'Prediction', 
                          older: compResult.older.prediction, 
                          newer: compResult.newer.prediction,
                          type: 'badge'
                        },
                        { 
                          label: 'Confidence', 
                          older: compResult.older.confidence + '%', 
                          newer: compResult.newer.confidence + '%',
                          type: 'text'
                        },
                        { 
                          label: 'TSH', 
                          older: compResult.older.tsh, 
                          newer: compResult.newer.tsh,
                          type: 'number'
                        },
                        { 
                          label: 'T3', 
                          older: compResult.older.t3, 
                          newer: compResult.newer.t3,
                          type: 'number'
                        },
                        { 
                          label: 'TT4', 
                          older: compResult.older.tt4, 
                          newer: compResult.newer.tt4,
                          type: 'number'
                        },
                        { 
                          label: 'FTI', 
                          older: compResult.older.fti, 
                          newer: compResult.newer.fti,
                          type: 'number'
                        },
                        { 
                          label: 'Age', 
                          older: compResult.older.age, 
                          newer: compResult.newer.age,
                          type: 'number'
                        },
                      ].map((row, i) => (
                        <tr 
                          key={i} 
                          className={i % 2 === 0 ? 'bg-[#0A0F1E]' : 'bg-[#0D1526]'}
                        >
                          <td className="font-poppins font-medium text-[#94A3B8] px-6 py-4 text-sm">
                            {row.label}
                          </td>
                          <td className="text-center px-6 py-4">
                            {row.type === 'badge' 
                              ? <PredictionBadge value={row.older} />
                              : <span className="font-poppins text-[#94A3B8] text-sm">{row.older}</span>
                            }
                          </td>
                          <td className="text-center px-6 py-4">
                            {row.type === 'badge'
                              ? <PredictionBadge value={row.newer} />
                              : <span className="font-poppins text-white font-medium text-sm flex items-center justify-center gap-1">
                                  {row.newer}
                                  {row.type === 'number' && (
                                    <ChangeIndicator 
                                      older={parseFloat(row.older)} 
                                      newer={parseFloat(row.newer)} 
                                    />
                                  )}
                                </span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Recharts Graph */}
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8">
                  <h3 className="font-orbitron text-white text-xl font-bold mb-6">
                    Blood Value Comparison Chart
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                      data={[
                        { 
                          name: 'TSH', 
                          Earlier: parseFloat(compResult.older.tsh), 
                          Latest: parseFloat(compResult.newer.tsh),
                          normal: 4.0
                        },
                        { 
                          name: 'T3', 
                          Earlier: parseFloat(compResult.older.t3), 
                          Latest: parseFloat(compResult.newer.t3),
                          normal: 2.0
                        },
                        { 
                          name: 'TT4', 
                          Earlier: parseFloat(compResult.older.tt4), 
                          Latest: parseFloat(compResult.newer.tt4),
                          normal: 140
                        },
                        { 
                          name: 'FTI', 
                          Earlier: parseFloat(compResult.older.fti), 
                          Latest: parseFloat(compResult.newer.fti),
                          normal: 155
                        },
                      ]} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#94A3B8', fontFamily: 'Poppins' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis 
                        tick={{ fill: '#94A3B8', fontFamily: 'Poppins' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          fontFamily: 'Poppins',
                          color: 'white'
                        }}
                      />
                      <Legend wrapperStyle={{ fontFamily: 'Poppins', color: '#94A3B8' }} />
                      <Bar dataKey="Earlier" fill="rgba(148,163,184,0.6)" radius={[4,4,0,0]} />
                      <Bar dataKey="Latest" fill="#3B82F6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="font-poppins text-[#94A3B8] text-xs text-center mt-4">
                    Blue bars = Latest diagnosis. Gray bars = Earlier diagnosis.
                  </p>
                </div>

                {/* 3. Health Trend Message */}
                {(() => {
                  const olderPred = compResult.older.prediction;
                  const newPred = compResult.newer.prediction;
                  
                  const getTrend = () => {
                    if (olderPred === newPred) return 'stable';
                    if (newPred === 'Normal') return 'improving';
                    if (olderPred === 'Normal') return 'worsening';
                    return 'changing';
                  };
                  
                  const trend = getTrend();
                  
                  const trendConfig = {
                    improving: {
                      icon: '🎉',
                      color: 'text-[#10B981]',
                      bg: 'bg-[rgba(16,185,129,0.1)] border-[#10B981]',
                      title: 'Great Progress!',
                      message: 'Your thyroid health is showing improvement. Your latest results indicate Normal function. Keep following your treatment plan.'
                    },
                    worsening: {
                      icon: '⚠️',
                      color: 'text-[#EF4444]',
                      bg: 'bg-[rgba(239,68,68,0.1)] border-[#EF4444]',
                      title: 'Attention Needed',
                      message: 'Your latest results show a change from Normal. Please consult your doctor soon for a proper evaluation.'
                    },
                    stable: {
                      icon: '📊',
                      color: 'text-[#3B82F6]',
                      bg: 'bg-[rgba(59,130,246,0.1)] border-[#3B82F6]',
                      title: 'Stable Condition',
                      message: 'Your thyroid levels are consistent between the two diagnoses. Continue monitoring regularly and follow your doctor\'s advice.'
                    },
                    changing: {
                      icon: '🔄',
                      color: 'text-[#F59E0B]',
                      bg: 'bg-[rgba(245,158,11,0.1)] border-[#F59E0B]',
                      title: 'Condition Changed',
                      message: 'Your thyroid condition has changed between these two diagnoses. Please discuss these results with your healthcare provider.'
                    }
                  };
                  
                  const config = trendConfig[trend];
                  
                  return (
                    <div className={`mt-6 p-6 rounded-2xl border ${config.bg}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{config.icon}</span>
                        <h4 className={`font-orbitron font-bold text-lg ${config.color}`}>
                          {config.title}
                        </h4>
                      </div>
                      <p className="font-poppins text-[#94A3B8] text-sm leading-relaxed">
                        {config.message}
                      </p>
                      <p className="font-poppins text-xs text-[#64748B] mt-3">
                        ⚠ This analysis is AI-generated. Always consult a qualified doctor.
                      </p>
                    </div>
                  );
                })()}

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
