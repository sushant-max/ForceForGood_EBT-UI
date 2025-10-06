import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
  showTrend?: boolean;
}
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  trend = 'up',
  showTrend = false
}) => {
  return <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
        {showTrend && <>
            {trend === 'up' ? <TrendingUp size={16} className="ml-1 text-green-500" /> : <TrendingDown size={16} className="ml-1 text-red-500" />}
          </>}
        {showTrend && <span className="text-xs text-gray-500 ml-2">vs. last period</span>}
      </div>
    </div>;
};