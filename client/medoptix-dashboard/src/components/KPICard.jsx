import React from 'react';

const KPICard = ({ title, value, unit, icon, trend, trendValue }) => {
  // Determine trend color and icon
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    return trend === 'up' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="card flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {icon && <div className="text-primary-500 p-2 bg-primary-50 rounded-full">{icon}</div>}
      </div>
      
      <div className="flex items-baseline mt-1">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-gray-500">{unit}</span>}
      </div>
      
      {trend && trendValue && (
        <div className={`flex items-center mt-4 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm ml-1">{trendValue} from last period</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;