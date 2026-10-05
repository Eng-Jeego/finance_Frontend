import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const AdminReports = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports();
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner message="Generating system reports..." size="lg" />
      </div>
    );
  }

  const { overview, categoryBreakdown } = reportData || { overview: {}, categoryBreakdown: [] };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Reports & Analytics
            </h2>
            <Badge variant="purple" size="sm">
              Platform-Wide
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated financial health, category expenditures, and global transaction metrics.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Reports
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total System Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(overview.incomeTotal)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{overview.incomeTransactions} income events logged</p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total System Outflow</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(overview.expenseTotal)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{overview.expenseTransactions} expense events logged</p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Platform Balance</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className={`text-2xl font-bold mt-2 ${overview.netCashflow >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(overview.netCashflow)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Inflow minus outflow</p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Budgets</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {overview.totalBudgets}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Total active user targets</p>
        </Card>
      </div>

      {/* Category Breakdown Table & Visualization */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System-Wide Expense Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution of expenses across all user accounts
            </p>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">No categorized expenses recorded yet</p>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || '#8b5cf6' }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-slate-400">({item.count} expenses)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400 w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, item.percentage || 0)}%`,
                      backgroundColor: item.color || '#8b5cf6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminReports;
