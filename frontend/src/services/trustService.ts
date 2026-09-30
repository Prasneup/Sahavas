import api from './api';
import { ProfileData } from '../types/user';

export const trustService = {
  getTrustMeDetails: async () => {
    const res = await api.get('/trust/me');
    return res.data;
  },

  submitVerification: async (payload: { documentType: string; registrationNumber: string; imageUrl: string }) => {
    const res = await api.post('/trust/verify', payload);
    return res.data;
  },

  getMyProfile: async (): Promise<ProfileData> => {
    const res = await api.get('/profiles/me');
    return res.data;
  },

  getProfile: async (id: string): Promise<ProfileData> => {
    const res = await api.get(`/profiles/${id}`);
    return res.data;
  },

  updateMyProfile: async (profile: ProfileData): Promise<ProfileData> => {
    const res = await api.put('/profiles/me', profile);
    return res.data;
  },

  getColleges: async (): Promise<any[]> => {
    const res = await api.get('/colleges');
    return res.data;
  },

  getRelocationProgress: async () => {
    const res = await api.get('/relocation/progress');
    return res.data;
  },

  toggleRelocationTask: async (taskName: string, completed: boolean) => {
    const res = await api.post('/relocation/progress/toggle', { taskName, completed });
    return res.data;
  }
};
