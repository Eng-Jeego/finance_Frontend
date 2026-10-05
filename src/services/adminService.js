import api from './api';

const adminService = {
  /**
   * Get system-wide dashboard statistics and charts
   */
  async getDashboard() {
    return await api.get('/admin/dashboard');
  },

  /**
   * Get paginated, searchable, and filterable list of users
   */
  async getUsers(params = {}) {
    return await api.get('/admin/users', { params });
  },

  /**
   * Get single user details and financial activity
   */
  async getUserById(id, params = {}) {
    return await api.get(`/admin/users/${id}`, { params });
  },

  /**
   * Edit basic user profile information and role
   */
  async updateUser(id, userData) {
    return await api.patch(`/admin/users/${id}`, userData);
  },

  /**
   * Activate or deactivate/suspend a user account
   */
  async updateUserStatus(id, status) {
    return await api.patch(`/admin/users/${id}/status`, { status });
  },

  /**
   * Reset a user's password securely
   */
  async resetUserPassword(id, newPassword) {
    return await api.post(`/admin/users/${id}/reset-password`, { newPassword });
  },

  /**
   * Delete a user account and associated records
   */
  async deleteUser(id) {
    return await api.delete(`/admin/users/${id}`);
  },

  /**
   * Fetch administrative audit logs
   */
  async getAuditLogs(params = {}) {
    return await api.get('/admin/audit-logs', { params });
  },

  /**
   * Get system-wide financial and user reports
   */
  async getReports() {
    return await api.get('/admin/reports');
  },
};

export default adminService;
