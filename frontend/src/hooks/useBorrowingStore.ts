import { create } from 'zustand';
import type { Borrowing, BorrowingQueryParams, BorrowStatus } from '@/types';
import { borrowingService } from '@/services/borrowingService';
import toast from 'react-hot-toast';

interface BorrowingState {
  borrowings: Borrowing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  stats: {
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  queryParams: BorrowingQueryParams;

  // Actions
  fetchBorrowings: (params?: BorrowingQueryParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  createBorrowing: (data: { studentId: number; bookId: number; borrowDate?: string; dueDate?: string; notes?: string }) => Promise<Borrowing | null>;
  returnBook: (id: number, notes?: string) => Promise<boolean>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setStatusFilter: (status: BorrowStatus | null) => void;
  clearError: () => void;
}

export const useBorrowingStore = create<BorrowingState>()((set, get) => ({
  borrowings: [],
  pagination: null,
  stats: null,
  isLoading: false,
  error: null,
  queryParams: {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  },

  fetchBorrowings: async (params?: BorrowingQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = params || get().queryParams;
      const result = await borrowingService.getAll(queryParams);
      set({
        borrowings: result.data,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Kayıtlar yüklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchStats: async () => {
    try {
      const stats = await borrowingService.getStats();
      set({ stats });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'İstatistikler yüklenirken hata oluştu';
      toast.error(errorMessage);
    }
  },

  createBorrowing: async (data) => {
    try {
      const newBorrowing = await borrowingService.create(data);
      toast.success('Kitap ödünç verildi');
      await get().fetchBorrowings();
      await get().fetchStats();
      return newBorrowing;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'İşlem başarısız oldu';
      toast.error(errorMessage);
      return null;
    }
  },

  returnBook: async (id, notes) => {
    try {
      await borrowingService.returnBook(id, notes);
      toast.success('Kitap iade edildi');
      await get().fetchBorrowings();
      await get().fetchStats();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'İade işlemi başarısız oldu';
      toast.error(errorMessage);
      return false;
    }
  },

  setPage: (page) => {
    const newParams = { ...get().queryParams, page };
    set({ queryParams: newParams });
    get().fetchBorrowings(newParams);
  },

  setLimit: (limit) => {
    const newParams = { ...get().queryParams, page: 1, limit };
    set({ queryParams: newParams });
    get().fetchBorrowings(newParams);
  },

  setStatusFilter: (status) => {
    const newParams = { ...get().queryParams, page: 1, status: status || undefined };
    set({ queryParams: newParams });
    get().fetchBorrowings(newParams);
  },

  clearError: () => set({ error: null }),
}));
