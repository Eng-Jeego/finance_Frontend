import api from './api';

export const expenseService = {
  async getExpenses(params = {}) {
    return await api.get('/expenses', { params });
  },

  async getExpenseById(id) {
    return await api.get(`/expenses/${id}`);
  },

  async createExpense(expenseData) {
    return await api.post('/expenses', expenseData);
  },

  async updateExpense(id, expenseData) {
    return await api.put(`/expenses/${id}`, expenseData);
  },

  async deleteExpense(id) {
    return await api.delete(`/expenses/${id}`);
  },
};

export default expenseService;
