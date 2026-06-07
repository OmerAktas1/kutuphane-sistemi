import { create } from 'zustand';
import type { Class, ClassQueryParams } from '@/types';
import { classService } from '@/services/classService';
import toast from 'react-hot-toast';

interface ClassState {
  classes: Class[];
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
  queryParams: ClassQueryParams;

  // Actions
  fetchClasses: (params?: ClassQueryParams) => Promise<void>;
  createClass: (name: string) => Promise<Class | null>;
  updateClass: (id: number, name: string) => Promise<Class | null>;
  deleteClass: (id: number) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: 'name' | 'createdAt', order: 'asc' | 'desc') => void;
  clearError: () => void;
}

export const useClassStore = create<ClassState>()((set, get) => ({
  classes: [],
  pagination: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  queryParams: {
    page: 1,
    limit: 10,
    sort: 'name',
    order: 'asc',
  },

  fetchClasses: async (params?: ClassQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = params || get().queryParams;
      const result = await classService.getAll(queryParams);
      set({
        classes: result.data,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Sınıflar yüklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createClass: async (name: string) => {
    try {
      const newClass = await classService.create({ name });
      toast.success(`"${name}" sınıfı başarıyla oluşturuldu`);
      // Refresh list
      await get().fetchClasses();
      return newClass;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Sınıf oluşturulurken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  updateClass: async (id: number, name: string) => {
    try {
      const updatedClass = await classService.update(id, { name });
      toast.success(`"${name}" sınıfı başarıyla güncellendi`);
      // Refresh list
      await get().fetchClasses();
      return updatedClass;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Sınıf güncellenirken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  deleteClass: async (id: number) => {
    try {
      await classService.delete(id);
      toast.success('Sınıf başarıyla silindi');
      // Refresh list
      await get().fetchClasses();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Sınıf silinirken hata oluştu';
      toast.error(errorMessage);
      return false;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchClasses({ ...get().queryParams, page: 1, search: query || undefined });
  },

  setPage: (page: number) => {
    const newParams = { ...get().queryParams, page };
    set({ queryParams: newParams });
    get().fetchClasses(newParams);
  },

  setLimit: (limit: number) => {
    const newParams = { ...get().queryParams, page: 1, limit };
    set({ queryParams: newParams });
    get().fetchClasses(newParams);
  },

  setSort: (sort: 'name' | 'createdAt', order: 'asc' | 'desc') => {
    const newParams = { ...get().queryParams, sort, order };
    set({ queryParams: newParams });
    get().fetchClasses(newParams);
  },

  clearError: () => set({ error: null }),
}));