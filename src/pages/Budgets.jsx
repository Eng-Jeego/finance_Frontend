import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle2, Edit2, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { MONTH_NAMES } from '../utils/constants';

const Budgets = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalBudgeted: 0,
    totalSpentInBudgets: 0,
    totalRemaining: 0,
    overallUsagePercentage: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeBudget, setActiveBudget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch expense categories
  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        const res = await categoryService.getCategories('expense');
        if (res.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('[Categories Fetch Error]', err);
      }
    };
    fetchExpenseCategories();
  }, []);

  // Fetch budgets for selected month/year
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgets(selectedMonth, selectedYear);
      if (res.success) {
        setBudgets(res.data.budgets || []);
        setSummary(
          res.data.summary || {
            totalBudgeted: 0,
            totalSpentInBudgets: 0,
            totalRemaining: 0,
            overallUsagePercentage: 0,
          }
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to load budgets', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveBudget(null);
    setFormData({
      categoryId: categories.length > 0 ? categories[0]._id : '',
      amount: '',
      month: selectedMonth,
      year: selectedYear,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (budget) => {
    setModalMode('edit');
    setActiveBudget(budget);
    setFormData({
      categoryId: budget.category?._id || budget.categoryId,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setIsModalOpen(true);
  };

  // Submit Budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Please enter a valid budget amount greater than 0', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await budgetService.createBudget(formData);
        showToast('Budget created successfully', 'success');
      } else {
        await budgetService.updateBudget(activeBudget._id, { amount: formData.amount });
        showToast('Budget updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      showToast(err.message || 'Error saving budget', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    setDeleteLoading(true);
    try {
      await budgetService.deleteBudget(budgetToDelete._id);
      showToast('Budget target removed successfully', 'success');
      setIsDeleteDialogOpen(false);
      fetchBudgets();
    } catch (err) {
      showToast(err.message || 'Failed to delete budget', 'error');
    } finally {
      setDeleteLoading(false);
      setBudgetToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Month/Year Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Budget Planner</h2>
          <p className="text-sm text-slate-500 mt-1">
            Set and track spending boundaries to avoid overspending in key categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            New Budget
          </Button>
        </div>
      </div>

      {/* Monthly Budget Performance Summary */}
      <Card bodyClassName="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Total Budgeted
            </span>
            <h4 className="text-2xl font-bold mt-1 text-white">
              {formatCurrency(summary.totalBudgeted, currency)}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all categories</p>
          </div>

          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Total Spent
            </span>
            <h4 className="text-2xl font-bold mt-1 text-rose-400">
              {formatCurrency(summary.totalSpentInBudgets, currency)}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded this month</p>
          </div>

          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Remaining Budget
            </span>
            <h4
              className={`text-2xl font-bold mt-1 ${
                summary.totalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(summary.totalRemaining, currency)}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary.totalRemaining < 0 ? 'Overall deficit' : 'Under budget'}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Overall Usage
            </span>
            <h4 className="text-2xl font-bold mt-1 text-white">
              {formatPercentage(summary.overallUsagePercentage)}
            </h4>
            {/* Global progress bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  summary.overallUsagePercentage > 100
                    ? 'bg-rose-500'
                    : summary.overallUsagePercentage >= 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(summary.overallUsagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner message="Calculating budget spending..." />
        </div>
      ) : budgets.length === 0 ? (
        <Card bodyClassName="p-8">
          <EmptyState
            icon={Target}
            title={`No budgets set for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
            description="Create category budgets to gain visibility into your spending thresholds."
            actionLabel="Create Budget"
            onAction={handleOpenCreate}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((item) => {
            let statusColor = 'emerald';
            if (item.isOverBudget) statusColor = 'rose';
            else if (item.isNearLimit) statusColor = 'amber';

            return (
              <Card
                key={item._id}
                className={`border-t-4 ${
                  item.isOverBudget
                    ? 'border-t-rose-500'
                    : item.isNearLimit
                    ? 'border-t-amber-500'
                    : 'border-t-emerald-500'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge color={item.category?.color} size="md">
                        {item.category?.name || 'Category'}
                      </Badge>
                      <h4 className="text-lg font-bold text-slate-900 mt-2">
                        {formatCurrency(item.amount, currency)}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Edit Limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setBudgetToDelete(item);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Spent: <span className="font-semibold text-slate-800">{formatCurrency(item.spentAmount, currency)}</span>
                      </span>
                      <span className="font-bold text-slate-700">
                        {formatPercentage(item.usagePercentage)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          item.isOverBudget
                            ? 'bg-rose-500'
                            : item.isNearLimit
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(item.usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Indicator Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {item.isOverBudget ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Over by {formatCurrency(item.spentAmount - item.amount, currency)}
                      </span>
                    ) : item.isNearLimit ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Approaching limit ({formatCurrency(item.remainingAmount, currency)} left)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {formatCurrency(item.remainingAmount, currency)} remaining
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Set Category Monthly Budget' : 'Update Budget Limit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalMode === 'create' && (
            <Select
              label="Expense Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              required
            />
          )}

          <Input
            label="Monthly Limit Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 350.00"
            prefix={currency}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value, 10) })}
              options={MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }))}
              disabled={modalMode === 'edit'}
            />

            <Select
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
              options={[2024, 2025, 2026, 2027, 2028].map((y) => ({ value: y, label: y }))}
              disabled={modalMode === 'edit'}
            />
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
              {modalMode === 'create' ? 'Create Budget' : 'Update Limit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Budget Target"
        message={`Are you sure you want to remove the budget for ${
          budgetToDelete?.category?.name || 'this category'
        }? Your transaction records will remain unaffected.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Budgets;
