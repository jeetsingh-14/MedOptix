import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}: </span>
            {entry.value}
            {entry.unit && ` ${entry.unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChart = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'name', 
  title, 
  height = 400,
  colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  layout = 'vertical',
  showLabels = false,
  unit = ''
}) => {
  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={layout === 'vertical' ? null : xAxisKey}
            type={layout === 'vertical' ? 'number' : 'category'}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            dataKey={layout === 'vertical' ? xAxisKey : null}
            type={layout === 'vertical' ? 'category' : 'number'}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            width={layout === 'vertical' ? 150 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          
          {dataKeys.map((key, index) => (
            <Bar 
              key={key.dataKey}
              dataKey={key.dataKey} 
              name={key.name || key.dataKey}
              fill={key.color || colors[index % colors.length]}
              unit={key.unit || unit}
              radius={[4, 4, 0, 0]}
            >
              {showLabels && (
                <LabelList 
                  dataKey={key.dataKey} 
                  position={layout === 'vertical' ? 'right' : 'top'} 
                  style={{ fontSize: 11, fill: '#374151' }}
                  formatter={(value) => `${value}${key.unit || unit}`}
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;