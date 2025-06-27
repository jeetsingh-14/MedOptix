import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

const RescheduleRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [reschedulingSuccess, setReschedulingSuccess] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRescheduleRecommendations();
      setRecommendations(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reschedule recommendations:', err);
      setError('Failed to load reschedule recommendations. Please try again later.');
      setLoading(false);
    }
  };

  const handleReschedule = async (id) => {
    // In a real app, this would call an API to reschedule the appointment
    setReschedulingId(id);
    
    // Simulate API call
    setTimeout(() => {
      // Remove the rescheduled appointment from the list
      setRecommendations(recommendations.filter(rec => rec.id !== id));
      setReschedulingId(null);
      setReschedulingSuccess(`Appointment ${id} has been rescheduled successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setReschedulingSuccess(null);
      }, 3000);
    }, 1000);
  };

  // Format confidence score as percentage
  const formatConfidence = (score) => {
    return `${(score * 100).toFixed(1)}%`;
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
        <h1 className="text-2xl font-bold text-gray-900">Rescheduling Recommendations</h1>
        <p className="text-gray-500">AI-powered suggestions for optimal appointment rescheduling</p>
      </div>
      
      {/* Success message */}
      {reschedulingSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 animate-fade-in-out">
          <p>{reschedulingSuccess}</p>
        </div>
      )}
      
      {/* Recommendations table */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Reschedules</h2>
        
        {recommendations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Appointment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recommendations.map((recommendation) => (
                  <tr key={recommendation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {recommendation.original_appointment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recommendation.original_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium text-primary-600">
                        {recommendation.suggested_time}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recommendation.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${recommendation.confidence_score * 100}%` }}
                          ></div>
                        </div>
                        {formatConfidence(recommendation.confidence_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                        onClick={() => handleReschedule(recommendation.id)}
                        disabled={reschedulingId === recommendation.id}
                      >
                        {reschedulingId === recommendation.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Rescheduling...
                          </span>
                        ) : (
                          'Reschedule'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center">
            <p className="text-gray-500">No rescheduling recommendations available at this time.</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={fetchRecommendations}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {/* Information card */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">About Rescheduling Recommendations</h3>
        <p className="text-blue-800 mb-4">
          Our AI analyzes historical data to suggest optimal rescheduling times that:
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-2 mb-4">
          <li>Maximize the likelihood of patient attendance</li>
          <li>Consider doctor availability and workload</li>
          <li>Account for patient preferences and history</li>
          <li>Optimize overall clinic efficiency</li>
        </ul>
        <p className="text-blue-800 text-sm">
          The confidence score indicates the AI's certainty that the suggested time will result in a successful appointment.
        </p>
      </div>
    </div>
  );
};

export default RescheduleRecommendations;