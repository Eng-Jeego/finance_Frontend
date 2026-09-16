import api from './api';

export const authService = {
  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  },

  async changePassword(passwordData) {
    return await api.put('/auth/change-password', passwordData);
  },
};

export default authService;
