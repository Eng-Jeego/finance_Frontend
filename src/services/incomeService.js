import api from './api';

export const incomeService = {
  async getIncomes(params = {}) {
    return await api.get('/incomes', { params });
  },

  async getIncomeById(id) {
    return await api.get(`/incomes/${id}`);
  },

  async createIncome(incomeData) {
    return await api.post('/incomes', incomeData);
  },

  async updateIncome(id, incomeData) {
    return await api.put(`/incomes/${id}`, incomeData);
  },

  async deleteIncome(id) {
    return await api.delete(`/incomes/${id}`);
  },
};

export default incomeService;
