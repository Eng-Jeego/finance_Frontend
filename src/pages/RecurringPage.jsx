import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { incomeApi, expenseApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatMoney, categoryName } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner, EmptyState } from '../components/ui/Feedback';

export default function RecurringPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const currency = currentUser?.currency || 'USD';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          incomeApi.list({ isRecurring: true, limit: 50, sortBy: 'date', sortOrder: 'desc' }),
          expenseApi.list({ isRecurring: true, limit: 50, sortBy: 'date', sortOrder: 'desc' }),
        ]);
        const incomes = (incomeRes.data.data || []).map((item) => ({ ...item, type: 'income' }));
        const expenses = (expenseRes.data.data || []).map((item) => ({ ...item, type: 'expense' }));
        const merged = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRows(merged);
      } catch (error) {
        notify(getErrorMessage(error, 'Unable to load recurring transactions'), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recurring</h1>
        <p className="text-sm text-slate-500">
          Version 1 stores a recurring rule on the transaction. The server does not auto-create duplicate rows.
        </p>
      </div>

      <Card>
        <CardHeader title="Recurring income and expenses" />
        {loading ? (
          <Spinner label="Loading recurring transactions..." />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No recurring transactions yet"
            description="Mark salary, rent, or internet as recurring when you add income or an expense."
            action={
              <div className="flex gap-2">
                <Link to="/income/new"><Button>Add income</Button></Link>
                <Link to="/expenses/new"><Button variant="secondary">Add expense</Button></Link>
              </div>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((item) => (
              <li key={`${item.type}-${item._id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.description || categoryName(item)}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(item.date)} · {categoryName(item)} · {item.type} · {item.recurringFrequency}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-semibold ${item.type === 'income' ? 'text-emerald-800' : 'text-red-800'}`}>
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount, currency)}
                  </p>
                  <Link
                    to={`/${item.type === 'income' ? 'income' : 'expenses'}/${item._id}/edit`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
