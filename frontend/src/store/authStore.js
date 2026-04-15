import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        set({ user: { id: data._id, username: data.username }, token: data.token, isAuthenticated: true });
        return data;
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      register: async (username, password) => {
        const { data } = await api.post('/auth/register', { username, password });
        localStorage.setItem('token', data.token);
        set({ user: { id: data._id, username: data.username }, token: data.token, isAuthenticated: true });
        return data;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
