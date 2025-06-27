import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Chart from '../components/Chart';
import DashboardCard from '../components/DashboardCard';
import apiService from '../api/apiService';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ThumbsUp, 
  BarChart2, 
  PieChart,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

const FeedbackLoop = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'analytics'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch past appointments with predictions
      // For now, we'll generate mock data
      const mockAppointments = Array(10).fill().map((_, i) => {
        const wasNoShow = Math.random() > 0.7;
        const predictedNoShow = Math.random() > 0.6;
        return {
          id: 5000 + i,
          patient_name: `Patient ${6000 + i}`,
          department: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology'][i % 5],
          appointment_time: `2023-06-${1 + i} 10:00`,
          predicted: predictedNoShow ? 'No-Show' : 'Show',
          actual: wasNoShow ? 'No-Show' : 'Show',
          is_correct: predictedNoShow === wasNoShow,
          feedback_submitted: i < 3, // First 3 already have feedback
          confidence: Math.round(Math.random() * 100)
        };
      });

      setAppointments(mockAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
      setLoading(false);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id 
        ? { ...appointment, is_correct: value } 
        : appointment
    ));
  };

  const handleSubmitFeedback = async (id) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    setSubmittingFeedback(true);

    try {
      // Call the API to log feedback
      await apiService.logFeedback({
        appointment_id: appointment.id,
        prediction: appointment.predicted,
        actual: appointment.actual,
        is_correct: appointment.is_correct
      });

      // Update the appointment to show feedback was submitted
      setAppointments(appointments.map(a => 
        a.id === id 
          ? { ...a, feedback_submitted: true } 
          : a
      ));

      setFeedbackStatus({
        type: 'success',
        message: 'Feedback submitted successfully!'
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFeedbackStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackStatus({
        type: 'error',
        message: 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Calculate feedback statistics
  const calculateStats = () => {
    const total = appointments.length;
    const feedbackSubmitted = appointments.filter(a => a.feedback_submitted).length;
    const correctPredictions = appointments.filter(a => a.is_correct).length;
    const accuracy = total > 0 ? (correctPredictions / total) * 100 : 0;

    return {
      total,
      feedbackSubmitted,
      correctPredictions,
      accuracy: accuracy.toFixed(1)
    };
  };

  const stats = calculateStats();

  // Prepare data for charts
  const departmentData = appointments.reduce((acc, appointment) => {
    const dept = appointment.department;
    if (!acc[dept]) {
      acc[dept] = { total: 0, correct: 0 };
    }
    acc[dept].total += 1;
    if (appointment.is_correct) {
      acc[dept].correct += 1;
    }
    return acc;
  }, {});

  const departmentChartData = Object.keys(departmentData).map(dept => ({
    name: dept,
    accuracy: departmentData[dept].total > 0 
      ? (departmentData[dept].correct / departmentData[dept].total) * 100 
      : 0
  }));

  const predictionTypeData = [
    { 
      name: 'Show', 
      count: appointments.filter(a => a.predicted === 'Show').length 
    },
    { 
      name: 'No-Show', 
      count: appointments.filter(a => a.predicted === 'No-Show').length 
    }
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">Help improve our prediction model by providing feedback</p>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'appointments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appointments')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Appointments
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Feedback status message */}
      {feedbackStatus && (
        <div className={cn(
          "border rounded-md p-4 animate-in fade-in-50 duration-300",
          feedbackStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        )}>
          <p>{feedbackStatus.message}</p>
        </div>
      )}

      {activeTab === 'appointments' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <DashboardCard 
              title="Total Appointments" 
              value={stats.total} 
              icon={<MessageSquare size={18} />}
            />
            <DashboardCard 
              title="Feedback Submitted" 
              value={stats.feedbackSubmitted} 
              icon={<ThumbsUp size={18} />}
              description={`${((stats.feedbackSubmitted / stats.total) * 100).toFixed(0)}% of total`}
            />
            <DashboardCard 
              title="Correct Predictions" 
              value={stats.correctPredictions} 
              icon={<CheckCircle size={18} />}
              description={`${((stats.correctPredictions / stats.total) * 100).toFixed(0)}% of total`}
            />
            <DashboardCard 
              title="Model Accuracy" 
              value={stats.accuracy} 
              unit="%"
              icon={<BarChart2 size={18} />}
              trend={parseFloat(stats.accuracy) > 80 ? 'up' : 'down'}
              trendValue={parseFloat(stats.accuracy) > 80 ? 'Good' : 'Needs Improvement'}
            />
          </div>

          {/* Appointments table */}
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Review and provide feedback on prediction accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Appointment Time</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Predicted</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Actual</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Correct?</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="py-3 px-4 text-sm font-medium">
                          {appointment.patient_name}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {appointment.department}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {appointment.appointment_time}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full flex items-center",
                              appointment.predicted === 'No-Show' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            )}>
                              {appointment.predicted === 'No-Show' ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                              {appointment.predicted}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">{appointment.confidence}% confidence</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full flex items-center",
                            appointment.actual === 'No-Show' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          )}>
                            {appointment.actual === 'No-Show' ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                            {appointment.actual}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {appointment.feedback_submitted ? (
                            <span className={cn(
                              "text-sm",
                              appointment.is_correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {appointment.is_correct ? 'Yes' : 'No'}
                            </span>
                          ) : (
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={appointment.is_correct ? 'yes' : 'no'}
                              onChange={(e) => handleFeedbackChange(appointment.id, e.target.value === 'yes')}
                              disabled={appointment.feedback_submitted}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {appointment.feedback_submitted ? (
                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Submitted
                            </span>
                          ) : (
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleSubmitFeedback(appointment.id)}
                              disabled={submittingFeedback}
                            >
                              {submittingFeedback ? 'Submitting...' : 'Submit'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <>
          {/* Analytics View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart 
              title="Prediction Accuracy by Department"
              description="How well our model performs across different departments"
              data={departmentChartData} 
              type="bar"
              dataKeys={[{ dataKey: 'accuracy', name: 'Accuracy (%)' }]}
              xAxisKey="name"
              height={300}
            />

            <Chart 
              title="Prediction Distribution"
              description="Breakdown of show vs no-show predictions"
              data={predictionTypeData} 
              type="pie"
              dataKeys={[{ dataKey: 'count', name: 'Count' }]}
              xAxisKey="name"
              height={300}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance Insights</CardTitle>
              <CardDescription>Key findings from feedback analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 text-primary">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="font-medium">Neurology Department Needs Attention</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prediction accuracy in the Neurology department is 15% lower than other departments. Consider collecting more data or adjusting model parameters.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 text-primary">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-medium">High Confidence in Cardiology</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Predictions for Cardiology appointments have 92% accuracy with high confidence scores. The model is performing exceptionally well in this department.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 text-primary">
                  <PieChart size={16} />
                </div>
                <div>
                  <h4 className="font-medium">Balanced Prediction Distribution</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    The model is making a balanced number of show vs no-show predictions, indicating it's not biased toward either outcome.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Feedback Report
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Information card */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-300">Why Your Feedback Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 dark:text-blue-300 mb-4">
            Your feedback helps us continuously improve our prediction model. By confirming whether our predictions were correct, you're providing valuable data that helps:
          </p>
          <ul className="space-y-2">
            {[
              "Improve prediction accuracy for future appointments",
              "Identify patterns that lead to no-shows",
              "Develop better intervention strategies",
              "Reduce overall no-show rates"
            ].map((item, index) => (
              <li key={index} className="flex items-start space-x-2 text-blue-800 dark:text-blue-300">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackLoop;
