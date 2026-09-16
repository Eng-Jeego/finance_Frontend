import api from './api';

export const reportService = {
  async getOverview(params = {}) {
    return await api.get('/reports/overview', { params });
  },

  async getCategoryBreakdown(params = {}) {
    return await api.get('/reports/category-breakdown', { params });
  },

  async getTrends(params = {}) {
    return await api.get('/reports/trends', { params });
  },

  async getIncomeSources(params = {}) {
    return await api.get('/reports/income-sources', { params });
  },

  async getPaymentMethods(params = {}) {
    return await api.get('/reports/payment-methods', { params });
  },
};

export default reportService;
