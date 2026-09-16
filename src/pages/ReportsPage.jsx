import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { reportApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MONTHS, REPORT_PERIODS } from '../constants';
import { formatMoney } from '../utils/format';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/FormField';
import { Spinner, EmptyState } from '../components/ui/Feedback';

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const currency = currentUser?.currency || 'USD';
  const [period, setPeriod] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [expenseCats, setExpenseCats] = useState([]);
  const [sources, setSources] = useState([]);
  const [methods, setMethods] = useState([]);
  const [trends, setTrends] = useState([]);
  const [budgetReport, setBudgetReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = { period };
      if (period === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      try {
        const [overviewRes, catsRes, sourcesRes, methodsRes, trendsRes, budgetsRes] = await Promise.all([
          reportApi.overview(params),
          reportApi.categoryBreakdown({ ...params, type: 'expense' }),
          reportApi.incomeSources(params),
          reportApi.paymentMethods(params),
          reportApi.trends({ year }),
          reportApi.budgets(params),
        ]);
        setOverview(overviewRes.data.data);
        setExpenseCats(catsRes.data.data.categories || []);
        setSources(sourcesRes.data.data.sources || []);
        setMethods(methodsRes.data.data.paymentMethods || []);
        setTrends(trendsRes.data.data.months || []);
        setBudgetReport(budgetsRes.data.data);
      } catch (error) {
        notify(getErrorMessage(error, 'Unable to generate report'), 'error');
      } finally {
        setLoading(false);
      }
    };
    if (period !== 'custom' || (startDate && endDate)) {
      load();
    }
  }, [period, startDate, endDate, year, notify]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Analyze income, expenses, savings, and budget-period performance.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Select id="period" label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {REPORT_PERIODS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        {period === 'custom' ? (
          <>
            <Input id="startDate" type="date" label="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input id="endDate" type="date" label="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </>
        ) : null}
        <Input id="year" type="number" label="Trend year" value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </div>

      {loading ? (
        <Spinner label="Generating report..." />
      ) : overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5"><p className="text-sm text-slate-500">Income</p><p className="mt-2 text-xl font-semibold">{formatMoney(overview.totalIncome, currency)}</p></Card>
            <Card className="p-5"><p className="text-sm text-slate-500">Expenses</p><p className="mt-2 text-xl font-semibold">{formatMoney(overview.totalExpenses, currency)}</p></Card>
            <Card className="p-5"><p className="text-sm text-slate-500">Net / savings</p><p className="mt-2 text-xl font-semibold">{formatMoney(overview.netSavings, currency)}</p></Card>
            <Card className="p-5"><p className="text-sm text-slate-500">Savings rate</p><p className="mt-2 text-xl font-semibold">{overview.savingsRate}%</p></Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="Expense categories" subtitle="Top spending groups" />
              <div className="h-72 p-4">
                {expenseCats.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCats} dataKey="amount" nameKey="name" outerRadius={90}>
                        {expenseCats.map((item) => (
                          <Cell key={item.categoryId} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(value, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No expense data" description="There are no expenses in this period." />
                )}
              </div>
            </Card>
            <Card>
              <CardHeader title="Income by source" />
              <div className="h-72 p-4">
                {sources.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sources}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatMoney(value, currency)} />
                      <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No income data" description="There is no income in this period." />
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Monthly comparison" subtitle={`${year} income vs expenses`} />
            <div className="h-80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMoney(value, currency)} />
                  <Bar dataKey="income" fill="#16a34a" />
                  <Bar dataKey="expenses" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Budget performance"
              subtitle={
                budgetReport
                  ? `${MONTHS[(budgetReport.month || 1) - 1]?.label || ''} ${budgetReport.year || ''} — spending vs targets`
                  : 'Monthly category targets'
              }
            />
            {!budgetReport?.budgets?.length ? (
              <EmptyState title="No budgets for this month" description="Set category budgets to compare spending against targets." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {budgetReport.budgets.map((budget) => (
                  <li key={budget._id} className="px-5 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{budget.category?.name}</span>
                      <span>
                        {formatMoney(budget.spentAmount, currency)} / {formatMoney(budget.amount, currency)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {budget.isOverBudget
                        ? `Over by ${formatMoney(Math.abs(budget.remainingAmount), currency)}`
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
            <CardHeader title="Payment methods" />
            {methods.length === 0 ? (
              <EmptyState title="No payment data" description="Add expenses to see payment-method mix." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {methods.map((item) => (
                  <li key={item.paymentMethod} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>{item.paymentMethod}</span>
                    <span className="font-medium">
                      {formatMoney(item.amount, currency)} · {item.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
