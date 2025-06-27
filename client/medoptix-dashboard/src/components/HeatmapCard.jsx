import React from 'react';

// A simple heatmap card component for displaying status with color coding
const HeatmapCard = ({ 
  data, 
  title, 
  valueKey = 'value',
  nameKey = 'name',
  unit = '%',
  colorScale = [
    { threshold: 0.05, color: 'bg-green-100 border-green-300 text-green-800' },
    { threshold: 0.1, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { threshold: Infinity, color: 'bg-red-100 border-red-300 text-red-800' }
  ],
  formatValue = (value) => (value * 100).toFixed(1) + unit
}) => {
  // Function to determine color based on value and color scale
  const getColorClass = (value) => {
    for (const { threshold, color } of colorScale) {
      if (value <= threshold) {
        return color;
      }
    }
    return colorScale[colorScale.length - 1].color;
  };

  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((item, index) => {
          const value = item[valueKey];
          const colorClass = getColorClass(value);
          
          return (
            <div 
              key={index} 
              className={`border rounded-md p-4 ${colorClass} transition-colors`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{item[nameKey]}</h4>
                <span className="text-lg font-semibold">{formatValue(value)}</span>
              </div>
              
              {/* Visual indicator bar */}
              <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-current opacity-60" 
                  style={{ width: `${Math.min(value * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapCard;