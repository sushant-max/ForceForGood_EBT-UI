import React, { useEffect, useState } from 'react';
import { BarChart4, Calendar, Clock, Download, FileText, Users, Building2, ChevronDown, RefreshCw } from 'lucide-react';
import { ChartContainer } from '../components/ChartContainer';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
export const AnalyticsReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('month');
  const [reportType, setReportType] = useState('volunteer');
  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, reportType]);
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, we would fetch data here
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
    }
  };
  const handleRetry = () => {
    fetchAnalytics();
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Analytics & Reports
        </h1>
        <div className="flex space-x-3">
          <div className="relative">
            <select className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-[#466EE5] focus:border-[#466EE5]" value={timeframe} onChange={e => setTimeframe(e.target.value)} aria-label="Select timeframe">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={16} />
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      {error && <ErrorAlert message={error} onRetry={handleRetry} />}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button onClick={() => setReportType('volunteer')} className={`py-4 px-6 text-sm font-medium border-b-2 ${reportType === 'volunteer' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={reportType === 'volunteer' ? 'page' : undefined}>
              <Users className="h-4 w-4 inline mr-2" />
              Volunteer Metrics
            </button>
            <button onClick={() => setReportType('impact')} className={`py-4 px-6 text-sm font-medium border-b-2 ${reportType === 'impact' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={reportType === 'impact' ? 'page' : undefined}>
              <BarChart4 className="h-4 w-4 inline mr-2" />
              Impact Reports
            </button>
            <button onClick={() => setReportType('activity')} className={`py-4 px-6 text-sm font-medium border-b-2 ${reportType === 'activity' ? 'border-[#466EE5] text-[#466EE5]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} aria-current={reportType === 'activity' ? 'page' : undefined}>
              <Clock className="h-4 w-4 inline mr-2" />
              Activity Logs
            </button>
          </nav>
        </div>
      </div>
      {loading ? <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </div>
          <LoadingSkeleton type="table" className="h-64" />
        </div> : <>
          {reportType === 'volunteer' && <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Volunteers</p>
                      <p className="text-2xl font-bold">245</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+12%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hours Contributed</p>
                      <p className="text-2xl font-bold">1,284</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+8%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#F3F4F6] text-gray-600 mr-4">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Projects Completed
                      </p>
                      <p className="text-2xl font-bold">37</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+15%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Volunteer Growth" subtitle="Over time" type="line" />
                <ChartContainer title="Hours by Department" subtitle="Distribution" />
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Top Volunteers
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ranked by hours contributed
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projects
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[{
                  rank: 1,
                  name: 'Michael Brown',
                  hours: 120,
                  projects: 4,
                  lastActive: '2023-05-19'
                }, {
                  rank: 2,
                  name: 'Emily Davis',
                  hours: 85,
                  projects: 3,
                  lastActive: '2023-05-15'
                }, {
                  rank: 3,
                  name: 'James Wilson',
                  hours: 65,
                  projects: 2,
                  lastActive: '2023-05-10'
                }, {
                  rank: 4,
                  name: 'Sophia Martinez',
                  hours: 40,
                  projects: 1,
                  lastActive: '2023-05-05'
                }, {
                  rank: 5,
                  name: 'David Johnson',
                  hours: 35,
                  projects: 2,
                  lastActive: '2023-05-02'
                }].map(volunteer => <tr key={volunteer.rank}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {volunteer.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.hours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.projects}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(volunteer.lastActive).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>}
          {reportType === 'impact' && <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#EFF6FF] text-[#466EE5] mr-4">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Impact Score</p>
                      <p className="text-2xl font-bold">87</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+5%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#ECFDF5] text-green-600 mr-4">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">People Impacted</p>
                      <p className="text-2xl font-bold">5,280</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+12%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#F3F4F6] text-gray-600 mr-4">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reports Generated</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-green-500">+8%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. previous period
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Impact by Category" subtitle="Distribution" />
                <ChartContainer title="Impact Trend" subtitle="Over time" type="line" />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Available Reports
                </h2>
                <div className="space-y-4">
                  {[{
              name: 'Quarterly Impact Summary',
              date: '2023-03-31',
              type: 'PDF'
            }, {
              name: 'Annual Volunteer Activity',
              date: '2023-01-15',
              type: 'PDF'
            }, {
              name: 'Corporate Social Responsibility',
              date: '2023-02-28',
              type: 'XLSX'
            }, {
              name: 'Community Engagement Metrics',
              date: '2023-04-15',
              type: 'PDF'
            }].map((report, index) => <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded mr-3">
                          <FileText size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {report.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated on{' '}
                            {new Date(report.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                          </p>
                        </div>
                      </div>
                      <button className="text-[#466EE5] hover:text-[#3355cc] text-sm font-medium flex items-center">
                        <Download size={16} className="mr-1" />
                        {report.type}
                      </button>
                    </div>)}
                </div>
              </div>
            </div>}
          {reportType === 'activity' && <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-6">
                  {[{
              action: 'Volunteer onboarded',
              user: 'David Johnson',
              timestamp: '2023-05-20T09:30:00Z',
              details: 'New volunteer joined from Oceanic Airlines'
            }, {
              action: 'Project completed',
              user: 'Emily Davis',
              timestamp: '2023-05-19T14:45:00Z',
              details: 'Website redesign project marked as complete'
            }, {
              action: 'Hours logged',
              user: 'Michael Brown',
              timestamp: '2023-05-18T11:20:00Z',
              details: 'Logged 8 hours for community outreach'
            }, {
              action: 'Report generated',
              user: 'Sarah Johnson',
              timestamp: '2023-05-17T16:10:00Z',
              details: 'Monthly impact report generated'
            }, {
              action: 'License assigned',
              user: 'System',
              timestamp: '2023-05-16T10:05:00Z',
              details: 'New license assigned to James Wilson'
            }].map((activity, index) => <div key={index} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
                      <div className="absolute -left-1.5 mt-1.5">
                        <div className="h-3 w-3 rounded-full border-2 border-[#466EE5] bg-white"></div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            By {activity.user}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.details}
                          </p>
                        </div>
                        <div className="mt-1 sm:mt-0 text-xs text-gray-500 sm:text-right">
                          <div className="flex items-center sm:justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(activity.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
                <div className="mt-6 text-center">
                  <button className="inline-flex items-center text-sm font-medium text-[#466EE5] hover:text-[#3355cc]">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Load More
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Activity by Type" subtitle="Distribution" />
                <ChartContainer title="Activity Over Time" subtitle="Hourly breakdown" type="line" />
              </div>
            </div>}
        </>}
    </div>;
};