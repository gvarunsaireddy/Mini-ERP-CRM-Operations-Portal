import api from '../../../shared/lib/axios';
import { Customer, CustomerFollowUp, PaginatedResponse } from '../../../shared/types';

export const customerApi = {
  getAll: async (page = 1, limit = 10, search = '', type = '', status = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await api.get<PaginatedResponse<Customer>>(`/customers?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Customer>) => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Customer>) => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },
  
  getFollowUps: async (customerId: string) => {
    const response = await api.get<CustomerFollowUp[]>(`/customers/${customerId}/follow-ups`);
    return response.data;
  },
  
  addFollowUp: async (customerId: string, data: Partial<CustomerFollowUp>) => {
    const response = await api.post<CustomerFollowUp>(`/customers/${customerId}/follow-ups`, data);
    return response.data;
  }
};
