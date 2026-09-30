import api from './api';

export const authService = {
  login: async (phoneNumber: string, password: string) => {
    const res = await api.post('/auth/login', { phoneNumber, password });
    return res.data;
  },

  signup: async (payload: any) => {
    const res = await api.post('/auth/signup', payload);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};
