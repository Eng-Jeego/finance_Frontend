import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
  CreditCard,
  Coins,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import IncomeVsExpenseBarChart from '../components/charts/IncomeVsExpenseBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

const Reports = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  const [period, setPeriod] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [trends, setTrends] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch all report data
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = { period, startDate, endDate };

      const [overRes, catRes, trendRes, srcRes, payRes] = await Promise.all([
        reportService.getOverview(query),
        reportService.getCategoryBreakdown({ ...query, type: 'expense' }),
        reportService.getTrends({ year: selectedYear }),
        reportService.getIncomeSources(query),
        reportService.getPaymentMethods(query),
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (catRes.success) setCategoryBreakdown(catRes.data.categories || []);
      if (trendRes.success) setTrends(trendRes.data.months || []);
      if (srcRes.success) setIncomeSources(srcRes.data.sources || []);
      if (payRes.success) setPaymentMethods(payRes.data.paymentMethods || []);
    } catch (err) {
      showToast(err.message || 'Failed to generate financial reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate, selectedYear, showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-8">
      {/* Header & Date Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Reports & Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into your spending trends, revenue sources, and historical performance.
          </p>
        </div>

        {/* Time Period Selector Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={PERIOD_OPTIONS}
            placeholder={null}
            containerClassName="w-40"
          />

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                containerClassName="w-36"
              />
              <span className="text-xs text-slate-400">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                containerClassName="w-36"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24">
          <LoadingSpinner message="Synthesizing financial analytics and reports..." size="lg" />
        </div>
      ) : (
        <>
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Income
              </span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(overview?.totalIncome, currency)}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {overview?.incomeStats?.count || 0} income entries
              </p>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Expenses
              </span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(overview?.totalExpenses, currency)}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {overview?.expenseStats?.count || 0} expense entries
              </p>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Balance
              </span>
              <h4
                className={`text-2xl font-bold mt-2 ${
                  (overview?.netSavings || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {formatCurrency(overview?.netSavings, currency)}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {(overview?.netSavings || 0) < 0 ? 'Deficit for period' : 'Net surplus for period'}
              </p>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Savings Rate
              </span>
              <h4 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
                {formatPercentage(overview?.savingsRate)}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Avg expense: {formatCurrency(overview?.expenseStats?.average, currency)}
              </p>
            </Card>
          </div>

          {/* Annual 12-Month Performance Trend */}
          <Card
            title="Annual Income vs. Expenses (12-Month View)"
            subtitle={`Monthly trajectory for year ${selectedYear}`}
            action={
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="dark:bg-slate-900 dark:text-slate-100">
                    {y}
                  </option>
                ))}
              </select>
            }
          >
            <IncomeVsExpenseBarChart data={trends} currency={currency} />
          </Card>

          {/* Charts Grid: Category Distribution + Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card
              title="Expense Distribution by Category"
              subtitle={`Distribution for ${period.replace('_', ' ')}`}
            >
              <div className="space-y-6">
                <CategoryPieChart data={categoryBreakdown} currency={currency} />

                {/* Breakdown List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-2">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.categoryId} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 w-12 text-right">
                          {formatPercentage(cat.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Income by Source Breakdown */}
            <Card
              title="Income by Source"
              subtitle={`Revenue breakdown for ${period.replace('_', ' ')}`}
            >
              <div className="space-y-4">
                {incomeSources.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No income sources recorded for this timeframe
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {incomeSources.map((src) => (
                      <div key={src.source} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{src.source}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(src.amount, currency)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${src.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                          <span>{src.count} deposit(s)</span>
                          <span>{formatPercentage(src.percentage)} of total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <Card
            title="Spending by Payment Method"
            subtitle={`How you spent your money in ${period.replace('_', ' ')}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {paymentMethods.map((m) => (
                <div
                  key={m.paymentMethod}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col justify-between transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                    <span className="text-xs font-semibold uppercase">{m.paymentMethod}</span>
                    <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(m.amount, currency)}
                    </h5>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{m.count} charges</span>
                      <span className="font-semibold">{formatPercentage(m.percentage)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
