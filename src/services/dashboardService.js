import api from './api';

export const dashboardService = {
  async getSummary() {
    return await api.get('/dashboard/summary');
  },

  async getRecentTransactions(limit = 5) {
    return await api.get('/dashboard/recent', { params: { limit } });
  },

  async getCharts() {
    return await api.get('/dashboard/charts');
  },
};

export default dashboardService;
