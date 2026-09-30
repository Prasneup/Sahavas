import api from './api';

export const roommateService = {
  getStats: async () => {
    const res = await api.get('/roommates/stats');
    return res.data;
  },

  getSuggestions: async () => {
    const res = await api.get('/matching/suggestions');
    return res.data;
  },

  updatePreferences: async (payload: any) => {
    const res = await api.post('/matching/preferences', payload);
    return res.data;
  },

  swipe: async (targetUserId: string, actionType: 'SAVE' | 'PASS' | 'INTERESTED') => {
    const res = await api.post('/roommates/swipe', { targetUserId, actionType });
    return res.data;
  },

  getCompatibility: async (id: string) => {
    const res = await api.get(`/matching/compatibility/${id}`);
    return res.data;
  }
};
