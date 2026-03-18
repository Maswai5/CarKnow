import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export type LoginPayload = { emailOrUsername: string; password: string };

export function setToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('carknow_token', token);
    } else {
      localStorage.removeItem('carknow_token');
    }
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('carknow_token');
}

export function decodeTokenRole(token: string | null): { role?: string; email?: string } {
  try {
    if (!token) return {};
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { role: decoded.role, email: decoded.email };
  } catch (err) {
    return {};
  }
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await api.post('/auth/login', data);
      const token = res.data.token;
      if (!token) throw new Error('No token returned');
      setToken(token);
      return res.data;
    },
    retry: 1
  });
}

export function useLogout() {
  return () => {
    setToken(null);
    // optional: invalidate queries or redirect
  };
}
