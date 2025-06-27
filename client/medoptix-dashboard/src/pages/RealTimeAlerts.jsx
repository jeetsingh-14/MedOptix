import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import DashboardCard from '../components/DashboardCard';
import apiService from '../api/apiService';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Calendar, 
  RefreshCw, 
  UserRound, 
  ShieldAlert,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const RealTimeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const alertCountRef = useRef(0);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'high', 'medium'

  // Fetch alerts on initial load
  useEffect(() => {
    fetchAlerts();

    // Set up polling every 60 seconds
    const intervalId = setInterval(() => {
      fetchAlerts();
    }, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRecentAlerts();

      // Add department and status for demo purposes
      const enhancedAlerts = response.map(alert => ({
        ...alert,
        department: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology'][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.3 ? 'Open' : 'Resolved'
      }));

      // Check if there are new alerts
      if (alertCountRef.current > 0 && enhancedAlerts.length > alertCountRef.current) {
        setNewAlertCount(enhancedAlerts.length - alertCountRef.current);
      }

      // Update the alert count reference
      alertCountRef.current = enhancedAlerts.length;

      setAlerts(enhancedAlerts);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again later.');
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Reset new alert count when opening the dropdown
      setNewAlertCount(0);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  // Filter alerts based on current filter status
  const filteredAlerts = filterStatus === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.risk_level.toLowerCase() === filterStatus);

  // Calculate alert statistics
  const alertStats = {
    total: alerts.length,
    high: alerts.filter(alert => alert.risk_level === 'High').length,
    medium: alerts.filter(alert => alert.risk_level === 'Medium').length,
    open: alerts.filter(alert => alert.status === 'Open').length,
    resolved: alerts.filter(alert => alert.status === 'Resolved').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            High-risk appointments requiring attention
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBellClick}
            className="relative"
          >
            <Bell className="h-5 w-5" />

            {/* Alert count badge */}
            {newAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {newAlertCount}
              </span>
            )}
          </Button>

          {/* Dropdown menu */}
          {showDropdown && (
            <Card className="absolute right-0 mt-2 w-80 z-50">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto p-0">
                {loading ? (
                  <div className="p-4 text-center">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading alerts...</p>
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="py-2">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="px-4 py-3 hover:bg-accent">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center",
                              alert.risk_level === 'High' 
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            )}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium">
                              {alert.patient_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {alert.appointment_time}
                            </p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                alert.risk_level === 'High' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              )}>
                                {alert.risk_level} Risk
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(alert.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No recent alerts</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between py-2 px-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min(alerts.length, 5)} of {alerts.length} alerts
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={fetchAlerts}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Refresh
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardCard 
          title="Total Alerts" 
          value={alertStats.total} 
          icon={<Bell size={18} />}
        />
        <DashboardCard 
          title="High Risk" 
          value={alertStats.high} 
          icon={<AlertTriangle size={18} />}
          trend={alertStats.high > 0 ? 'up' : 'neutral'}
          trendValue={alertStats.high > 0 ? 'Needs attention' : 'None'}
        />
        <DashboardCard 
          title="Medium Risk" 
          value={alertStats.medium} 
          icon={<ShieldAlert size={18} />}
        />
        <DashboardCard 
          title="Open" 
          value={alertStats.open} 
          icon={<Clock size={18} />}
          description="Awaiting action"
        />
        <DashboardCard 
          title="Resolved" 
          value={alertStats.resolved} 
          icon={<CheckCircle size={18} />}
          description="Successfully handled"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
        >
          All Alerts
        </Button>
        <Button 
          variant={filterStatus === 'high' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('high')}
          className="text-red-600 dark:text-red-400"
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          High Risk
        </Button>
        <Button 
          variant={filterStatus === 'medium' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('medium')}
          className="text-amber-600 dark:text-amber-400"
        >
          <ShieldAlert className="mr-1 h-4 w-4" />
          Medium Risk
        </Button>
        <Button 
          variant="outline"
          className="ml-auto"
          onClick={fetchAlerts}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle>High-Risk Appointments</CardTitle>
          <CardDescription>
            Patients with high probability of no-show requiring intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4">
              <p>{error}</p>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Appointment</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Flagged</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className={alert.status === 'Resolved' ? 'bg-muted/30' : ''}>
                      <td className="py-3 px-4 text-sm font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {alert.patient_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {alert.department}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {alert.appointment_time}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit",
                          alert.risk_level === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        )}>
                          {alert.risk_level === 'High' ? <AlertTriangle className="mr-1 h-3 w-3" /> : <ShieldAlert className="mr-1 h-3 w-3" />}
                          {alert.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit",
                          alert.status === 'Open' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        )}>
                          {alert.status === 'Open' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {getTimeAgo(alert.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Phone className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Contact</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Reschedule</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filterStatus !== 'all' 
                  ? `No ${filterStatus} risk alerts currently. Try changing your filter.` 
                  : 'No high-risk appointments flagged in the last hour.'}
              </p>
              <Button 
                className="mt-4"
                onClick={fetchAlerts}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Alerts
              </Button>
            </div>
          )}
        </CardContent>
        {filteredAlerts.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Automated Messaging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send automated reminders to patients with high no-show risk.
            </p>
            <Button className="w-full">
              Send Batch Reminders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Phone className="mr-2 h-5 w-5 text-primary" />
              Contact Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Assign alerts to contact center staff for follow-up calls.
            </p>
            <Button className="w-full">
              Assign to Staff
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Reschedule Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate optimal reschedule options for high-risk appointments.
            </p>
            <Button className="w-full">
              Generate Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAlerts;
