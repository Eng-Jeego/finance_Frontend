import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import adminService from '../services/adminService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load admin dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner message="Loading system-wide administration statistics..." size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 text-center text-rose-700 dark:text-rose-300">
        <p className="font-semibold">{error || 'Unable to retrieve admin dashboard data'}</p>
      </div>
    );
  }

  const { metrics, analytics, recentAuditLogs } = data;

  const kpiCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      subtext: `${metrics.activeUsers} active, ${metrics.inactiveUsers} inactive`,
      icon: Users,
      color: 'purple',
      badge: 'All Accounts',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      subtext: `${metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}% of total users`,
      icon: UserCheck,
      color: 'emerald',
      badge: 'Active',
    },
    {
      title: 'Inactive Users',
      value: metrics.inactiveUsers,
      subtext: 'Suspended or deactivated',
      icon: UserX,
      color: 'rose',
      badge: 'Action Needed',
    },
    {
      title: 'New Users (Month)',
      value: metrics.newUsersThisMonth,
      subtext: 'Registered this month',
      icon: UserPlus,
      color: 'sky',
      badge: 'Growth',
    },
    {
      title: 'Total Income Recorded',
      value: formatCurrency(metrics.totalIncome),
      subtext: 'Across all active users',
      icon: TrendingUp,
      color: 'emerald',
      badge: 'System Inflow',
    },
    {
      title: 'Total Expenses Recorded',
      value: formatCurrency(metrics.totalExpenses),
      subtext: 'Across all active users',
      icon: TrendingDown,
      color: 'amber',
      badge: 'System Outflow',
    },
    {
      title: 'Total Transactions',
      value: metrics.totalTransactions,
      subtext: 'Incomes + Expenses logged',
      icon: Layers,
      color: 'purple',
      badge: 'Activity',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl shadow-purple-900/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
              System Administration Console
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Overview & Analytics</h2>
          <p className="text-sm text-purple-200/80 mt-1">
            System-wide operational metrics, user activity, financial volume, and security audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950/40 transition-all"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all"
          >
            <Activity className="w-4 h-4" />
            Audit Logs
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                idx === 6 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                    {kpi.value}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{kpi.subtext}</p>
                </div>
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    kpi.color === 'purple'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                      : kpi.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : kpi.color === 'rose'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      : kpi.color === 'sky'
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                System Income vs Expenses (Last 6 Months)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total financial volume across all users
              </p>
            </div>
            <Badge variant="purple" size="sm">
              Financials
            </Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.incomeVsExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val >= 1000 ? `${val / 1000}k` : val}`} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Growth Area Chart */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Registrations Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly new registered users
              </p>
            </div>
            <Badge variant="info" size="sm">
              Growth
            </Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  name="New Users"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#userGrowthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Expense Categories */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top Expense Categories System-Wide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Expense distribution by category volume
              </p>
            </div>
            <Badge variant="warning" size="sm">
              Categories
            </Badge>
          </div>
          {analytics.mostUsedExpenseCategories?.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
              No expense records recorded yet
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.mostUsedExpenseCategories}
                    dataKey="totalAmount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {analytics.mostUsedExpenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Monthly Transaction Volume Bar Chart */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Transaction Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Combined volume of incomes and expenses recorded
              </p>
            </div>
            <Badge variant="purple" size="sm">
              Activity
            </Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyTransactionVolume} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="incomeCount" name="Incomes" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="expenseCount" name="Expenses" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Section: Most Active Users & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Active Users (2 cols) */}
        <Card className="lg:col-span-2 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top Active Users
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Users with highest transaction count and engagement
              </p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              View All Users <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Transactions</th>
                  <th className="pb-3 text-right">Total Flow</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.mostActiveUsers?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No user records found
                    </td>
                  </tr>
                ) : (
                  analytics.mostActiveUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase shrink-0">
                            {u.fullName ? u.fullName[0] : 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {u.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={u.role === 'ADMIN' ? 'purple' : 'default'}
                          size="sm"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={u.status === 'ACTIVE' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                        {u.transactionCount}
                      </td>
                      <td className="py-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(u.totalIncome)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Audit Logs (1 col) */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Privileged administrative activity
              </p>
            </div>
            <Link
              to="/admin/settings"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              All Logs
            </Link>
          </div>
          <div className="space-y-3.5">
            {recentAuditLogs?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent audit logs</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(log.createdAt, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">By: {log.adminEmail}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
