import api from '../../../shared/lib/axios';
import { LoginResponse, User } from '../../../shared/types';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};
