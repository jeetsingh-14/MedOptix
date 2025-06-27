import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '../lib/utils';

// Default color palette that works well in both light and dark modes
const defaultColors = [
  '#0ea5e9', // Primary blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

/**
 * Chart component for data visualization
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} [props.description] - Optional chart description
 * @param {Array} props.data - Data array for the chart
 * @param {string} props.type - Chart type: 'line', 'bar', 'area', 'pie'
 * @param {Array} [props.dataKeys] - Array of data keys to display
 * @param {string} [props.xAxisKey='name'] - Key for X-axis data
 * @param {number} [props.height=300] - Chart height
 * @param {boolean} [props.showGrid=true] - Whether to show grid lines
 * @param {boolean} [props.showLegend=true] - Whether to show the legend
 * @param {Array} [props.colors] - Custom colors for the chart
 * @param {string} [props.className] - Additional CSS classes
 */
const Chart = ({
  title,
  description,
  data,
  type = 'line',
  dataKeys = [{ dataKey: 'value', name: 'Value' }],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  colors = defaultColors,
  className,
  ...props
}) => {
  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }} 
            />
            {showLegend && <Legend />}
            {dataKeys.map((item, index) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name || item.dataKey}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }} 
            />
            {showLegend && <Legend />}
            {dataKeys.map((item, index) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.name || item.dataKey}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              tick={{ fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }} 
            />
            {showLegend && <Legend />}
            {dataKeys.map((item, index) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name || item.dataKey}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0].dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }} 
            />
            {showLegend && <Legend />}
          </PieChart>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;