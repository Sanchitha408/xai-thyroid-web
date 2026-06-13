import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';

export default function ShapChart({ shapValues = [] }) {
  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-xl">
        <span className="text-sm font-poppins text-muted">SHAP data unavailable.</span>
      </div>
    );
  }

  // Format data for chart
  const data = shapValues.map((item) => ({
    name: item.feature,
    value: item.shap_value,
    patientVal: item.value,
    displayName: `${item.feature} (${item.value})`
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const direction = data.value > 0 ? 'pushed toward prediction' : 'pushed away from prediction';
      return (
        <div className="bg-bg-card border border-border p-3 rounded-lg shadow-card font-poppins text-xs">
          <p className="font-semibold text-secondary">{data.name}</p>
          <p className="text-muted mt-1">
            Patient value: <span className="text-white font-medium">{data.patientVal}</span>
          </p>
          <p className="text-muted">
            SHAP value: <span className="text-white font-medium">{data.value.toFixed(4)}</span>
          </p>
          <p className={`mt-1 font-medium ${data.value > 0 ? 'text-danger' : 'text-primary'}`}>
            {direction}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 font-poppins">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            type="number"
            stroke="#94A3B8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="displayName"
            type="category"
            stroke="#94A3B8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value > 0 ? '#EF4444' : '#3B82F6'} // Red if positive impact, Blue if negative
                className="shap-bar"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-[10px] text-muted font-orbitron tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-danger rounded" />
          <span>POSITIONS TOWARD CONDITION</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-primary rounded" />
          <span>REDUCES LIKELIHOOD</span>
        </div>
      </div>
    </div>
  );
}
