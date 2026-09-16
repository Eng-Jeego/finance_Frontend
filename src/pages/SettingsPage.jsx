import { useEffect, useState } from 'react';
import { categoryApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/FormField';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';

export default function SettingsPage() {
  const { notify } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#64748b' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.list();
      setCategories(data.data.categories || []);
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to load categories'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      notify('Category name is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await categoryApi.create(form);
      notify('Category created');
      setForm({ name: '', type: form.type, color: '#64748b' });
      await load();
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to create category'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem || deleteItem.isDefault) return;
    try {
      await categoryApi.remove(deleteItem._id);
      notify('Category deleted');
      setDeleteItem(null);
      await load();
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to delete category'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage custom categories. System defaults cannot be changed.</p>
      </div>

      <Card>
        <CardHeader title="New custom category" />
        <form className="grid gap-3 p-5 md:grid-cols-4" onSubmit={onCreate}>
          <Input id="name" label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Select id="type" label="Type" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input id="color" type="color" label="Color" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} />
          <div className="flex items-end">
            <Button type="submit" className="w-full" loading={submitting}>Add category</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Your categories" subtitle="Defaults are shared. Custom categories belong only to you." />
        {loading ? (
          <Spinner label="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories" description="Default categories should appear after the first API call." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((category) => (
              <li key={category._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category.type} · {category.isDefault ? 'System default' : 'Custom'}
                    </p>
                  </div>
                </div>
                {!category.isDefault ? (
                  <Button variant="danger" size="sm" onClick={() => setDeleteItem(category)}>Delete</Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
