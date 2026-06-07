import api from './api';
import type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentQueryParams,
  PaginatedResponse,
} from '@/types';

export interface StudentListResponse extends PaginatedResponse<Student> {}

export const studentService = {
  async getAll(params?: StudentQueryParams): Promise<StudentListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.classId) searchParams.set('classId', params.classId.toString());

    const response = await api.get<StudentListResponse>(`/students?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return response.data.data!;
  },

  async create(data: CreateStudentRequest): Promise<Student> {
    const response = await api.post<{ success: boolean; data: Student }>('/students', data);
    return response.data.data!;
  },

  async update(id: number, data: UpdateStudentRequest): Promise<Student> {
    const response = await api.put<{ success: boolean; data: Student }>(`/students/${id}`, data);
    return response.data.data!;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};
