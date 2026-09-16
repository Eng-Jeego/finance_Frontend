import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { incomeApi, categoryApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { INCOME_SOURCES, RECURRING_FREQUENCIES } from '../constants';
import { todayInputDate, toInputDate } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/FormField';
import { Spinner } from '../components/ui/Feedback';

const emptyForm = {
  amount: '',
  source: 'Salary',
  categoryId: '',
  date: todayInputDate(),
  description: '',
  isRecurring: false,
  recurringFrequency: 'monthly',
};

export default function IncomeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryApi.list({ type: 'income' }).then(({ data }) => {
      const list = data.data.categories || [];
      setCategories(list);
      setForm((prev) => ({ ...prev, categoryId: prev.categoryId || list[0]?._id || '' }));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const { data } = await incomeApi.get(id);
        const income = data.data.income;
        setForm({
          amount: income.amount,
          source: income.source,
          categoryId: income.categoryId?._id || income.categoryId,
          date: toInputDate(income.date),
          description: income.description || '',
          isRecurring: Boolean(income.isRecurring),
          recurringFrequency: income.recurringFrequency || 'monthly',
        });
      } catch (error) {
        notify(getErrorMessage(error, 'Unable to load income'), 'error');
        navigate('/income');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate, notify]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const next = {};
    if (!(Number(form.amount) > 0)) next.amount = 'Amount must be greater than zero';
    if (!form.source) next.source = 'Source is required';
    if (!form.categoryId) next.categoryId = 'Category is required';
    if (!form.date) next.date = 'Date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      ...form,
      amount: Number(form.amount),
      recurringFrequency: form.isRecurring ? form.recurringFrequency : 'none',
    };
    try {
      if (isEdit) {
        await incomeApi.update(id, payload);
        notify('Income updated');
      } else {
        await incomeApi.create(payload);
        notify('Income created');
        setForm({ ...emptyForm, categoryId: categories[0]?._id || '' });
      }
      navigate('/income');
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to save income'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading income..." />;

  return (
    <Card className="max-w-2xl">
      <CardHeader title={isEdit ? 'Edit income' : 'Add income'} subtitle="Amounts must be greater than zero." />
      <form className="grid gap-4 p-5" onSubmit={onSubmit} noValidate>
        <Input id="amount" name="amount" type="number" min="0.01" step="0.01" label="Amount" required value={form.amount} onChange={onChange} error={errors.amount} />
        <Select id="source" name="source" label="Source" required value={form.source} onChange={onChange} error={errors.source}>
          {INCOME_SOURCES.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </Select>
        <Select id="categoryId" name="categoryId" label="Category" required value={form.categoryId} onChange={onChange} error={errors.categoryId}>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </Select>
        <Input id="date" name="date" type="date" label="Date" required value={form.date} onChange={onChange} error={errors.date} />
        <Textarea id="description" name="description" label="Description" value={form.description} onChange={onChange} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={onChange} />
          Recurring income
        </label>
        {form.isRecurring ? (
          <Select id="recurringFrequency" name="recurringFrequency" label="Frequency" value={form.recurringFrequency} onChange={onChange}>
            {RECURRING_FREQUENCIES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </Select>
        ) : null}
        <div className="flex gap-2">
          <Button type="submit" loading={submitting}>{isEdit ? 'Save changes' : 'Create income'}</Button>
          <Button variant="secondary" onClick={() => navigate('/income')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
