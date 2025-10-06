import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  type?: 'bar' | 'line';
  data?: any[];
}
export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  type = 'bar',
  data
}) => {
  // Generate mock data if none is provided
  const mockData = data || [{
    name: 'Jan',
    value: 400
  }, {
    name: 'Feb',
    value: 300
  }, {
    name: 'Mar',
    value: 600
  }, {
    name: 'Apr',
    value: 800
  }, {
    name: 'May',
    value: 500
  }, {
    name: 'Jun',
    value: 900
  }];
  return <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? <BarChart data={mockData} margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#466EE5" />
            </BarChart> : <LineChart data={mockData} margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#466EE5" strokeWidth={2} />
            </LineChart>}
        </ResponsiveContainer>
      </div>
    </div>;
};