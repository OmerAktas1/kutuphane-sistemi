import api from './api';
import type {
  Borrowing,
  CreateBorrowingRequest,
  BorrowingQueryParams,
  PaginatedResponse,
} from '@/types';

export interface BorrowingListResponse extends PaginatedResponse<Borrowing> {}

export const borrowingService = {
  async getAll(params?: BorrowingQueryParams): Promise<BorrowingListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.studentId) searchParams.set('studentId', params.studentId.toString());
    if (params?.bookId) searchParams.set('bookId', params.bookId.toString());

    const response = await api.get<BorrowingListResponse>(`/borrowings?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Borrowing> {
    const response = await api.get<{ success: boolean; data: Borrowing }>(`/borrowings/${id}`);
    return response.data.data!;
  },

  async create(data: CreateBorrowingRequest): Promise<Borrowing> {
    const response = await api.post<{ success: boolean; data: Borrowing }>('/borrowings', data);
    return response.data.data!;
  },

  async returnBook(id: number, notes?: string): Promise<Borrowing> {
    const response = await api.post<{ success: boolean; data: Borrowing }>(`/borrowings/${id}/return`, { notes });
    return response.data.data!;
  },

  async getAvailableBooks(): Promise<{ id: number; title: string; location: string | null }[]> {
    const response = await api.get<{ success: boolean; data: { id: number; title: string; location: string | null }[] }>('/borrowings/available-books');
    return response.data.data!;
  },

  async getStudents(): Promise<{ id: number; firstName: string; lastName: string; studentNumber: string; class?: { id: number; name: string } }[]> {
    const response = await api.get<{ success: boolean; data: { id: number; firstName: string; lastName: string; studentNumber: string; class?: { id: number; name: string } }[] }>('/borrowings/students');
    return response.data.data!;
  },

  async getStats(): Promise<{ total: number; borrowed: number; returned: number; overdue: number }> {
    const response = await api.get<{ success: boolean; data: { total: number; borrowed: number; returned: number; overdue: number } }>('/borrowings/stats');
    return response.data.data!;
  },
};
