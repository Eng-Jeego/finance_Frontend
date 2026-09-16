import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import incomeService from '../services/incomeService';
import categoryService from '../services/categoryService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
import { RECURRING_FREQUENCIES, DEFAULT_INCOME_SOURCES } from '../utils/constants';

const Incomes = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  // Table state
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeIncome, setActiveIncome] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    categoryId: '',
    date: formatDateForInput(new Date()),
    description: '',
    isRecurring: false,
    recurringFrequency: 'none',
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories('income');
        if (res.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('[Categories Fetch Error]', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch incomes
  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await incomeService.getIncomes({
        page,
        limit: 10,
        search,
        categoryId: selectedCategory,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setIncomes(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load incomes', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, startDate, endDate, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveIncome(null);
    setFormData({
      amount: '',
      source: '',
      categoryId: categories.length > 0 ? categories[0]._id : '',
      date: formatDateForInput(new Date()),
      description: '',
      isRecurring: false,
      recurringFrequency: 'none',
    });
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (income) => {
    setModalMode('edit');
    setActiveIncome(income);
    setFormData({
      amount: income.amount,
      source: income.source,
      categoryId: income.categoryId?._id || income.categoryId,
      date: formatDateForInput(income.date),
      description: income.description || '',
      isRecurring: income.isRecurring || false,
      recurringFrequency: income.recurringFrequency || 'none',
    });
    setIsModalOpen(true);
  };

  // Handle submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }
    if (!formData.source.trim()) {
      showToast('Please enter an income source', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await incomeService.createIncome(formData);
        showToast('Income recorded successfully', 'success');
      } else {
        await incomeService.updateIncome(activeIncome._id, formData);
        showToast('Income updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchIncomes();
    } catch (err) {
      showToast(err.message || 'Error saving income', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle confirm delete
  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return;
    setDeleteLoading(true);
    try {
      await incomeService.deleteIncome(incomeToDelete._id);
      showToast('Income record deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      fetchIncomes();
    } catch (err) {
      showToast(err.message || 'Failed to delete income', 'error');
    } finally {
      setDeleteLoading(false);
      setIncomeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Income Records</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all your salary, investments, and revenue streams.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Add Income
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <Input
            placeholder="Search description or source..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* Category Filter */}
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
          />

          {/* Start Date */}
          <Input
            type="date"
            placeholder="From date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />

          {/* End Date */}
          <Input
            type="date"
            placeholder="To date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Transactions Table */}
      <Card bodyClassName="p-0">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading income records..." />
          </div>
        ) : incomes.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No income transactions found"
              description="No records match your active search filters. Try clearing filters or add your first income."
              actionLabel="Add Income"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Source</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {item.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={item.categoryId?.color} size="sm">
                          {item.categoryId?.name || 'General'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.isRecurring ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <RefreshCw className="w-3 h-3 animate-spin-slow" />
                            {item.recurringFrequency}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">One-time</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                        +{formatCurrency(item.amount, currency)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Income"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIncomeToDelete(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Income"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={10}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Income Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Record New Income' : 'Edit Income Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefix={currency}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Income Source
            </label>
            <input
              type="text"
              list="income-sources"
              placeholder="e.g. Monthly Salary, Freelance project"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              required
            />
            <datalist id="income-sources">
              {DEFAULT_INCOME_SOURCES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Description (Optional)"
            placeholder="Add any extra notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Recurring Option */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isRecurring: e.target.checked,
                    recurringFrequency: e.target.checked ? 'monthly' : 'none',
                  })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                This is a recurring income stream
              </span>
            </label>

            {formData.isRecurring && (
              <Select
                label="Frequency"
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                options={RECURRING_FREQUENCIES.filter((f) => f.value !== 'none')}
              />
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={formLoading}>
              {modalMode === 'create' ? 'Save Income' : 'Update Income'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Income Record"
        message={`Are you sure you want to permanently remove this income of ${
          incomeToDelete ? formatCurrency(incomeToDelete.amount, currency) : ''
        }? This will adjust your total balance and savings.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Incomes;
