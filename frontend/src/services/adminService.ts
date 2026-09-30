import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  getVerifications: async () => {
    const res = await api.get('/admin/verifications');
    return res.data;
  },

  getListings: async () => {
    const res = await api.get('/admin/listings');
    return res.data;
  },

  getReports: async () => {
    const res = await api.get('/admin/reports');
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  reviewVerification: async (id: string, status: string, reason: string) => {
    const res = await api.post(`/admin/verifications/${id}/review`, { status, reason });
    return res.data;
  },

  reviewListing: async (id: string, status: string, reason: string) => {
    const res = await api.post(`/admin/listings/${id}/review`, { status, reason });
    return res.data;
  },

  resolveReport: async (id: string) => {
    const res = await api.post(`/admin/reports/${id}/resolve`);
    return res.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const res = await api.post(`/admin/users/${id}/status`, { status });
    return res.data;
  }
};
