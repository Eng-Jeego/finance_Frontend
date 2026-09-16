import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import expenseService from '../services/expenseService';
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
import { PAYMENT_METHODS, RECURRING_FREQUENCIES } from '../utils/constants';

const Expenses = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  // Table state
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeExpense, setActiveExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    date: formatDateForInput(new Date()),
    description: '',
    paymentMethod: 'Card',
    isRecurring: false,
    recurringFrequency: 'none',
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories('expense');
        if (res.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('[Categories Fetch Error]', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch expenses with backend query
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseService.getExpenses({
        page,
        limit: 10,
        search,
        categoryId: selectedCategory,
        paymentMethod: selectedPaymentMethod,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setExpenses(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, selectedPaymentMethod, startDate, endDate, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveExpense(null);
    setFormData({
      amount: '',
      categoryId: categories.length > 0 ? categories[0]._id : '',
      date: formatDateForInput(new Date()),
      description: '',
      paymentMethod: 'Card',
      isRecurring: false,
      recurringFrequency: 'none',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (expense) => {
    setModalMode('edit');
    setActiveExpense(expense);
    setFormData({
      amount: expense.amount,
      categoryId: expense.categoryId?._id || expense.categoryId,
      date: formatDateForInput(expense.date),
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'Card',
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || 'none',
    });
    setIsModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Please enter a valid expense amount greater than 0', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await expenseService.createExpense(formData);
        showToast('Expense recorded successfully', 'success');
      } else {
        await expenseService.updateExpense(activeExpense._id, formData);
        showToast('Expense updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      showToast(err.message || 'Error saving expense', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await expenseService.deleteExpense(expenseToDelete._id);
      showToast('Expense record deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      fetchExpenses();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setDeleteLoading(false);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Records</h2>
          <p className="text-sm text-slate-500 mt-1">
            Log and categorize every dollar spent to monitor your financial outflow.
          </p>
        </div>
        <Button variant="danger" icon={Plus} onClick={handleOpenCreate}>
          Add Expense
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <Input
            placeholder="Search description..."
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

          {/* Payment Method Filter */}
          <Select
            placeholder="All Payment Methods"
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value);
              setPage(1);
            }}
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
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

      {/* Expense Transactions Table */}
      <Card bodyClassName="p-0">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading expense records..." />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No expenses recorded"
              description="No expenses match your active filters. Click Add Expense to log a new purchase."
              actionLabel="Add Expense"
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
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Recurring</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={item.categoryId?.color} size="sm">
                          {item.categoryId?.name || 'General'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {item.paymentMethod || 'Card'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.isRecurring ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <RefreshCw className="w-3 h-3" />
                            {item.recurringFrequency}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">One-time</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600 whitespace-nowrap">
                        -{formatCurrency(item.amount, currency)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setExpenseToDelete(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Expense"
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

      {/* Add / Edit Expense Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Record New Expense' : 'Edit Expense Record'}
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

          <Select
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
          />

          <Input
            label="Description (Optional)"
            placeholder="What was this expense for?"
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
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                This is a recurring bill / subscription
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
            <Button type="submit" variant="danger" size="md" loading={formLoading}>
              {modalMode === 'create' ? 'Save Expense' : 'Update Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense Record"
        message={`Are you sure you want to delete this expense of ${
          expenseToDelete ? formatCurrency(expenseToDelete.amount, currency) : ''
        }? This will update your calculated balance and category budgets.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Expenses;
