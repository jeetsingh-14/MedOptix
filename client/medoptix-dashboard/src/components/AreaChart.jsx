import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
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

const AreaChart = ({ 
  data, 
  areas, 
  xAxisKey = 'name', 
  title, 
  height = 400,
  colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  stacked = false
}) => {
  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          
          {areas.map((area, index) => (
            <Area 
              key={area.dataKey}
              type="monotone" 
              dataKey={area.dataKey} 
              name={area.name || area.dataKey}
              stroke={area.color || colors[index % colors.length]}
              fill={area.color || colors[index % colors.length]}
              fillOpacity={0.2}
              stackId={stacked ? "1" : index}
              unit={area.unit || ''}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;