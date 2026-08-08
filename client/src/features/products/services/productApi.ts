import api from '../../../shared/lib/axios';
import { Product, StockMovement, PaginatedResponse } from '../../../shared/types';

export const productApi = {
  getAll: async (page = 1, limit = 10, search = '', category = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Product>) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Product>) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },
  
  getStockMovements: async (productId: string, page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<StockMovement>>(`/products/${productId}/stock-movements?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  addStockMovement: async (productId: string, data: { quantity: number; movementType: string; reason: string }) => {
    const response = await api.post<StockMovement>(`/products/${productId}/stock-movements`, {
      quantity: Number(data.quantity),
      movementType: data.movementType,
      reason: data.reason
    });
    return response.data;
  }
};
