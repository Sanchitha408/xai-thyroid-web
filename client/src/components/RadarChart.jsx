import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';

export default function RadarChart({ patientData = null }) {
  if (!patientData) return null;

  // Normal ranges for reference:
  // TSH: 0.4 - 4.0
  // T3: 0.8 - 2.0
  // TT4: 60 - 140
  // FTI: 65 - 155
  // Age: 18 - 80 (just for normalized representation)
  
  // Normalize patient and baseline values to a 0-100 scale for visual plotting consistency
  const normalize = (val, normalMin, normalMax) => {
    const minVal = normalMin * 0.1; // lower baseline
    const maxVal = normalMax * 1.8; // upper baseline
    const ratio = (val - minVal) / (maxVal - minVal);
    return Math.min(Math.max(Math.round(ratio * 100), 0), 100);
  };

  const chartData = [
    {
      subject: 'TSH Level',
      Patient: normalize(patientData.tsh, 0.4, 4.0),
      Healthy: normalize(2.0, 0.4, 4.0),
      rawPatient: `${patientData.tsh} mIU/L`,
      rawHealthy: '0.4 - 4.0 mIU/L'
    },
    {
      subject: 'T3 Level',
      Patient: normalize(patientData.t3, 0.8, 2.0),
      Healthy: normalize(1.4, 0.8, 2.0),
      rawPatient: `${patientData.t3} nmol/L`,
      rawHealthy: '0.8 - 2.0 nmol/L'
    },
    {
      subject: 'TT4 Level',
      Patient: normalize(patientData.tt4, 60, 140),
      Healthy: normalize(100, 60, 140),
      rawPatient: `${patientData.tt4} nmol/L`,
      rawHealthy: '60 - 140 nmol/L'
    },
    {
      subject: 'FTI Index',
      Patient: normalize(patientData.fti, 65, 155),
      Healthy: normalize(110, 65, 155),
      rawPatient: `${patientData.fti}`,
      rawHealthy: '65 - 155'
    },
    {
      subject: 'Age Factor',
      Patient: normalize(patientData.age, 18, 80),
      Healthy: normalize(45, 18, 80),
      rawPatient: `${patientData.age} yrs`,
      rawHealthy: '-'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-card border border-border p-3 rounded-lg shadow-card font-poppins text-xs flex flex-col gap-1">
          <p className="font-semibold text-secondary">{data.subject}</p>
          <p className="text-primary">
            Patient: <span className="font-semibold text-white">{data.rawPatient}</span>
          </p>
          <p className="text-success">
            Normal bounds: <span className="font-medium text-white">{data.rawHealthy}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 font-poppins">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Normal limits polygon overlay */}
          <Radar
            name="Healthy Range Target"
            dataKey="Healthy"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.15}
          />
          {/* Actual patient values overlay */}
          <Radar
            name="Patient Blood Profile"
            dataKey="Patient"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.35}
          />
          
          <Legend
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 10, fontFamily: 'Orbitron', letterSpacing: '0.05em', color: '#94A3B8' }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
