import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Shield,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Server,
  Lock,
  CheckCircle,
} from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

const AdminSettings = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        action: actionFilter,
        search: searchTerm,
      });

      if (res.success && res.data) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, searchTerm, showToast]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionBadgeVariant = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'info';
      case 'VIEW_USER':
        return 'default';
      case 'UPDATE_USER':
        return 'purple';
      case 'ACTIVATE_USER':
        return 'success';
      case 'DEACTIVATE_USER':
        return 'warning';
      case 'RESET_PASSWORD':
        return 'warning';
      case 'DELETE_USER':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Settings & Audit Logs
            </h2>
            <Badge variant="purple" size="sm">
              Security
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track all administrative events, review system security rules, and inspect operational activity.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAuditLogs} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Logs
        </Button>
      </div>

      {/* System Security & Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Access Control Model</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Two-Tier RBAC (USER / ADMIN)
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Strict role isolation. Public registrations default to USER. Dual-layer authorization enforced on frontend and API endpoints.
          </p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Privilege Abuse Safeguards</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Active & Enforced
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Prevents deactivating or deleting the last administrator account. Passwords never exposed in logs or API responses.
          </p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">System Environment</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Live & Operational
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Database connection healthy. Dedicated administrative audit log tracking enabled for all operations.
          </p>
        </Card>
      </div>

      {/* Audit Logs Filter Toolbar */}
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit descriptions or user emails..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full sm:w-56 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Action Types</option>
            <option value="LOGIN">Admin Login</option>
            <option value="VIEW_USER">View User</option>
            <option value="UPDATE_USER">Update User</option>
            <option value="ACTIVATE_USER">Activate User</option>
            <option value="DEACTIVATE_USER">Deactivate User</option>
            <option value="RESET_PASSWORD">Reset Password</option>
            <option value="DELETE_USER">Delete User</option>
          </select>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="rounded-2xl overflow-hidden border">
        {loading && logs.length === 0 ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Loading audit logs..." />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Found"
            message="No administrative actions match your current search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Administrator</th>
                  <th className="px-4 py-3.5">Target User</th>
                  <th className="px-5 py-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {log.adminEmail}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {log.targetUserEmail || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(newPage) => setPagination((p) => ({ ...p, page: newPage }))}
        />
      </Card>
    </div>
  );
};

export default AdminSettings;
