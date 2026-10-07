import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'USER',
    status: 'ACTIVE',
    currency: 'USD',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', role: 'USER', currency: 'USD' });
  const [editLoading, setEditLoading] = useState(false);

  const [statusDialogUser, setStatusDialogUser] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteDialogUser, setDeleteDialogUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, roleFilter, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createFormData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    if (!createFormData.email.trim()) {
      showToast('Email address is required', 'error');
      return;
    }
    if (!createFormData.password || createFormData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      await adminService.createUser(createFormData);
      showToast('New user account created successfully', 'success');
      setIsCreateOpen(false);
      setCreateFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'USER',
        status: 'ACTIVE',
        currency: 'USD',
      });
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit User
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditFormData({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      currency: u.currency || 'USD',
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editFormData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    setEditLoading(true);
    try {
      await adminService.updateUser(editingUser._id, editFormData);
      showToast('User profile updated successfully', 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async () => {
    if (!statusDialogUser) return;
    setStatusLoading(true);
    const newStatus = statusDialogUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(statusDialogUser._id, newStatus);
      showToast(`User successfully marked as ${newStatus}`, 'success');
      setStatusDialogUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await adminService.resetUserPassword(passwordResetUser._id, newPassword);
      showToast('User password has been reset successfully', 'success');
      setPasswordResetUser(null);
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deleteDialogUser) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deleteDialogUser._id);
      showToast('User and associated data permanently deleted', 'success');
      setDeleteDialogUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Management
            </h2>
            <Badge variant="purple" size="md">
              {pagination.total} registered
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, view financial summaries, manage permissions, and update user accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Users</option>
            <option value="INACTIVE">Inactive / Suspended</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Roles</option>
            <option value="USER">USER Role</option>
            <option value="ADMIN">ADMIN Role</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(':');
              setSortBy(field);
              setSortOrder(order);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="fullName:asc">Name (A-Z)</option>
            <option value="fullName:desc">Name (Z-A)</option>
            <option value="totalIncome:desc">Highest Income</option>
            <option value="totalExpenses:desc">Highest Expenses</option>
            <option value="transactionCount:desc">Most Active (Transactions)</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-2xl overflow-hidden border">
        {loading && users.length === 0 ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Loading user records..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            message="No user accounts match the current filter or search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSortChange('fullName')}
                  >
                    <div className="flex items-center gap-1.5">
                      User <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSortChange('createdAt')}
                  >
                    <div className="flex items-center gap-1.5">
                      Registered <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSortChange('totalIncome')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Total Income <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSortChange('totalExpenses')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Total Expenses <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSortChange('transactionCount')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Tx Count <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isCurrentAdminSelf = currentAdmin?._id === u._id;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {u.fullName ? u.fullName[0] : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {u.fullName}
                              </p>
                              {isCurrentAdminSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <Badge
                          variant={u.role === 'ADMIN' ? 'purple' : 'default'}
                          size="sm"
                        >
                          {u.role === 'ADMIN' ? 'Admin' : 'User'}
                        </Badge>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        <Badge
                          variant={u.status === 'ACTIVE' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Registration Date */}
                      <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Total Income */}
                      <td className="px-4 py-4 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(u.totalIncome, u.currency)}
                      </td>

                      {/* Total Expenses */}
                      <td className="px-4 py-4 text-right text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {formatCurrency(u.totalExpenses, u.currency)}
                      </td>

                      {/* Transaction Count */}
                      <td className="px-4 py-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        {u.transactionCount}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details */}
                          <Link
                            to={`/admin/users/${u._id}`}
                            title="View Financial Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit User */}
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit User Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Status (Activate / Deactivate) */}
                          <button
                            onClick={() => setStatusDialogUser(u)}
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setPasswordResetUser(u);
                              setNewPassword('');
                            }}
                            title="Reset User Password"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteDialogUser(u)}
                            disabled={isCurrentAdminSelf}
                            title={isCurrentAdminSelf ? 'Cannot delete yourself' : 'Delete User Account'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(newPage) => setPagination((p) => ({ ...p, page: newPage }))}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={createFormData.fullName}
            onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            value={createFormData.email}
            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="At least 6 characters"
            value={createFormData.password}
            onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
            required
            minLength={6}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Role
              </label>
              <select
                value={createFormData.role}
                onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Status
              </label>
              <select
                value={createFormData.status}
                onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Currency
            </label>
            <select
              value={createFormData.currency}
              onChange={(e) => setCreateFormData({ ...createFormData, currency: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.fullName || ''}`}
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
              <option value="USER">USER (Normal Customer)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Currency
            </label>
            <select
              value={editFormData.currency}
              onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
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
        isOpen={!!passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
        title={`Reset Password: ${passwordResetUser?.fullName || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new password for <span className="font-semibold text-slate-700 dark:text-slate-300">{passwordResetUser?.email}</span>. The user will need to log in with this new password immediately.
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
              onClick={() => setPasswordResetUser(null)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={passwordLoading}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusDialogUser}
        onClose={() => setStatusDialogUser(null)}
        onConfirm={handleToggleStatus}
        title={
          statusDialogUser?.status === 'ACTIVE'
            ? 'Deactivate User Account'
            : 'Activate User Account'
        }
        message={
          statusDialogUser?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate ${statusDialogUser?.email}? They will no longer be able to log in or use the application until reactivated.`
            : `Are you sure you want to activate ${statusDialogUser?.email}? They will regain full access to their account and data.`
        }
        confirmText={statusDialogUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        loading={statusLoading}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialogUser}
        onClose={() => setDeleteDialogUser(null)}
        onConfirm={handleDeleteUser}
        title="Permanently Delete User"
        message={`Are you sure you want to permanently delete ${deleteDialogUser?.email}? All associated financial records (incomes, expenses, categories, budgets) will be permanently erased. This action CANNOT be undone.`}
        confirmText="Permanently Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminUsers;
