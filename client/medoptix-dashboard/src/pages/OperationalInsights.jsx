import React, { useState, useEffect } from 'react';
import ScatterPlot from '../components/ScatterPlot';
import CorrelationMatrix from '../components/CorrelationMatrix';
import apiService from '../api/apiService';

const OperationalInsights = () => {
  const [waitSatisfactionData, setWaitSatisfactionData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wait time vs satisfaction data
        const waitSatisfactionResponse = await apiService.getWaitTimeVsSatisfaction();
        setWaitSatisfactionData(waitSatisfactionResponse.map(item => ({
          x: item.waitTime,
          y: item.satisfaction
        })));
        
        // Fetch correlation matrix data
        const correlationResponse = await apiService.getCorrelationMatrix();
        setCorrelationData(correlationResponse);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching operational insights:', err);
        setError('Failed to load operational insights. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>{error}</p>
      </div>
    );
  }

  // Calculate regression line for wait time vs satisfaction
  const calculateRegressionLine = () => {
    const n = waitSatisfactionData.length;
    if (n === 0) return null;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    waitSatisfactionData.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumX2 += point.x * point.x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Create regression line points
    const minX = Math.min(...waitSatisfactionData.map(point => point.x));
    const maxX = Math.max(...waitSatisfactionData.map(point => point.x));
    
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  };

  const regressionLine = calculateRegressionLine();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operational Insights</h1>
        <p className="text-gray-500">Key relationships and correlations between operational factors</p>
      </div>
      
      {/* Wait Time vs Satisfaction Scatter Plot */}
      <div className="card">
        <ScatterPlot 
          data={waitSatisfactionData}
          xKey="x"
          yKey="y"
          xLabel="Wait Time (minutes)"
          yLabel="Satisfaction Score (1-5)"
          title="Wait Time vs Patient Satisfaction"
          color="#0ea5e9"
          name="Patient Feedback"
          height={400}
        />
        
        {regressionLine && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Insight:</span> There is a clear negative correlation between wait time and patient satisfaction. 
              For every 10 minute increase in wait time, satisfaction scores decrease by approximately 
              {((regressionLine[1].y - regressionLine[0].y) / (regressionLine[1].x - regressionLine[0].x) * 10).toFixed(2)} points.
            </p>
          </div>
        )}
      </div>
      
      {/* Correlation Matrix */}
      <div className="card mt-6">
        <CorrelationMatrix 
          data={correlationData}
          title="Factor Correlation Matrix"
          factor1Key="factor1"
          factor2Key="factor2"
          correlationKey="correlation"
        />
      </div>
      
      {/* Key Insights */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Key Operational Insights</h3>
        <ul className="space-y-3 text-blue-800">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Wait time has the strongest negative correlation with patient satisfaction (-0.85), making it the most critical factor to address.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Staff-to-patient ratio shows a strong positive correlation with satisfaction (0.72), suggesting that adequate staffing is crucial.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Equipment downtime negatively impacts both wait time (0.51) and satisfaction (-0.68), highlighting the importance of equipment maintenance.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Longer wait times correlate with higher no-show rates (0.58), creating a negative feedback loop that further impacts operational efficiency.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OperationalInsights;