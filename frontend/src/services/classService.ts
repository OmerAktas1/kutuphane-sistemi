import api from './api';
import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  ClassQueryParams,
  PaginatedResponse,
} from '@/types';

export interface ClassListResponse extends PaginatedResponse<Class> {}

export const classService = {
  async getAll(params?: ClassQueryParams): Promise<ClassListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);

    const response = await api.get<ClassListResponse>(`/classes?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Class> {
    const response = await api.get<{ success: boolean; data: Class }>(`/classes/${id}`);
    return response.data.data!;
  },

  async create(data: CreateClassRequest): Promise<Class> {
    const response = await api.post<{ success: boolean; data: Class }>('/classes', data);
    return response.data.data!;
  },

  async update(id: number, data: UpdateClassRequest): Promise<Class> {
    const response = await api.put<{ success: boolean; data: Class }>(`/classes/${id}`, data);
    return response.data.data!;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/classes/${id}`);
  },
};
