import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
  Edit2,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Filter,
  PiggyBank,
} from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Date filter state
  const [dateFilter, setDateFilter] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', role: 'USER', currency: 'USD' });
  const [editLoading, setEditLoading] = useState(false);

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Compute dates based on filter selection
  const getDateRangeParams = useCallback(() => {
    const now = new Date();
    if (dateFilter === 'THIS_MONTH') {
      const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    } else if (dateFilter === 'LAST_MONTH') {
      const start = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
      const end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999));
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    } else if (dateFilter === 'LAST_30_DAYS') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    } else if (dateFilter === 'CUSTOM' && customStartDate && customEndDate) {
      return {
        startDate: new Date(customStartDate).toISOString(),
        endDate: new Date(customEndDate + 'T23:59:59.999Z').toISOString(),
      };
    }
    return {};
  }, [dateFilter, customStartDate, customEndDate]);

  // Fetch single user details and financial activity
  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = getDateRangeParams();
      const res = await adminService.getUserById(id, params);
      if (res.success && res.data) {
        setUserData(res.data);
        setEditFormData({
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          role: res.data.user.role,
          currency: res.data.user.currency || 'USD',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load user details');
      showToast(err.message || 'Failed to load user details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, getDateRangeParams, showToast]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Handle Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await adminService.updateUser(id, editFormData);
      showToast('User profile updated successfully', 'success');
      setIsEditOpen(false);
      fetchUserDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setResetLoading(true);
    try {
      await adminService.resetUserPassword(id, newPassword);
      showToast('Password has been reset successfully', 'success');
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async () => {
    setStatusLoading(true);
    const newStatus = userData.user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(id, newStatus);
      showToast(`User status updated to ${newStatus}`, 'success');
      setIsStatusDialogOpen(false);
      fetchUserDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(id);
      showToast('User and associated data permanently deleted', 'success');
      setIsDeleteDialogOpen(false);
      navigate('/admin/users');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner message="Loading user financial profile..." size="lg" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <Card className="p-6 text-center text-rose-600 dark:text-rose-400">
          <p>{error || 'User not found'}</p>
        </Card>
      </div>
    );
  }

  const { user, summary, filteredSummary, recentIncomes, recentExpenses } = userData;
  const currency = user.currency || 'USD';
  const isSelf = currentAdmin?._id === user._id;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users List
        </Link>
      </div>

      {/* User Header Profile Card */}
      <Card className="p-6 rounded-2xl border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase shrink-0 shadow-md ${
                user.role === 'ADMIN'
                  ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user.fullName}
                </h2>
                <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'} size="sm">
                  {user.role}
                </Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                  {user.status}
                </Badge>
                {isSelf && (
                  <Badge variant="info" size="sm">
                    Logged-in Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{user.email}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mt-2">
                <span>Currency: <strong className="text-slate-700 dark:text-slate-300">{currency}</strong></span>
                <span>•</span>
                <span>Registered: <strong className="text-slate-700 dark:text-slate-300">{formatDate(user.createdAt)}</strong></span>
                <span>•</span>
                <span>User ID: <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{user._id}</code></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetOpen(true)}
              className="gap-1.5 text-xs"
            >
              <KeyRound className="w-3.5 h-3.5" /> Reset Password
            </Button>
            <Button
              variant={user.status === 'ACTIVE' ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setIsStatusDialogOpen(true)}
              className="gap-1.5 text-xs"
            >
              {user.status === 'ACTIVE' ? (
                <>
                  <UserX className="w-3.5 h-3.5 text-amber-500" /> Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" /> Activate
                </>
              )}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isSelf}
              title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Date Range Filter Section */}
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Filter Financial Activity:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'THIS_MONTH', 'LAST_MONTH', 'LAST_30_DAYS', 'CUSTOM'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setDateFilter(filterKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dateFilter === filterKey
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filterKey.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {dateFilter === 'CUSTOM' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        )}
      </Card>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Income */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {dateFilter === 'ALL' ? 'Total Income' : 'Filtered Income'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(
              dateFilter === 'ALL' ? summary.totalIncome : filteredSummary.incomeTotal,
              currency
            )}
          </p>
          <span className="text-[11px] text-slate-400">
            {dateFilter === 'ALL' ? summary.incomeCount : filteredSummary.incomeCount} transactions
          </span>
        </Card>

        {/* Total Expenses */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {dateFilter === 'ALL' ? 'Total Expenses' : 'Filtered Expenses'}
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(
              dateFilter === 'ALL' ? summary.totalExpenses : filteredSummary.expenseTotal,
              currency
            )}
          </p>
          <span className="text-[11px] text-slate-400">
            {dateFilter === 'ALL' ? summary.expenseCount : filteredSummary.expenseCount} transactions
          </span>
        </Card>

        {/* Current Balance */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Balance</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(summary.currentBalance, currency)}
          </p>
          <span className="text-[11px] text-slate-400">Lifetime balance</span>
        </Card>

        {/* Net Savings */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {dateFilter === 'ALL' ? 'Net Savings' : 'Period Net'}
            </span>
            <PiggyBank className="w-4 h-4 text-sky-500" />
          </div>
          <p className={`text-lg font-bold mt-2 ${
            (dateFilter === 'ALL' ? summary.savings : filteredSummary.net) >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(
              dateFilter === 'ALL' ? summary.savings : filteredSummary.net,
              currency
            )}
          </p>
          <span className="text-[11px] text-slate-400">Income minus expenses</span>
        </Card>

        {/* Total Transactions */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Tx</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {dateFilter === 'ALL' ? summary.transactionCount : (filteredSummary.incomeCount + filteredSummary.expenseCount)}
          </p>
          <span className="text-[11px] text-slate-400">All activity records</span>
        </Card>

        {/* Budgets Count */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Budgets</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {summary.budgetCount}
          </p>
          <span className="text-[11px] text-slate-400">Categories budgeted</span>
        </Card>
      </div>

      {/* Recent Activity Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incomes Table */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Incomes
              </h3>
            </div>
            <Badge variant="success" size="sm">
              {recentIncomes.length} records
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Source</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentIncomes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No income records in this period
                    </td>
                  </tr>
                ) : (
                  recentIncomes.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        {formatDate(inc.date)}
                      </td>
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {inc.source}
                      </td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${inc.categoryId?.color || '#10b981'}15`,
                            color: inc.categoryId?.color || '#10b981',
                          }}
                        >
                          {inc.categoryId?.name || 'Income'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(inc.amount, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Expenses Table */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>
            </div>
            <Badge variant="danger" size="sm">
              {recentExpenses.length} records
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No expense records in this period
                    </td>
                  </tr>
                ) : (
                  recentExpenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${exp.categoryId?.color || '#ef4444'}15`,
                            color: exp.categoryId?.color || '#ef4444',
                          }}
                        >
                          {exp.categoryId?.name || 'Expense'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        {exp.paymentMethod || 'Card'}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(exp.amount, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Profile: ${user.fullName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label="Full Name"
            value={editFormData.fullName}
            onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Role
            </label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              value={editFormData.currency}
              onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
              <option value="INR">INR</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title={`Reset Password: ${user.fullName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new temporary or permanent password for <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>.
          </p>

          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetOpen(false)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={resetLoading}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleToggleStatus}
        title={user.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
        message={
          user.status === 'ACTIVE'
            ? `Deactivating ${user.email} will immediately prevent them from logging in or using the application.`
            : `Activating ${user.email} will restore their login access.`
        }
        confirmText={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        loading={statusLoading}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Permanently Delete User"
        message={`Are you sure you want to permanently delete ${user.email}? This will irreversibly remove the user and ALL associated financial transactions and budgets.`}
        confirmText="Permanently Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminUserDetails;
