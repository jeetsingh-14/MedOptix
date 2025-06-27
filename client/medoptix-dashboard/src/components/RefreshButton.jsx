import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

/**
 * RefreshButton component for manually refreshing data and displaying last update time
 * Also handles auto-refresh polling
 */
const RefreshButton = ({ onRefresh, pollingInterval = 30000 }) => {
  const [lastUpdated, setLastUpdated] = useState('Unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Function to fetch the last updated timestamp
  const fetchLastUpdated = async () => {
    const data = await apiService.getLastUpdated();
    setLastUpdated(data.formatted);
  };

  // Function to handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger the onRefresh callback to refresh data
      if (onRefresh) {
        await onRefresh();
      }
      
      // Update the last updated timestamp
      await fetchLastUpdated();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to check for updates and refresh if needed
  const checkForUpdates = async () => {
    if (!autoRefresh) return;
    
    try {
      const hasUpdates = await apiService.checkForUpdates();
      
      if (hasUpdates) {
        console.log('Data has been updated, refreshing...');
        
        // Trigger the onRefresh callback to refresh data
        if (onRefresh) {
          await onRefresh();
        }
        
        // Update the last updated timestamp
        await fetchLastUpdated();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  // Set up polling for auto-refresh
  useEffect(() => {
    // Fetch the initial last updated timestamp
    fetchLastUpdated();
    
    // Set up polling interval
    const intervalId = setInterval(checkForUpdates, pollingInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [pollingInterval, autoRefresh]);

  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-100 rounded-md">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`px-4 py-2 rounded-md text-white ${
          isRefreshing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="autoRefresh" className="text-sm text-gray-600">
          Auto-refresh:
        </label>
        <input
          id="autoRefresh"
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-500"
        />
      </div>
      
      <div className="text-sm text-gray-600">
        Last updated: <span className="font-medium">{lastUpdated}</span>
      </div>
    </div>
  );
};

export default RefreshButton;