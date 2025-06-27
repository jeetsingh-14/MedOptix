import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ZAxis,
  Label
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        {payload.map((entry, index) => (
          <div key={`item-${index}`}>
            <p className="font-medium text-gray-900">{entry.name}</p>
            <p style={{ color: entry.color }}>
              <span className="font-medium">X: </span>
              {entry.payload.x}
              {entry.unit && ` ${entry.unit}`}
            </p>
            <p style={{ color: entry.color }}>
              <span className="font-medium">Y: </span>
              {entry.payload.y}
              {entry.unit && ` ${entry.unit}`}
            </p>
            {entry.payload.z && (
              <p style={{ color: entry.color }}>
                <span className="font-medium">Size: </span>
                {entry.payload.z}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ScatterPlot = ({ 
  data, 
  xKey = 'x', 
  yKey = 'y', 
  zKey,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  title, 
  height = 400,
  color = '#0ea5e9',
  name = 'Data Points'
}) => {
  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey} 
            type="number" 
            name={xLabel}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          >
            <Label value={xLabel} position="bottom" offset={20} style={{ fontSize: 12, fill: '#6b7280' }} />
          </XAxis>
          <YAxis 
            dataKey={yKey} 
            type="number" 
            name={yLabel}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          >
            <Label value={yLabel} angle={-90} position="left" offset={-25} style={{ fontSize: 12, fill: '#6b7280' }} />
          </YAxis>
          {zKey && <ZAxis dataKey={zKey} range={[50, 400]} />}
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Scatter 
            name={name} 
            data={data} 
            fill={color}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlot;