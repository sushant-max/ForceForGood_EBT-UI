
import React, { useEffect, useState } from 'react'
import { Users, Building2, Key, Clock, Calendar, Activity } from 'lucide-react'
import { ChartContainer } from '../components/ChartContainer'
import { StatCard } from '../components/StatCard'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorAlert } from '../components/ErrorAlert'
import { EmptyState } from '../components/EmptyState'
export const SuperAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [topCorporates, setTopCorporates] = useState<any[]>([])
  useEffect(() => {
    fetchSuperAdminData()
  }, [])
  const fetchSuperAdminData = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/super-admin/dashboard')
      // const data = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStats({
        corporates: {
          value: '24',
          change: '+12%',
          trend: 'up',
        },
        volunteers: {
          value: '1,284',
          change: '+8%',
          trend: 'up',
        },
        licenseQuota: {
          value: '843',
          change: '+24%',
          trend: 'up',
        },
        approvals: {
          value: '16',
          change: '-5%',
          trend: 'down',
        },
      })
      setActivities([
        {
          title: 'Acme Corp approved for onboarding',
          time: '2 hours ago',
          icon: <Building2 size={16} className="text-blue-600" />,
          iconBg: 'bg-blue-50',
        },
        {
          title: '15 new volunteers registered',
          time: '5 hours ago',
          icon: <Users size={16} className="text-green-600" />,
          iconBg: 'bg-green-50',
        },
        {
          title: 'TechGiant requested 50 new licenses',
          time: '1 day ago',
          icon: <Key size={16} className="text-purple-600" />,
          iconBg: 'bg-purple-50',
        },
        {
          title: 'Quarterly impact report generated',
          time: '2 days ago',
          icon: <Calendar size={16} className="text-amber-600" />,
          iconBg: 'bg-amber-50',
        },
      ])
      setTopCorporates([
        {
          name: 'TechGiant Inc.',
          volunteers: 245,
          impact: 98,
        },
        {
          name: 'Global Finance Ltd',
          volunteers: 189,
          impact: 92,
        },
        {
          name: 'Acme Corporation',
          volunteers: 156,
          impact: 87,
        },
        {
          name: 'Oceanic Airlines',
          volunteers: 134,
          impact: 81,
        },
        {
          name: 'Universal Systems',
          volunteers: 112,
          impact: 76,
        },
      ])
    } catch (err) {
      console.error('Failed to fetch super admin dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md text-sm p-2">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div>
      </div>
      {error && <ErrorAlert message={error} onRetry={fetchSuperAdminData} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Corporates"
              value={stats.corporates.value}
              change={stats.corporates.change}
              icon={<Building2 size={20} />}
              color="bg-blue-50 text-blue-600"
              trend={stats.corporates.trend}
              showTrend
            />
            <StatCard
              title="Active Volunteers"
              value={stats.volunteers.value}
              change={stats.volunteers.change}
              icon={<Users size={20} />}
              color="bg-green-50 text-green-600"
              trend={stats.volunteers.trend}
              showTrend
            />
            <StatCard
              title="License Quota"
              value={stats.licenseQuota.value}
              change={stats.licenseQuota.change}
              icon={<Key size={20} />}
              color="bg-purple-50 text-purple-600"
              trend={stats.licenseQuota.trend}
              showTrend
            />
            <StatCard
              title="Pending Approvals"
              value={stats.approvals.value}
              change={stats.approvals.change}
              icon={<Clock size={20} />}
              color="bg-amber-50 text-amber-600"
              trend={stats.approvals.trend}
              showTrend
            />
          </>
        ) : null}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </>
        ) : (
          <>
            <ChartContainer
              title="Volunteer Growth"
              subtitle="Last 6 months"
              type="line"
            />
            <ChartContainer
              title="License Utilization"
              subtitle="By corporate"
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <LoadingSkeleton type="table" />
            <LoadingSkeleton type="table" />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`p-2 rounded-full mr-3 ${activity.iconBg}`}
                      >
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent activity"
                  description="There hasn't been any activity in the selected time period."
                  icon={<Activity className="h-12 w-12 text-gray-400" />}
                />
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Top Performing Corporates
              </h2>
              {topCorporates.length > 0 ? (
                <div className="space-y-4">
                  {topCorporates.map((corporate, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-5">
                          {index + 1}
                        </span>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {corporate.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {corporate.volunteers} volunteers
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {corporate.impact} impact score
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No corporate data"
                  description="There are no corporates to display in the leaderboard."
                  icon={<Building2 className="h-12 w-12 text-gray-400" />}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
