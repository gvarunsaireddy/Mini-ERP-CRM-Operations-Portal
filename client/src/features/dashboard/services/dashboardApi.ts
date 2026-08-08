import api from '../../../shared/lib/axios';
import { DashboardStats } from '../../../shared/types';

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
};
