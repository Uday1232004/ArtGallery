import { create } from 'zustand';
import api from '../lib/axios';

export const useCartStore = create((set, get) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  items: [],
  total: 0,
  count: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({
        items: response.data.items,
        total: response.data.total,
        count: response.data.count,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch cart', error);
      set({ isLoading: false });
    }
  },

  addItem: async (artworkId, quantity = 1) => {
    try {
      await api.post('/cart', { artworkId, quantity });
      get().fetchCart(); // Refetch to get updated total/count
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw error;
    }
  },

  removeItem: async (artworkId) => {
    try {
      await api.delete(`/cart/${artworkId}`);
      get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
      throw error;
    }
  },

  updateQuantity: async (artworkId, quantity) => {
    try {
      await api.put(`/cart/${artworkId}`, { quantity });
      get().fetchCart();
    } catch (error) {
      console.error('Failed to update quantity', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Failed to clear cart', error);
      throw error;
    }
  },
}));
