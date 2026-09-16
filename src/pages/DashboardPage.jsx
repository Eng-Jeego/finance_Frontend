import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import { dashboardApi, budgetApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatMoney, categoryName } from '../utils/format';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';

function KpiCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <span className="rounded-xl bg-brand-50 p-2 text-brand-700">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const currency = currentUser?.currency || 'USD';
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [charts, setCharts] = useState({ trends: [], expenseCategories: [] });
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const [summaryRes, recentRes, chartsRes, budgetsRes] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.recent(8),
          dashboardApi.charts(),
          budgetApi.list({ month: now.getMonth() + 1, year: now.getFullYear() }),
        ]);
        setSummary(summaryRes.data.data);
        setRecent(recentRes.data.data.transactions || []);
        setCharts(chartsRes.data.data);
        setBudgets(budgetsRes.data.data.budgets || []);
      } catch (error) {
        notify(getErrorMessage(error, 'Unable to load dashboard'), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (!summary) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="We could not load your financial summary."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">A live view of income, spending, savings, and budgets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total income"
          value={formatMoney(summary.lifetime.totalIncome, currency)}
          hint={`${summary.lifetime.incomeTransactionCount} records`}
          icon={ArrowDownLeft}
        />
        <KpiCard
          label="Total expenses"
          value={formatMoney(summary.lifetime.totalExpenses, currency)}
          hint={`${summary.lifetime.expenseTransactionCount} records`}
          icon={ArrowUpRight}
        />
        <KpiCard
          label="Current balance"
          value={formatMoney(summary.lifetime.currentBalance, currency)}
          hint="Income minus expenses"
          icon={Wallet}
        />
        <KpiCard
          label="Savings"
          value={formatMoney(summary.lifetime.totalSavings, currency)}
          hint={`${summary.lifetime.savingsRate}% of income`}
          icon={PiggyBank}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">This month's income</p>
          <p className="mt-2 text-xl font-semibold">{formatMoney(summary.currentMonth.income, currency)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">This month's expenses</p>
          <p className="mt-2 text-xl font-semibold">{formatMoney(summary.currentMonth.expenses, currency)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">This month's savings</p>
          <p className="mt-2 text-xl font-semibold">{formatMoney(summary.currentMonth.savings, currency)}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Income vs expenses" subtitle="Last 6 months" />
          <div className="h-72 p-4">
            {charts.trends?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMoney(value, currency)} />
                  <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#bbf7d0" />
                  <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="#fecaca" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No trend data yet" description="Add income and expenses to see monthly performance." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Expense breakdown" subtitle="This month by category" />
          <div className="h-72 p-4">
            {charts.expenseCategories?.length ? (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie data={charts.expenseCategories} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={90}>
                      {charts.expenseCategories.map((entry) => (
                        <Cell key={entry.categoryId} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="grid grid-cols-2 gap-2 px-4 pb-4 text-xs text-slate-600">
                  {charts.expenseCategories.map((entry) => (
                    <li key={entry.categoryId} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}</span>
                      <span className="ml-auto font-medium">{entry.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState title="No expenses this month" description="Add an expense to begin analyzing spending." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Budget overview"
            subtitle="Current month"
            action={
              <Link to="/budgets" className="text-sm font-medium text-brand-700">
                Manage
              </Link>
            }
          />
          {budgets.length === 0 ? (
            <EmptyState
              title="No budgets set"
              description="Create a monthly budget to monitor category spending."
              action={<Link to="/budgets"><Button>Set a budget</Button></Link>}
            />
          ) : (
            <ul className="space-y-4 p-5">
              {budgets.slice(0, 6).map((budget) => (
                <li key={budget._id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{budget.category?.name}</span>
                    <span>
                      {formatMoney(budget.spentAmount, currency)} / {formatMoney(budget.amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${budget.isOverBudget ? 'bg-red-500' : budget.isNearLimit ? 'bg-amber-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                    />
                  </div>
                <p className="mt-1 text-xs text-slate-600">
                    {budget.isOverBudget
                      ? `Over budget by ${formatMoney(Math.abs(budget.remainingAmount), currency)}`
                      : `${formatMoney(budget.remainingAmount, currency)} remaining`}
                    {` · ${budget.usagePercentage}% used`}
                    {budget.isNearLimit ? ' · Near limit' : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent transactions" subtitle="Latest income and expenses" />
          {recent.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first income or expense to start tracking."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((item) => (
                <li key={`${item.type}-${item._id}`} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.description || categoryName(item)}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(item.date)} · {categoryName(item)} · {item.type}
                    </p>
                  </div>
                  <p className={`font-semibold ${item.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount, currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
