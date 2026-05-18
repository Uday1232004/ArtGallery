import { create } from 'zustand';
import api from '../lib/axios';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (artworkId) => {
    try {
      const response = await api.post('/wishlist/toggle', { artworkId });
      get().fetchWishlist();
      return response.data.wishlisted;
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
      throw error;
    }
  },

  isWishlisted: (artworkId) => {
    return get().items.some(item => item.artworkId === artworkId);
  }
}));
