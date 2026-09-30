import api from './api';
import { Notification } from '../types/notification';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/notifications/unread/count');
    return res.data?.unreadCount || 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  }
};
