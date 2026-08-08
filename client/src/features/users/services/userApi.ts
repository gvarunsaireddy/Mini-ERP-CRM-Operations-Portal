import api from '../../../shared/lib/axios';
import { User, PaginatedResponse } from '../../../shared/types';

export const userApi = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    
    const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
    return response.data;
  },
  
  create: async (data: Partial<User> & { password?: string }) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  }
};
