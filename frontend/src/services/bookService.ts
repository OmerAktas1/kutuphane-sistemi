import api from './api';
import type {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  BookQueryParams,
  PaginatedResponse,
} from '@/types';

export interface BookListResponse extends PaginatedResponse<Book> {}

export const bookService = {
  async getAll(params?: BookQueryParams): Promise<BookListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);

    const response = await api.get<BookListResponse>(`/books?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Book> {
    const response = await api.get<{ success: boolean; data: Book }>(`/books/${id}`);
    return response.data.data!;
  },

  async create(data: CreateBookRequest): Promise<Book> {
    const response = await api.post<{ success: boolean; data: Book }>('/books', data);
    return response.data.data!;
  },

  async update(id: number, data: UpdateBookRequest): Promise<Book> {
    const response = await api.put<{ success: boolean; data: Book }>(`/books/${id}`, data);
    return response.data.data!;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/books/${id}`);
  },
};
