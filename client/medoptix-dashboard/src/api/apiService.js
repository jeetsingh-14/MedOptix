import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create a separate instance for the real-time API
const realTimeApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create a separate instance for the dashboard API
const dashboardApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock data for development if API is not available
const mockData = {
  // Stream data
  streamAppointments: [
    {
      id: 1,
      appointment_id: 123456,
      patient_id: 7890,
      department: "Cardiology",
      appointment_date: "2023-06-15",
      scheduled_time: "09:30",
      arrival_time: "09:20",
      group_name: "A",
      wait_time_minutes: 15,
      was_seen: 1,
      satisfaction_score: 8,
      comments: "Doctor was very thorough and explained everything well.",
      timestamp: "2023-06-15 09:45:00"
    },
    {
      id: 2,
      appointment_id: 123457,
      patient_id: 7891,
      department: "Neurology",
      appointment_date: "2023-06-15",
      scheduled_time: "10:00",
      arrival_time: "09:50",
      group_name: "B",
      wait_time_minutes: 25,
      was_seen: 1,
      satisfaction_score: 7,
      comments: "Wait time was longer than expected.",
      timestamp: "2023-06-15 10:25:00"
    },
    {
      id: 3,
      appointment_id: 123458,
      patient_id: 7892,
      department: "Pediatrics",
      appointment_date: "2023-06-15",
      scheduled_time: "10:30",
      arrival_time: "10:20",
      group_name: "A",
      wait_time_minutes: 10,
      was_seen: 1,
      satisfaction_score: 9,
      comments: "Great experience overall.",
      timestamp: "2023-06-15 10:40:00"
    }
  ],

  // Overview data
  kpiData: {
    totalAppointments: 12458,
    avgSatisfaction: 4.2,
    avgWaitTime: 18.5
  },
  appointmentsByDate: [
    { date: '2023-01-01', count: 120 },
    { date: '2023-01-02', count: 145 },
    { date: '2023-01-03', count: 132 },
    { date: '2023-01-04', count: 167 },
    { date: '2023-01-05', count: 178 },
    { date: '2023-01-06', count: 156 },
    { date: '2023-01-07', count: 98 },
    { date: '2023-01-08', count: 110 },
    { date: '2023-01-09', count: 145 },
    { date: '2023-01-10', count: 149 },
    // More data points would be added here
  ],

  // A/B Testing data
  abTestingData: {
    groupA: {
      satisfaction: 4.3,
      waitTime: 16.2
    },
    groupB: {
      satisfaction: 4.5,
      waitTime: 14.8
    },
    tTestResults: {
      pValue: 0.032,
      significant: true,
      recommendation: "Group B's approach shows statistically significant improvement in patient satisfaction and reduced wait times. We recommend implementing this approach across all departments."
    }
  },

  // Department Stats data
  departmentData: {
    noShowRates: [
      { department: 'Cardiology', rate: 0.12 },
      { department: 'Dermatology', rate: 0.08 },
      { department: 'Neurology', rate: 0.15 },
      { department: 'Orthopedics', rate: 0.10 },
      { department: 'Pediatrics', rate: 0.05 },
      { department: 'Psychiatry', rate: 0.18 },
      { department: 'Radiology', rate: 0.07 }
    ],
    patientLoadVsStaffing: [
      { department: 'Cardiology', patientLoad: 85, staffing: 75 },
      { department: 'Dermatology', patientLoad: 65, staffing: 70 },
      { department: 'Neurology', patientLoad: 90, staffing: 65 },
      { department: 'Orthopedics', patientLoad: 75, staffing: 80 },
      { department: 'Pediatrics', patientLoad: 60, staffing: 85 },
      { department: 'Psychiatry', patientLoad: 70, staffing: 60 },
      { department: 'Radiology', patientLoad: 50, staffing: 75 }
    ],
    equipmentDowntime: [
      { department: 'Cardiology', downtime: 0.05 },
      { department: 'Dermatology', downtime: 0.02 },
      { department: 'Neurology', downtime: 0.08 },
      { department: 'Orthopedics', downtime: 0.04 },
      { department: 'Pediatrics', downtime: 0.01 },
      { department: 'Psychiatry', downtime: 0.00 },
      { department: 'Radiology', downtime: 0.12 }
    ]
  },

  // Operational Insights data
  operationalData: {
    waitTimeVsSatisfaction: [
      { waitTime: 5, satisfaction: 4.8 },
      { waitTime: 10, satisfaction: 4.5 },
      { waitTime: 15, satisfaction: 4.2 },
      { waitTime: 20, satisfaction: 3.8 },
      { waitTime: 25, satisfaction: 3.5 },
      { waitTime: 30, satisfaction: 3.2 },
      { waitTime: 35, satisfaction: 2.9 },
      { waitTime: 40, satisfaction: 2.7 },
      { waitTime: 45, satisfaction: 2.5 },
      { waitTime: 50, satisfaction: 2.3 }
    ],
    correlationMatrix: [
      { factor1: 'Wait Time', factor2: 'Satisfaction', correlation: -0.85 },
      { factor1: 'Staff Ratio', factor2: 'Satisfaction', correlation: 0.72 },
      { factor1: 'Equipment Downtime', factor2: 'Satisfaction', correlation: -0.68 },
      { factor1: 'Wait Time', factor2: 'No-Show Rate', correlation: 0.58 },
      { factor1: 'Staff Ratio', factor2: 'Wait Time', correlation: -0.65 },
      { factor1: 'Equipment Downtime', factor2: 'Wait Time', correlation: 0.51 }
    ]
  },

  // Recommendations data
  recommendationsData: {
    insights: `
# Key Recommendations

## 1. Reduce Wait Times
Our analysis shows a strong negative correlation (-0.85) between wait times and patient satisfaction. 
For every 10 minutes reduction in wait time, satisfaction scores increase by approximately 0.5 points.

**Action Items:**
- Implement staggered appointment scheduling
- Add self-check-in kiosks to reduce front desk bottlenecks
- Consider extending hours for high-demand departments

## 2. Optimize Staffing
Departments with higher staff-to-patient ratios show significantly better satisfaction scores and lower wait times.

**Action Items:**
- Increase staffing in Neurology and Psychiatry departments
- Implement floating staff model during peak hours
- Review staff allocation based on daily patient volume patterns

## 3. Equipment Maintenance
Radiology has the highest equipment downtime (12%), impacting both wait times and department efficiency.

**Action Items:**
- Schedule preventative maintenance during off-hours
- Establish backup protocols for critical equipment
- Consider equipment upgrades for frequently failing units

## 4. No-Show Reduction Strategy
Psychiatry has the highest no-show rate (18%), representing significant lost revenue and inefficient resource utilization.

**Action Items:**
- Implement SMS appointment reminders 48 and 24 hours before appointments
- Develop a waitlist system to fill cancelled slots
- Consider overbooking strategy based on historical no-show patterns
    `
  }
};

// Flag to determine if we should use mock data
// In a real app, this could be controlled by environment variables
const USE_MOCK_DATA = true;

// Store the last update timestamp
let lastUpdateTimestamp = null;

// API service functions
const apiService = {
  // Dashboard API endpoints
  getDashboardSummary: async () => {
    if (USE_MOCK_DATA) return {
      total_appointments: 12458,
      show_up_rate: 0.82,
      no_show_rate: 0.18,
      high_risk_appointments: 1872,
      ab_test_winner: "SMS Reminders"
    };
    try {
      const response = await dashboardApi.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return null;
    }
  },

  getABTestingResults: async () => {
    if (USE_MOCK_DATA) return {
      variants: [
        {
          name: "SMS Reminders",
          sample_size: 1250,
          show_up_rate: 0.85,
          no_show_rate: 0.15,
          p_value: 0.032,
          result: "Winner"
        },
        {
          name: "Email Reminders",
          sample_size: 1250,
          show_up_rate: 0.78,
          no_show_rate: 0.22,
          p_value: 0.032,
          result: "Control"
        }
      ],
      chart_data: [
        {variant: "SMS Reminders", show_up_rate: 0.85},
        {variant: "Email Reminders", show_up_rate: 0.78}
      ]
    };
    try {
      const response = await dashboardApi.get('/ab-testing/results');
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B testing results:', error);
      return null;
    }
  },

  getPredictedAppointments: async () => {
    if (USE_MOCK_DATA) return Array(10).fill().map((_, i) => ({
      id: 1000 + i,
      patient_name: `Patient ${7000 + i}`,
      appointment_time: `2023-06-${15 + i} 10:00`,
      no_show_probability: Math.random(),
      risk_level: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low"
    }));
    try {
      const response = await dashboardApi.get('/appointments/predicted');
      return response.data;
    } catch (error) {
      console.error('Error fetching predicted appointments:', error);
      return [];
    }
  },

  getRecentAlerts: async () => {
    if (USE_MOCK_DATA) return Array(3).fill().map((_, i) => ({
      id: 2000 + i,
      patient_name: `Patient ${8000 + i}`,
      appointment_time: `2023-06-${15 + i} 14:30`,
      risk_level: "High",
      created_at: new Date(Date.now() - i * 15 * 60000).toISOString()
    }));
    try {
      const response = await dashboardApi.get('/alerts/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      return [];
    }
  },

  getRescheduleRecommendations: async () => {
    if (USE_MOCK_DATA) return Array(5).fill().map((_, i) => ({
      id: 3000 + i,
      original_appointment: `Patient ${9000 + i}`,
      original_time: `2023-06-${15 + i} 11:00`,
      suggested_time: `2023-06-${18 + i} 14:00`,
      doctor: ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Jones"][i % 5],
      confidence_score: 0.7 + Math.random() * 0.25
    }));
    try {
      const response = await dashboardApi.get('/recommendations/reschedule');
      return response.data;
    } catch (error) {
      console.error('Error fetching reschedule recommendations:', error);
      return [];
    }
  },

  logFeedback: async (feedback) => {
    if (USE_MOCK_DATA) return { status: "success", message: "Feedback logged successfully" };
    try {
      const response = await dashboardApi.post('/feedback/log', feedback);
      return response.data;
    } catch (error) {
      console.error('Error logging feedback:', error);
      return { status: "error", message: "Failed to log feedback" };
    }
  },

  getModelStatus: async () => {
    if (USE_MOCK_DATA) return {
      version: "1.2.3",
      last_retrain_date: "2023-06-08",
      f1_score: 0.87,
      data_size: 15420
    };
    try {
      const response = await dashboardApi.get('/model/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching model status:', error);
      return null;
    }
  },

  // Real-time API endpoints
  getLastUpdated: async () => {
    try {
      const response = await realTimeApi.get('/last_updated');
      lastUpdateTimestamp = response.data.timestamp;
      return response.data;
    } catch (error) {
      console.error('Error fetching last updated timestamp:', error);
      return { timestamp: null, formatted: 'Unknown' };
    }
  },

  checkForUpdates: async () => {
    try {
      const response = await realTimeApi.get('/last_updated');
      const newTimestamp = response.data.timestamp;

      // If we have a previous timestamp and it's different, data has been updated
      if (lastUpdateTimestamp && newTimestamp !== lastUpdateTimestamp) {
        lastUpdateTimestamp = newTimestamp;
        return true;
      }

      // Store the timestamp if it's the first check
      if (!lastUpdateTimestamp) {
        lastUpdateTimestamp = newTimestamp;
      }

      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  },

  // Real-time data fetching functions
  fetchAppointments: async () => {
    try {
      const response = await realTimeApi.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  fetchFeedback: async () => {
    try {
      const response = await realTimeApi.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  },

  fetchService: async () => {
    try {
      const response = await realTimeApi.get('/service');
      return response.data;
    } catch (error) {
      console.error('Error fetching service data:', error);
      return [];
    }
  },

  fetchStaff: async () => {
    try {
      const response = await realTimeApi.get('/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff data:', error);
      return [];
    }
  },

  // Original API service functions
  // Overview endpoints
  getKPIData: async () => {
    if (USE_MOCK_DATA) return mockData.kpiData;
    const response = await api.get('/overview/kpi');
    return response.data;
  },

  getAppointmentsByDate: async (days = 90) => {
    if (USE_MOCK_DATA) return mockData.appointmentsByDate;
    const response = await api.get(`/overview/appointments?days=${days}`);
    return response.data;
  },

  // A/B Testing endpoints
  getABTestingData: async () => {
    if (USE_MOCK_DATA) return mockData.abTestingData;
    const response = await api.get('/abtesting');
    return response.data;
  },

  // Department Stats endpoints
  getDepartmentNoShowRates: async () => {
    if (USE_MOCK_DATA) return mockData.departmentData.noShowRates;
    const response = await api.get('/departments/noshow');
    return response.data;
  },

  getPatientLoadVsStaffing: async () => {
    if (USE_MOCK_DATA) return mockData.departmentData.patientLoadVsStaffing;
    const response = await api.get('/departments/staffing');
    return response.data;
  },

  getEquipmentDowntime: async () => {
    if (USE_MOCK_DATA) return mockData.departmentData.equipmentDowntime;
    const response = await api.get('/departments/equipment');
    return response.data;
  },

  // Operational Insights endpoints
  getWaitTimeVsSatisfaction: async () => {
    if (USE_MOCK_DATA) return mockData.operationalData.waitTimeVsSatisfaction;
    const response = await api.get('/operational/satisfaction');
    return response.data;
  },

  getCorrelationMatrix: async () => {
    if (USE_MOCK_DATA) return mockData.operationalData.correlationMatrix;
    const response = await api.get('/operational/correlations');
    return response.data;
  },

  // Recommendations endpoints
  getRecommendations: async () => {
    if (USE_MOCK_DATA) return mockData.recommendationsData;
    const response = await api.get('/recommendations');
    return response.data;
  },

  // Stream appointments endpoint
  getStreamAppointments: async (limit = 10) => {
    if (USE_MOCK_DATA) return mockData.streamAppointments;
    const response = await api.get(`/stream/appointments?limit=${limit}`);
    return response.data;
  }
};

export default apiService;
