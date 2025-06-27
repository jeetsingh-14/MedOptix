import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
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
        <p className="text-primary-600">
          <span className="font-medium">{payload[0].value}</span> appointments
        </p>
      </div>
    );
  }
  return null;
};

const LineChart = ({ data, dataKey = 'count', xAxisKey = 'date', title, height = 400 }) => {
  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisKey} 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            name="Appointments"
            stroke="#0ea5e9" 
            strokeWidth={2}
            activeDot={{ r: 6 }} 
            dot={{ r: 3 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;