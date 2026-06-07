import { create } from 'zustand';
import type { Book, BookQueryParams, BookStatus } from '@/types';
import { bookService } from '@/services/bookService';
import toast from 'react-hot-toast';

interface BookState {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedStatus: BookStatus | null;
  queryParams: BookQueryParams;

  // Actions
  fetchBooks: (params?: BookQueryParams) => Promise<void>;
  createBook: (data: { title: string; location?: string }) => Promise<Book | null>;
  updateBook: (id: number, data: { title: string; location?: string | null; status: BookStatus }) => Promise<Book | null>;
  deleteBook: (id: number) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: BookStatus | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: 'title' | 'location' | 'status' | 'createdAt', order: 'asc' | 'desc') => void;
  clearError: () => void;
}

export const useBookStore = create<BookState>()((set, get) => ({
  books: [],
  pagination: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedStatus: null,
  queryParams: {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  },

  fetchBooks: async (params?: BookQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = params || get().queryParams;
      const result = await bookService.getAll(queryParams);
      set({
        books: result.data,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Kitaplar yüklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createBook: async (data) => {
    try {
      const newBook = await bookService.create(data);
      toast.success(`"${data.title}" başarıyla eklendi`);
      await get().fetchBooks();
      return newBook;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Kitap eklenirken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  updateBook: async (id, data) => {
    try {
      const updatedBook = await bookService.update(id, data);
      toast.success(`"${data.title}" başarıyla güncellendi`);
      await get().fetchBooks();
      return updatedBook;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Kitap güncellenirken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  deleteBook: async (id) => {
    try {
      await bookService.delete(id);
      toast.success('Kitap başarıyla silindi');
      await get().fetchBooks();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Kitap silinirken hata oluştu';
      toast.error(errorMessage);
      return false;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchBooks({ ...get().queryParams, page: 1, search: query || undefined });
  },

  setStatusFilter: (status) => {
    set({ selectedStatus: status });
    get().fetchBooks({ ...get().queryParams, page: 1, status: status || undefined });
  },

  setPage: (page) => {
    const newParams = { ...get().queryParams, page };
    set({ queryParams: newParams });
    get().fetchBooks(newParams);
  },

  setLimit: (limit) => {
    const newParams = { ...get().queryParams, page: 1, limit };
    set({ queryParams: newParams });
    get().fetchBooks(newParams);
  },

  setSort: (sort, order) => {
    const newParams = { ...get().queryParams, sort, order };
    set({ queryParams: newParams });
    get().fetchBooks(newParams);
  },

  clearError: () => set({ error: null }),
}));
