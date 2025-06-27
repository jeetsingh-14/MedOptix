import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import LineChart from '../components/LineChart';

const ModelMonitoring = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  useEffect(() => {
    fetchModelStatus();
    generatePerformanceHistory();
  }, []);

  const fetchModelStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getModelStatus();
      setModelStatus(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching model status:', err);
      setError('Failed to load model status. Please try again later.');
      setLoading(false);
    }
  };

  // Generate mock performance history data
  const generatePerformanceHistory = () => {
    const history = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate a slightly increasing F1 score with some random variation
      const baseF1 = 0.82 + (30 - i) * 0.002;
      const f1Score = Math.min(0.95, baseF1 + (Math.random() * 0.02 - 0.01));
      
      history.push({
        date: date.toISOString().split('T')[0],
        f1Score: f1Score,
        precision: f1Score + (Math.random() * 0.05 - 0.025),
        recall: f1Score + (Math.random() * 0.05 - 0.025)
      });
    }
    
    setPerformanceHistory(history);
  };

  // Format date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Monitoring</h1>
        <p className="text-gray-500">Track the performance of our no-show prediction model</p>
      </div>
      
      {/* Model Status Card */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Model Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Model Version</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{modelStatus.version}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Last Retrained</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatDate(modelStatus.last_retrain_date)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">F1 Score</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{modelStatus.f1_score.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Training Data Size</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{modelStatus.data_size.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Performance History Chart */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance History (Last 30 Days)</h2>
        
        <div className="h-80">
          <LineChart 
            data={performanceHistory}
            dataKeys={[
              { dataKey: 'f1Score', name: 'F1 Score', color: '#0ea5e9' },
              { dataKey: 'precision', name: 'Precision', color: '#8b5cf6' },
              { dataKey: 'recall', name: 'Recall', color: '#10b981' }
            ]}
            xAxisDataKey="date"
            yAxisDomain={[0.7, 1]}
          />
        </div>
      </div>
      
      {/* Feature Importance */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Importance</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Previous No-Shows</span>
              <span className="text-sm text-gray-500">0.32</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '32%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Appointment Lead Time</span>
              <span className="text-sm text-gray-500">0.28</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Patient Age</span>
              <span className="text-sm text-gray-500">0.15</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Appointment Time of Day</span>
              <span className="text-sm text-gray-500">0.12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Weather Conditions</span>
              <span className="text-sm text-gray-500">0.08</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '8%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Model Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">About Our Model</h3>
        <p className="text-blue-800 mb-4">
          Our no-show prediction model uses a gradient boosting algorithm trained on historical appointment data. The model is retrained monthly with new data to ensure optimal performance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-md font-medium text-blue-900 mb-2">Model Architecture</h4>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Algorithm: XGBoost</li>
              <li>Hyperparameters: Optimized via cross-validation</li>
              <li>Features: 24 patient and appointment attributes</li>
              <li>Target: Binary classification (show/no-show)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-medium text-blue-900 mb-2">Evaluation Metrics</h4>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>F1 Score: {modelStatus.f1_score.toFixed(2)}</li>
              <li>Precision: 0.89</li>
              <li>Recall: 0.85</li>
              <li>AUC-ROC: 0.92</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelMonitoring;