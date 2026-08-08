import api from '../../../shared/lib/axios';
import { SalesChallan, PaginatedResponse } from '../../../shared/types';

export const challanApi = {
  getAll: async (page = 1, limit = 10, search = '', status = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get<PaginatedResponse<SalesChallan>>(`/challans?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<SalesChallan>(`/challans/${id}`);
    return response.data;
  },
  
  create: async (data: { customerId: string; items: { productId: string; quantity: number }[] }) => {
    const response = await api.post<SalesChallan>('/challans', data);
    return response.data;
  },
  
  confirm: async (id: string) => {
    const response = await api.patch<SalesChallan>(`/challans/${id}/confirm`);
    return response.data;
  },
  
  cancel: async (id: string) => {
    const response = await api.patch<SalesChallan>(`/challans/${id}/cancel`);
    return response.data;
  }
};
