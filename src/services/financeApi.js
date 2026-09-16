import api from './api';

export const categoryApi = {
  list: (params) => api.get('/categories', { params }),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const incomeApi = {
  list: (params) => api.get('/incomes', { params }),
  get: (id) => api.get(`/incomes/${id}`),
  create: (payload) => api.post('/incomes', payload),
  update: (id, payload) => api.put(`/incomes/${id}`, payload),
  remove: (id) => api.delete(`/incomes/${id}`),
};

export const expenseApi = {
  list: (params) => api.get('/expenses', { params }),
  get: (id) => api.get(`/expenses/${id}`),
  create: (payload) => api.post('/expenses', payload),
  update: (id, payload) => api.put(`/expenses/${id}`, payload),
  remove: (id) => api.delete(`/expenses/${id}`),
};

export const budgetApi = {
  list: (params) => api.get('/budgets', { params }),
  get: (id) => api.get(`/budgets/${id}`),
  create: (payload) => api.post('/budgets', payload),
  update: (id, payload) => api.put(`/budgets/${id}`, payload),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  recent: (limit = 8) => api.get('/dashboard/recent', { params: { limit } }),
  charts: () => api.get('/dashboard/charts'),
};

export const reportApi = {
  overview: (params) => api.get('/reports/overview', { params }),
  categoryBreakdown: (params) => api.get('/reports/category-breakdown', { params }),
  trends: (params) => api.get('/reports/trends', { params }),
  incomeSources: (params) => api.get('/reports/income-sources', { params }),
  paymentMethods: (params) => api.get('/reports/payment-methods', { params }),
  budgets: (params) => api.get('/reports/budgets', { params }),
};
