import { useEffect, useState } from 'react';
import { budgetApi, categoryApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MONTHS } from '../constants';
import { formatMoney } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/FormField';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';

export default function BudgetsPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const currency = currentUser?.currency || 'USD';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categoryId: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    categoryApi.list({ type: 'expense' }).then(({ data }) => {
      const list = data.data.categories || [];
      setCategories(list);
      setForm((prev) => ({ ...prev, categoryId: prev.categoryId || list[0]?._id || '' }));
    });
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await budgetApi.list({ month, year });
      setSummary(data.data.summary);
      setBudgets(data.data.budgets || []);
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to load budgets'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month, year]);

  const onCreate = async (event) => {
    event.preventDefault();
    if (!(Number(form.amount) > 0)) {
      notify('Budget amount must be greater than zero', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await budgetApi.create({
        categoryId: form.categoryId,
        amount: Number(form.amount),
        month,
        year,
      });
      notify('Budget created');
      setForm((prev) => ({ ...prev, amount: '' }));
      await load();
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to create budget'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUpdate = async (event) => {
    event.preventDefault();
    if (!(Number(editAmount) > 0)) {
      notify('Budget amount must be greater than zero', 'error');
      return;
    }
    setUpdating(true);
    try {
      await budgetApi.update(editItem._id, { amount: Number(editAmount) });
      notify('Budget updated');
      setEditItem(null);
      await load();
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to update budget'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await budgetApi.remove(deleteItem._id);
      notify('Budget removed');
      setDeleteItem(null);
      await load();
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to delete budget'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        <p className="text-sm text-slate-500">Spending is calculated live from expenses in the selected month.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select id="month" label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Input id="year" type="number" label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </div>

      <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <Select id="budgetCategory" label="Category" value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </Select>
        <Input id="budgetAmount" type="number" min="0.01" step="0.01" label="Budget amount" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
        <div className="flex items-end">
          <Button type="submit" loading={submitting} className="w-full">Create budget</Button>
        </div>
      </form>

      {loading ? (
        <Spinner label="Loading budgets..." />
      ) : (
        <>
          {summary ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5"><p className="text-sm text-slate-500">Budgeted</p><p className="mt-2 text-xl font-semibold">{formatMoney(summary.totalBudgeted, currency)}</p></Card>
              <Card className="p-5"><p className="text-sm text-slate-500">Spent</p><p className="mt-2 text-xl font-semibold">{formatMoney(summary.totalSpentInBudgets, currency)}</p></Card>
              <Card className="p-5"><p className="text-sm text-slate-500">Remaining</p><p className="mt-2 text-xl font-semibold">{formatMoney(summary.totalRemaining, currency)}</p></Card>
            </div>
          ) : null}

          <Card>
            <CardHeader title="Category progress" />
            {budgets.length === 0 ? (
              <EmptyState title="No budgets for this month" description="Create a category budget to monitor spending." />
            ) : (
              <ul className="space-y-5 p-5">
                {budgets.map((budget) => (
                  <li key={budget._id}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{budget.category?.name}</p>
                        <p className="text-xs text-slate-500">
                          Spent {formatMoney(budget.spentAmount, currency)} of {formatMoney(budget.amount, currency)}
                          {budget.isOverBudget
                            ? ` · Over by ${formatMoney(Math.abs(budget.remainingAmount), currency)}`
                            : ` · ${formatMoney(budget.remainingAmount, currency)} remaining`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditItem(budget);
                            setEditAmount(String(budget.amount));
                          }}
                        >
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteItem(budget)}>Delete</Button>
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${budget.isOverBudget ? 'bg-red-500' : budget.isNearLimit ? 'bg-amber-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                        role="progressbar"
                        aria-valuenow={budget.usagePercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${budget.category?.name} budget usage ${budget.usagePercentage} percent`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{budget.usagePercentage}% used{budget.isNearLimit ? ' · Near limit' : ''}{budget.isOverBudget ? ' · Over budget' : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      <Modal open={Boolean(editItem)} title="Update budget amount" onClose={() => setEditItem(null)}>
        <form onSubmit={confirmUpdate} className="space-y-4">
          <p className="text-sm text-slate-600">{editItem?.category?.name}</p>
          <Input
            id="editAmount"
            type="number"
            min="0.01"
            step="0.01"
            label="Budget amount"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button type="submit" loading={updating}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteItem)} title="Delete this budget?" onClose={() => setDeleteItem(null)}>
        <p className="text-sm text-slate-600">Expenses are not deleted. Only the monthly spending target is removed.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
