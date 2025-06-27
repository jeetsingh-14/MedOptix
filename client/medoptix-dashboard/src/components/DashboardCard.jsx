import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * DashboardCard component for displaying statistics and metrics
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} [props.unit] - Optional unit for the value (e.g., %, $)
 * @param {React.ReactNode} [props.icon] - Optional icon to display
 * @param {'up'|'down'|'neutral'} [props.trend] - Optional trend direction
 * @param {string} [props.trendValue] - Optional trend value (e.g., "5.2%")
 * @param {string} [props.description] - Optional description text
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Optional children to render in the card
 */
const DashboardCard = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  description,
  className,
  children,
  ...props
}) => {
  // Determine trend color
  const trendColor = trend === 'up' 
    ? 'text-green-600 dark:text-green-500' 
    : trend === 'down' 
      ? 'text-red-600 dark:text-red-500' 
      : 'text-gray-500 dark:text-gray-400';

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="ml-1 text-muted-foreground">{unit}</span>}
          </div>
          
          {(trend || description) && (
            <div className="flex items-center text-xs">
              {trend && (
                <div className={cn("flex items-center mr-2", trendColor)}>
                  {trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : trend === 'down' ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : null}
                  <span>{trendValue}</span>
                </div>
              )}
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
            </div>
          )}
          
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;