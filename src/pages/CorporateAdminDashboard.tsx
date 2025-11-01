import React, { useEffect, useState } from 'react'
import { Users, Key, TrendingUp, Calendar, Activity, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ChartContainer } from '../components/ChartContainer'
import { StatCard } from '../components/StatCard'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorAlert } from '../components/ErrorAlert'
import { EmptyState } from '../components/EmptyState'
export const CorporateAdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [topVolunteers, setTopVolunteers] = useState<any[]>([])
  useEffect(() => {
    fetchCorporateAdminData()
  }, [])
  const fetchCorporateAdminData = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/corporate-admin/dashboard/${user?.corporateId}`)
      // const data = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStats({
        volunteers: {
          value: '245',
          change: '+12%',
          trend: 'up',
        },
        licenses: {
          total: 100,
          used: 85,
          available: 15,
          change: '+5%',
          trend: 'up',
        },
        hoursLogged: {
          value: '3,847',
          change: '+18%',
          trend: 'up',
        },
        impactScore: {
          value: '98',
          change: '+3%',
          trend: 'up',
        },
      })
      setActivities([
        {
          title: 'John Smith completed environmental cleanup',
          time: '2 hours ago',
          icon: <Users size={16} className="text-green-600" />,
          iconBg: 'bg-green-50',
        },
        {
          title: 'Sarah Johnson logged 8 volunteer hours',
          time: '5 hours ago',
          icon: <Calendar size={16} className="text-blue-600" />,
          iconBg: 'bg-blue-50',
        },
        {
          title: '3 new volunteers joined your team',
          time: '1 day ago',
          icon: <Users size={16} className="text-purple-600" />,
          iconBg: 'bg-purple-50',
        },
        {
          title: 'Monthly impact report is ready',
          time: '2 days ago',
          icon: <TrendingUp size={16} className="text-amber-600" />,
          iconBg: 'bg-amber-50',
        },
      ])
      setTopVolunteers([
        {
          name: 'John Smith',
          hours: 156,
          activities: 23,
        },
        {
          name: 'Sarah Johnson',
          hours: 142,
          activities: 19,
        },
        {
          name: 'Michael Brown',
          hours: 128,
          activities: 17,
        },
        {
          name: 'Emily Davis',
          hours: 115,
          activities: 15,
        },
        {
          name: 'David Wilson',
          hours: 98,
          activities: 12,
        },
      ])
    } catch (err) {
      console.error('Failed to fetch corporate admin dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md text-sm p-2">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div>
      </div>
      {error && (
        <ErrorAlert message={error} onRetry={fetchCorporateAdminData} />
      )}
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
              title="Active Volunteers"
              value={stats.volunteers.value}
              change={stats.volunteers.change}
              icon={<Users size={20} />}
              color="bg-green-50 text-green-600"
              trend={stats.volunteers.trend}
              showTrend
            />
            <StatCard
              title="License Usage"
              value={`${stats.licenses.used}/${stats.licenses.total}`}
              change={stats.licenses.change}
              icon={<Key size={20} />}
              color="bg-purple-50 text-purple-600"
              trend={stats.licenses.trend}
              showTrend
            />
            <StatCard
              title="Hours Logged"
              value={stats.hoursLogged.value}
              change={stats.hoursLogged.change}
              icon={<Calendar size={20} />}
              color="bg-blue-50 text-blue-600"
              trend={stats.hoursLogged.trend}
              showTrend
            />
            <StatCard
              title="Impact Score"
              value={stats.impactScore.value}
              change={stats.impactScore.change}
              icon={<Award size={20} />}
              color="bg-amber-50 text-amber-600"
              trend={stats.impactScore.trend}
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
              title="Volunteer Activity"
              subtitle="Last 6 months"
              type="line"
            />
            <ChartContainer
              title="License Utilization"
              subtitle="Current period"
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
              <h2 className="text-lg font-semibold mb-4">Top Volunteers</h2>
              {topVolunteers.length > 0 ? (
                <div className="space-y-4">
                  {topVolunteers.map((volunteer, index) => (
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
                            {volunteer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {volunteer.activities} activities
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {volunteer.hours} hours
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No volunteer data"
                  description="There are no volunteers to display in the leaderboard."
                  icon={<Users className="h-12 w-12 text-gray-400" />}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
