import api from './api';

export const budgetService = {
  async getBudgets(month, year) {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return await api.get('/budgets', { params });
  },

  async getBudgetById(id) {
    return await api.get(`/budgets/${id}`);
  },

  async createBudget(budgetData) {
    return await api.post('/budgets', budgetData);
  },

  async updateBudget(id, budgetData) {
    return await api.put(`/budgets/${id}`, budgetData);
  },

  async deleteBudget(id) {
    return await api.delete(`/budgets/${id}`);
  },
};

export default budgetService;
