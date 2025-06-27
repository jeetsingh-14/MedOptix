import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import Chart from '../components/Chart';
import apiService from '../api/apiService';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart2,
  Users,
  Clock,
  ThumbsUp,
  Activity
} from 'lucide-react';

const Overview = () => {
  const [kpiData, setKpiData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [waitTimeData, setWaitTimeData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard summary data
        const summaryResponse = await apiService.getDashboardSummary();

        // Transform the data for KPI cards
        const transformedData = {
          totalAppointments: summaryResponse.total_appointments,
          showUpRate: summaryResponse.show_up_rate * 100, // Convert to percentage
          noShowRate: summaryResponse.no_show_rate * 100, // Convert to percentage
          highRiskAppointments: summaryResponse.high_risk_appointments,
          abTestWinner: summaryResponse.ab_test_winner
        };

        setKpiData(transformedData);

        // Fetch appointments data
        const appointmentsResponse = await apiService.getAppointmentsByDate();
        setAppointmentsData(appointmentsResponse);

        // Fetch recent alerts
        const alertsResponse = await apiService.getRecentAlerts();
        setRecentAlerts(alertsResponse);

        // Fetch wait time data
        const waitTimeResponse = await apiService.getWaitTimeVsSatisfaction();
        setWaitTimeData(waitTimeResponse);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Key performance indicators and healthcare insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Patients" 
          value={kpiData?.totalAppointments.toLocaleString()} 
          icon={<Users size={18} />}
          trend="up"
          trendValue="5.2%"
          description="vs. last month"
        />
        <DashboardCard 
          title="Avg. Wait Time" 
          value="18.5" 
          unit="min"
          icon={<Clock size={18} />}
          trend="down"
          trendValue="2.3%"
          description="vs. last month"
        />
        <DashboardCard 
          title="Patient Satisfaction" 
          value="4.2" 
          unit="/5"
          icon={<ThumbsUp size={18} />}
          trend="up"
          trendValue="0.3"
          description="vs. last month"
        />
        <DashboardCard 
          title="Alerts Triggered" 
          value={kpiData?.highRiskAppointments.toLocaleString()} 
          icon={<AlertTriangle size={18} />}
          trend="down"
          trendValue="3.5%"
          description="vs. last month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <Chart 
          title="Appointments Trend"
          description="Daily appointment volume over the last 90 days"
          data={appointmentsData} 
          type="area"
          dataKeys={[{ dataKey: 'count', name: 'Appointments' }]}
          xAxisKey="date"
          height={300}
        />

        {/* Wait Time vs Satisfaction Chart */}
        <Chart 
          title="Wait Time vs. Satisfaction"
          description="Correlation between wait times and patient satisfaction"
          data={waitTimeData} 
          type="line"
          dataKeys={[{ dataKey: 'satisfaction', name: 'Satisfaction Score' }]}
          xAxisKey="waitTime"
          height={300}
        />
      </div>

      {/* A/B Test Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart 
            title="A/B Test Performance"
            description="Comparison of different reminder strategies"
            data={[
              { name: 'SMS Reminders', showUp: 85, noShow: 15 },
              { name: 'Email Reminders', showUp: 78, noShow: 22 }
            ]} 
            type="bar"
            dataKeys={[
              { dataKey: 'showUp', name: 'Show-up Rate (%)' },
              { dataKey: 'noShow', name: 'No-show Rate (%)' }
            ]}
            xAxisKey="name"
            height={300}
          />
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-1">
          <DashboardCard 
            title="Recent Alerts"
            className="h-full"
          >
            <div className="mt-4 space-y-4">
              {recentAlerts.map((alert, index) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    alert.risk_level === 'High' 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' 
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.patient_name}</p>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">{alert.appointment_time}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        alert.risk_level === 'High' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' 
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                      }`}>
                        {alert.risk_level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Overview;
