import api from './api';

export const categoryService = {
  async getCategories(type) {
    const params = type ? { type } : {};
    return await api.get('/categories', { params });
  },

  async createCategory(categoryData) {
    return await api.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return await api.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
