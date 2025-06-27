import React, { useState, useEffect } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import apiService from '../api/apiService';

const Recommendations = () => {
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getRecommendations();
        setRecommendationsData(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDownload = () => {
    // Create a blob with the markdown content
    const blob = new Blob([recommendationsData.insights], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medoptix_recommendations.md';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-500">Strategic recommendations based on data analysis</p>
        </div>
        
        <button 
          onClick={handleDownload}
          className="btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Report
        </button>
      </div>
      
      <div className="card">
        <div className="prose max-w-none">
          <MarkdownRenderer markdown={recommendationsData?.insights} />
        </div>
      </div>
      
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Implementation Priority</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-blue-800 mr-2">High Priority:</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <p className="text-sm text-blue-800">Reduce wait times through staggered scheduling and self-check-in kiosks</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-blue-800 mr-2">Medium Priority:</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <p className="text-sm text-blue-800">Optimize staffing in Neurology and Psychiatry departments</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-blue-800 mr-2">Medium Priority:</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <p className="text-sm text-blue-800">Implement preventative maintenance for Radiology equipment</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-blue-800 mr-2">Lower Priority:</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <p className="text-sm text-blue-800">Develop SMS appointment reminder system for no-show reduction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;