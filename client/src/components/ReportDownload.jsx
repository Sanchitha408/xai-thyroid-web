import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportDownload({ recordId = null, patientData = null, predictionResult = null, elementIdToCapture = '' }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGeneratePdf = async () => {
    if (!patientData || !predictionResult) return;
    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. If elementIdToCapture is provided, capture visual charts
      let chartImgData = null;
      const captureElement = document.getElementById(elementIdToCapture);
      if (captureElement) {
        // Temporarily hide download button during capture to prevent recursion loop
        const dlBtn = captureElement.querySelector('.pdf-hide-btn');
        if (dlBtn) dlBtn.style.opacity = '0';
        
        const canvas = await html2canvas(captureElement, {
          backgroundColor: '#0A0F1E',
          scale: 2,
          logging: false,
          useCORS: true
        });

        if (dlBtn) dlBtn.style.opacity = '1';
        chartImgData = canvas.toDataURL('image/png');
      }

      // 2. Draw nice PDF Header
      doc.setFillColor(10, 15, 30); // #0A0F1E
      doc.rect(0, 0, 210, 297, 'F');

      // Grid Layout styling
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('XAI THYROID DIAGNOSIS REPORT', 15, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // #94A3B8
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 26);
      doc.text(`Record ID: ${recordId || 'Temporary / Guest Session'}`, 15, 31);
      
      doc.setStrokeColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);

      // Patient Data
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('1. Patient Biological Data & Indicators', 15, 45);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(209, 213, 219);
      
      const gridY = 52;
      doc.text(`Age: ${patientData.age} years`, 15, gridY);
      doc.text(`Sex: ${patientData.sex}`, 70, gridY);
      doc.text(`TSH Level: ${patientData.tsh} mIU/L`, 15, gridY + 8);
      doc.text(`T3 Level: ${patientData.t3} nmol/L`, 70, gridY + 8);
      doc.text(`TT4 Level: ${patientData.tt4} nmol/L`, 15, gridY + 16);
      doc.text(`FTI Level: ${patientData.fti}`, 70, gridY + 16);

      // Prediction Results
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('2. AI Diagnostic Prediction', 15, 85);

      doc.setFontSize(12);
      let predColor = [16, 185, 129]; // Success (Green)
      let outcome = predictionResult.prediction || 'Unknown';
      if (outcome.toLowerCase().includes('hypo')) predColor = [239, 68, 68]; // Danger (Red)
      if (outcome.toLowerCase().includes('hyper')) predColor = [245, 158, 11]; // Warning (Orange)

      doc.setTextColor(predColor[0], predColor[1], predColor[2]);
      doc.text(`Outcome Class: ${outcome}`, 15, 93);
      
      doc.setTextColor(209, 213, 219);
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      // Backend returns confidence as 0-100 (percentage) or 0-1 (fraction)
      const confidenceVal = predictionResult.confidence > 1
        ? Math.round(predictionResult.confidence)
        : Math.round(predictionResult.confidence * 100);
      doc.text(`Model Confidence: ${confidenceVal}%`, 15, 100);

      // SHAP & Explainability
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('3. Clinical Narrative & Explanation', 15, 112);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(209, 213, 219);
      const splitText = doc.splitTextToSize(
        predictionResult.explanation || predictionResult.shap_narrative || 'No explainable clinical narrative generated.',
        180
      );
      doc.text(splitText, 15, 120);

      // Embed captured chart canvas if present
      if (chartImgData) {
        doc.addPage();
        doc.setFillColor(10, 15, 30);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.text('4. Visual Model Explanation Charts', 15, 20);
        doc.addImage(chartImgData, 'PNG', 15, 30, 180, 200);
      }

      // Add standard disclaimer on bottom page
      const pageCount = doc.internal.getNumberOfPages();
      doc.setPage(pageCount);
      doc.setStrokeColor(255, 255, 255);
      doc.setLineWidth(0.2);
      doc.line(15, 275, 195, 275);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Disclaimer: This report is generated by an Explainable AI diagnostic tool and does not substitute professional medical guidance.', 15, 280);

      doc.save(`xai_thyroid_report_${recordId || 'guest'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={loading || !patientData || !predictionResult}
      className="btn-primary py-2 px-5 flex items-center justify-center gap-2 text-sm pdf-hide-btn mt-6 w-full md:w-auto"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      <span>{t('result.download')}</span>
    </button>
  );
}
