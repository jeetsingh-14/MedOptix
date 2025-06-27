import React, { useState, useEffect } from 'react';
import BarChart from '../components/BarChart';
import AreaChart from '../components/AreaChart';
import HeatmapCard from '../components/HeatmapCard';
import apiService from '../api/apiService';

const DepartmentStats = () => {
  const [noShowRates, setNoShowRates] = useState([]);
  const [patientLoadVsStaffing, setPatientLoadVsStaffing] = useState([]);
  const [equipmentDowntime, setEquipmentDowntime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch no-show rates
        const noShowResponse = await apiService.getDepartmentNoShowRates();
        setNoShowRates(noShowResponse);
        
        // Fetch patient load vs staffing
        const staffingResponse = await apiService.getPatientLoadVsStaffing();
        setPatientLoadVsStaffing(staffingResponse);
        
        // Fetch equipment downtime
        const downtimeResponse = await apiService.getEquipmentDowntime();
        setEquipmentDowntime(downtimeResponse);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching department stats:', err);
        setError('Failed to load department statistics. Please try again later.');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Department Statistics</h1>
        <p className="text-gray-500">Performance metrics by department</p>
      </div>
      
      {/* No-Show Rates Bar Chart */}
      <div className="card">
        <BarChart 
          data={noShowRates} 
          dataKeys={[{ dataKey: 'rate', name: 'No-Show Rate', unit: '%' }]} 
          xAxisKey="department"
          title="No-Show Rate by Department"
          layout="vertical"
          showLabels={true}
          height={350}
        />
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-medium">Insight:</span> Psychiatry has the highest no-show rate at {(noShowRates.find(d => d.department === 'Psychiatry')?.rate * 100).toFixed(1)}%, 
            while Pediatrics has the lowest at {(noShowRates.find(d => d.department === 'Pediatrics')?.rate * 100).toFixed(1)}%.
          </p>
        </div>
      </div>
      
      {/* Patient Load vs Staffing Area Chart */}
      <div className="card">
        <AreaChart 
          data={patientLoadVsStaffing} 
          areas={[
            { dataKey: 'patientLoad', name: 'Patient Load', color: '#0ea5e9' },
            { dataKey: 'staffing', name: 'Staffing Level', color: '#8b5cf6' }
          ]} 
          xAxisKey="department"
          title="Patient Load vs Staffing Level by Department"
          height={350}
        />
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-medium">Insight:</span> Neurology has the highest patient load relative to staffing, 
            indicating potential resource constraints. Pediatrics and Orthopedics have staffing levels that exceed patient load.
          </p>
        </div>
      </div>
      
      {/* Equipment Downtime Heatmap */}
      <div className="card">
        <HeatmapCard 
          data={equipmentDowntime.map(item => ({
            name: item.department,
            value: item.downtime
          }))} 
          title="Equipment Downtime by Department"
          valueKey="value"
          nameKey="name"
          unit="%"
        />
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-medium">Insight:</span> Radiology has the highest equipment downtime at {(equipmentDowntime.find(d => d.department === 'Radiology')?.downtime * 100).toFixed(1)}%, 
            which may be impacting patient throughput and wait times. Psychiatry has no equipment downtime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStats;