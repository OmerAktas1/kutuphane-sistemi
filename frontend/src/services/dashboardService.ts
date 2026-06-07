import api from './api';
import type { DashboardStats, RecentTransaction, MonthlyStats, ClassStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return response.data.data!;
  },

  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const response = await api.get<{ success: boolean; data: RecentTransaction[] }>(
      `/dashboard/recent-transactions?limit=${limit}`
    );
    return response.data.data!;
  },

  async getMonthlyStats(year?: number): Promise<MonthlyStats[]> {
    const params = year ? `?year=${year}` : '';
    const response = await api.get<{ success: boolean; data: MonthlyStats[] }>(`/dashboard/monthly-stats${params}`);
    return response.data.data!;
  },

  async getClassStats(): Promise<ClassStats[]> {
    const response = await api.get<{ success: boolean; data: ClassStats[] }>('/dashboard/class-stats');
    return response.data.data!;
  },
};
