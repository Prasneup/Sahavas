import api from './api';
import { Listing } from '../types/room';

export const roomService = {
  getListings: async (): Promise<Listing[]> => {
    const res = await api.get('/listings');
    return res.data;
  },

  getMyListings: async (): Promise<Listing[]> => {
    const res = await api.get('/listings/my');
    return res.data;
  },

  getSavedListings: async (): Promise<Listing[]> => {
    const res = await api.get('/listings/saved');
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/listings/stats');
    return res.data;
  },

  getListingDetails: async (id: string): Promise<Listing> => {
    const res = await api.get(`/listings/${id}`);
    return res.data;
  },

  createListing: async (listing: Listing): Promise<Listing> => {
    const res = await api.post('/listings', listing);
    return res.data;
  },

  updateListing: async (id: string, listing: Listing): Promise<Listing> => {
    const res = await api.put(`/listings/${id}`, listing);
    return res.data;
  },

  deleteListing: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
  },

  saveListing: async (id: string): Promise<void> => {
    await api.post(`/listings/${id}/save`);
  },

  unsaveListing: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}/save`);
  }
};
