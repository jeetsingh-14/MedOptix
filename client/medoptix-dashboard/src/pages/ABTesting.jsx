import React, { useState, useEffect } from 'react';
import Chart from '../components/Chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import apiService from '../api/apiService';
import { BarChart2, CheckCircle, AlertTriangle, Info, ArrowRight, BarChart } from 'lucide-react';

const ABTesting = () => {
  const [abData, setAbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('comparison'); // 'comparison' or 'details'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the new A/B testing results endpoint
        const response = await apiService.getABTestingResults();
        setAbData(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching A/B testing data:', err);
        setError('Failed to load A/B testing data. Please try again later.');
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

  // Prepare data for charts
  const showUpRateData = abData.chart_data.map(item => ({
    name: item.variant,
    showUpRate: item.show_up_rate * 100 // Convert to percentage
  }));

  // Prepare data for comparison chart
  const comparisonData = abData.variants.map(variant => ({
    name: variant.name,
    showUp: variant.show_up_rate * 100,
    noShow: variant.no_show_rate * 100,
    sampleSize: variant.sample_size
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">A/B Testing</h1>
          <p className="text-muted-foreground">Compare different reminder strategies to reduce no-shows</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Comparison</span>
          <Switch 
            checked={activeView === 'details'} 
            onCheckedChange={() => setActiveView(activeView === 'comparison' ? 'details' : 'comparison')}
          />
          <span className="text-sm font-medium">Details</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Winner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{abData.variants.find(v => v.result === 'Winner')?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Statistically significant improvement</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                <CheckCircle size={18} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Show-up Rate Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">+7%</p>
                <p className="text-xs text-muted-foreground mt-1">Compared to control group</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BarChart2 size={18} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statistical Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">96.8%</p>
                <p className="text-xs text-muted-foreground mt-1">p-value: {abData.variants[0].p_value}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <AlertTriangle size={18} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {activeView === 'comparison' ? (
        <>
          {/* Comparison Chart */}
          <Chart 
            title="Show-up Rate Comparison"
            description="Comparison of different reminder strategies"
            data={comparisonData} 
            type="bar"
            dataKeys={[
              { dataKey: 'showUp', name: 'Show-up Rate (%)' },
              { dataKey: 'noShow', name: 'No-show Rate (%)' }
            ]}
            xAxisKey="name"
            height={350}
          />

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>Statistical comparison of test variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Variant</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Sample Size</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Show-up %</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">No-show %</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">p-value</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {abData.variants.map((variant, index) => (
                      <tr key={index} className={variant.result === 'Winner' ? 'bg-green-50/50 dark:bg-green-950/20' : ''}>
                        <td className="py-3 px-4 text-sm font-medium">
                          {variant.name}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {variant.sample_size.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {(variant.show_up_rate * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {(variant.no_show_rate * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {variant.p_value}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            variant.result === 'Winner' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {variant.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Detailed View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Methodology</CardTitle>
                <CardDescription>How we conducted the A/B test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Test Design</h4>
                  <p className="text-sm text-muted-foreground">
                    We conducted an A/B test to compare the effectiveness of different reminder strategies in reducing appointment no-shows.
                    Patients were randomly assigned to different reminder groups, and we tracked their attendance rates.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Statistical Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    We used a two-proportion z-test to compare the show-up rates between variants.
                    A p-value less than 0.05 indicates a statistically significant difference.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    The test ran for 30 days with equal distribution of patients across both variants.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Next steps based on test results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 text-primary">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Implement SMS Reminders</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Roll out SMS reminders as the standard notification method for all departments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 text-primary">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Optimize Timing</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send reminders 24 and 48 hours before appointments for maximum effectiveness.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 text-primary">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Follow-up Study</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test SMS reminder content variations to further optimize engagement and response.
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <span>Generate Implementation Plan</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>Projected benefits of implementing the winning variant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Annual Appointments</p>
                  <p className="text-3xl font-bold">12,458</p>
                  <p className="text-xs text-muted-foreground">Based on current volume</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Projected No-shows Prevented</p>
                  <p className="text-3xl font-bold">872</p>
                  <p className="text-xs text-muted-foreground">7% improvement × annual volume</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Estimated Annual Savings</p>
                  <p className="text-3xl font-bold">$87,200</p>
                  <p className="text-xs text-muted-foreground">$100 average cost per no-show</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ABTesting;
