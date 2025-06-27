import React from 'react';

const CorrelationMatrix = ({ 
  data, 
  title, 
  factor1Key = 'factor1', 
  factor2Key = 'factor2', 
  correlationKey = 'correlation' 
}) => {
  // Function to determine color based on correlation value
  const getColorClass = (value) => {
    const absValue = Math.abs(value);
    
    if (absValue >= 0.7) {
      return value >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
    } else if (absValue >= 0.4) {
      return value >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600';
    } else {
      return 'bg-gray-50 text-gray-600';
    }
  };

  // Function to get a descriptive label for the correlation strength
  const getCorrelationLabel = (value) => {
    const absValue = Math.abs(value);
    
    if (absValue >= 0.7) {
      return value >= 0 ? 'Strong Positive' : 'Strong Negative';
    } else if (absValue >= 0.4) {
      return value >= 0 ? 'Moderate Positive' : 'Moderate Negative';
    } else if (absValue >= 0.2) {
      return value >= 0 ? 'Weak Positive' : 'Weak Negative';
    } else {
      return 'No Correlation';
    }
  };

  return (
    <div className="card h-full">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factor 1
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factor 2
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correlation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strength
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const correlation = item[correlationKey];
              const colorClass = getColorClass(correlation);
              const label = getCorrelationLabel(correlation);
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item[factor1Key]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item[factor2Key]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                      {correlation.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Interpretation:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-blue-800 font-medium">Strong Positive (≥0.7):</span> As one factor increases, the other strongly increases</li>
          <li><span className="text-red-800 font-medium">Strong Negative (≤-0.7):</span> As one factor increases, the other strongly decreases</li>
          <li><span className="text-blue-600 font-medium">Moderate Positive (0.4-0.7):</span> As one factor increases, the other moderately increases</li>
          <li><span className="text-red-600 font-medium">Moderate Negative (-0.4 to -0.7):</span> As one factor increases, the other moderately decreases</li>
          <li><span className="text-gray-600 font-medium">Weak or No Correlation (-0.4 to 0.4):</span> Little to no relationship between factors</li>
        </ul>
      </div>
    </div>
  );
};

export default CorrelationMatrix;