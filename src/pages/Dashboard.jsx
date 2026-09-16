import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import budgetService from '../services/budgetService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import IncomeVsExpenseBarChart from '../components/charts/IncomeVsExpenseBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartsData, setChartsData] = useState({ trends: [], expenseCategories: [] });
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [sumRes, recentRes, chartsRes, budgetsRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getRecentTransactions(6),
          dashboardService.getCharts(),
          budgetService.getBudgets(),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (recentRes.success) setRecentTransactions(recentRes.data.transactions || []);
        if (chartsRes.success) setChartsData(chartsRes.data);
        if (budgetsRes.success) setBudgets(budgetsRes.data.budgets || []);
      } catch (err) {
        console.error('[Dashboard Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Loading financial dashboard..." size="lg" />
      </div>
    );
  }

  const lifetime = summary?.lifetime || {};
  const currentMonth = summary?.currentMonth || {};

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your personal finances this month.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/income">
            <Button variant="outline" size="sm" icon={Plus}>
              Add Income
            </Button>
          </Link>
          <Link to="/expenses">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Net Balance Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-slate-900">
              {formatCurrency(lifetime.currentBalance, currency)}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Available net financial standing</p>
          </div>
        </Card>

        {/* Total Income Card */}
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Income
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-slate-900">
              {formatCurrency(lifetime.totalIncome, currency)}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                {formatCurrency(currentMonth.income, currency)}
              </span>
              <span>this month</span>
            </div>
          </div>
        </Card>

        {/* Total Expenses Card */}
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-slate-900">
              {formatCurrency(lifetime.totalExpenses, currency)}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-rose-600">
                {formatCurrency(currentMonth.expenses, currency)}
              </span>
              <span>this month</span>
            </div>
          </div>
        </Card>

        {/* Net Savings Card */}
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Savings
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-slate-900">
              {formatCurrency(lifetime.totalSavings, currency)}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>Savings Rate:</span>
              <span className="font-semibold text-teal-600">
                {formatPercentage(lifetime.savingsRate)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Income vs Expenses Trend"
            subtitle="Monthly performance over the past 6 months"
            action={
              <Link to="/reports" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Full Report <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <IncomeVsExpenseBarChart data={chartsData.trends} currency={currency} />
          </Card>
        </div>

        {/* Current Month Expense Category Distribution */}
        <div className="lg:col-span-1">
          <Card
            title="Expenses by Category"
            subtitle="Current month breakdown"
            action={
              <Link to="/categories" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Manage
              </Link>
            }
          >
            <CategoryPieChart
              data={chartsData.expenseCategories}
              currency={currency}
            />
          </Card>
        </div>
      </div>

      {/* Budgets & Recent Transactions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets Progress */}
        <div className="lg:col-span-1 space-y-4">
          <Card
            title="Monthly Budgets"
            subtitle="Current spending limits"
            action={
              <Link to="/budgets" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {budgets.length === 0 ? (
              <EmptyState
                title="No budgets set"
                description="Set monthly category targets to prevent overspending."
                actionLabel="Set Budget"
                onAction={() => (window.location.href = '/budgets')}
                className="py-8"
              />
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((b) => {
                  let progressColor = 'bg-emerald-500';
                  if (b.isOverBudget) progressColor = 'bg-rose-500';
                  else if (b.isNearLimit) progressColor = 'bg-amber-500';

                  return (
                    <div key={b._id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {b.category?.name || 'Category'}
                        </span>
                        <span className="text-slate-500">
                          {formatCurrency(b.spentAmount, currency)} / {formatCurrency(b.amount, currency)}
                        </span>
                      </div>
                      {/* Progress Bar Track */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(b.usagePercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={b.isOverBudget ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                          {b.isOverBudget
                            ? `Over budget by ${formatCurrency(b.spentAmount - b.amount, currency)}`
                            : `${formatCurrency(b.remainingAmount, currency)} left`}
                        </span>
                        <span className="font-medium text-slate-600">
                          {formatPercentage(b.usagePercentage)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions Timeline Table */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Transactions"
            subtitle="Latest income and expense records"
            action={
              <div className="flex items-center gap-2">
                <Link to="/income" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Incomes
                </Link>
                <span className="text-slate-300">•</span>
                <Link to="/expenses" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                  Expenses
                </Link>
              </div>
            }
          >
            {recentTransactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Start recording your earnings and expenses to populate your timeline."
                className="py-8"
              />
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Category / Source</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <Badge
                              color={tx.category?.color}
                              size="sm"
                              className="font-medium"
                            >
                              {tx.category?.name || tx.source || 'General'}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 text-slate-700 max-w-xs truncate">
                            {tx.description || (isIncome ? tx.source : 'Expense')}
                          </td>
                          <td
                            className={`px-6 py-3.5 text-right font-bold whitespace-nowrap ${
                              isIncome ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount, currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
