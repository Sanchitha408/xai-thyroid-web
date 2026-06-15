import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Calendar, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { getHistory, deleteRecord, getRecord } from '../services/diagnosisService';
import ResultPanel from '../components/ResultPanel';

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail viewer overlay modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await getHistory(page, 10);
      setHistory(result.records || []);
      setTotalPages(result.totalPages || 1);
      setTotalRecords(result.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('dashboard.confirm_delete'))) return;
    try {
      await deleteRecord(id);
      // Reload current page
      if (history.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchHistory();
      }
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleViewDetails = async (record) => {
    setViewLoading(true);
    try {
      const result = await getRecord(record.id);
      const recordData = result.record;
      if (!recordData) {
        throw new Error('Record data is empty');
      }
      setSelectedRecord({
        id: recordData.id,
        prediction: recordData.prediction,
        confidence: recordData.confidence,
        probabilities: recordData.probabilities,
        shap_values: recordData.shap_values,
        shap_narrative: recordData.shap_narrative,
        // Maintain compatibility with components expecting explanation/shap
        explanation: recordData.explanation || recordData.shap_narrative,
        shap: recordData.shap_values
      });
      setSelectedPatientData(recordData.patient_data || {
        tsh: recordData.tsh,
        t3: recordData.t3,
        tt4: recordData.tt4,
        fti: recordData.fti,
        age: recordData.age,
        sex: recordData.sex
      });
      // Scroll to view details dynamically
      setTimeout(() => {
        document.getElementById('dashboard-details-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to load record details:', err);
    } finally {
      setViewLoading(false);
    }
  };

  const getPredictionColorClass = (prediction = '') => {
    const outcome = prediction.toLowerCase();
    if (outcome.includes('normal')) return 'text-success bg-success/10 border-success/30';
    if (outcome.includes('hypo')) return 'text-danger bg-danger/10 border-danger/30';
    return 'text-warning bg-warning/10 border-warning/30';
  };

  return (
    <div className="min-h-screen bg-bg-dark text-secondary pt-28 pb-16 px-6 font-poppins">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Title */}
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="eyebrow flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-primary" />
            <span>HISTORICAL CLINICAL RECORDS</span>
          </span>
          <h1 className="font-orbitron font-extrabold text-3xl md:text-4xl text-white tracking-wide">
            {t('dashboard.heading')}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Manage, review, and delete diagnosis records associated with your account.
          </p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Paginated Records Table */}
          <div className="lg:col-span-7 glass-card p-6 flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="text-primary animate-spin" size={36} />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="text-muted/20 mb-4" size={40} />
                <p className="text-sm text-muted">{t('dashboard.empty')}</p>
                <Link to="/diagnose" className="btn-secondary py-1.5 px-4 text-xs mt-4">
                  {t('dashboard.empty_cta')}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-orbitron tracking-widest text-muted uppercase">
                        <th className="pb-3">{t('dashboard.date')}</th>
                        <th className="pb-3">{t('dashboard.prediction')}</th>
                        <th className="pb-3">{t('dashboard.confidence')}</th>
                        <th className="pb-3 text-right">{t('dashboard.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-bg-glass/10 transition-colors duration-150">
                          <td className="py-4 font-poppins text-xs text-secondary">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold uppercase border ${getPredictionColorClass(record.prediction)}`}>
                              {record.prediction}
                            </span>
                          </td>
                          <td className="py-4 font-orbitron text-xs font-semibold text-secondary">
                            {record.confidence > 1 ? Math.round(record.confidence) : Math.round(record.confidence * 100)}%
                          </td>
                          <td className="py-4 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="btn-ghost p-2 text-muted hover:text-primary transition-colors duration-150"
                              title={t('dashboard.view')}
                              disabled={viewLoading}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="btn-ghost p-2 text-muted hover:text-danger transition-colors duration-150"
                              title={t('dashboard.delete')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                    <span className="text-xs text-muted">
                      {t('dashboard.page')} {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="btn-secondary p-2 rounded-lg text-xs"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="btn-secondary p-2 rounded-lg text-xs"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Record Viewer (Details Panel) */}
          <div id="dashboard-details-section" className="lg:col-span-5 flex flex-col gap-6">
            {viewLoading && (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-bg-card/40 border border-border rounded-2xl p-6 text-center">
                <Loader2 className="text-primary animate-spin" size={32} />
                <p className="text-xs text-muted mt-2 font-poppins">Loading diagnosis report files...</p>
              </div>
            )}

            {!viewLoading && selectedRecord && (
              <ResultPanel
                result={selectedRecord}
                patientData={selectedPatientData}
                recordId={selectedRecord.id}
              />
            )}

            {!viewLoading && !selectedRecord && (
              <div className="flex flex-col items-center justify-center min-h-[350px] border border-dashed border-border rounded-2xl p-6 text-center">
                <Stethoscope size={36} className="text-muted/20 mb-3" />
                <p className="text-xs text-muted font-poppins max-w-[200px]">
                  Click the eye icon next to any diagnosis to display explainability details.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
