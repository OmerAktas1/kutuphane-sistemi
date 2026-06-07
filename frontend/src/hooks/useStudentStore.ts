import { create } from 'zustand';
import type { Student, StudentQueryParams } from '@/types';
import { studentService } from '@/services/studentService';
import toast from 'react-hot-toast';

interface StudentState {
  students: Student[];
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
  selectedClassId: number | null;
  queryParams: StudentQueryParams;

  // Actions
  fetchStudents: (params?: StudentQueryParams) => Promise<void>;
  createStudent: (data: { firstName: string; lastName: string; studentNumber: string; classId: number }) => Promise<Student | null>;
  updateStudent: (id: number, data: { firstName: string; lastName: string; studentNumber: string; classId: number }) => Promise<Student | null>;
  deleteStudent: (id: number) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setClassFilter: (classId: number | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: 'firstName' | 'lastName' | 'studentNumber' | 'createdAt', order: 'asc' | 'desc') => void;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  students: [],
  pagination: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedClassId: null,
  queryParams: {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  },

  fetchStudents: async (params?: StudentQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = params || get().queryParams;
      const result = await studentService.getAll(queryParams);
      set({
        students: result.data,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Öğrenciler yüklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createStudent: async (data) => {
    try {
      const newStudent = await studentService.create(data);
      toast.success(`${data.firstName} ${data.lastName} başarıyla eklendi`);
      // Refresh list
      await get().fetchStudents();
      return newStudent;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Öğrenci eklenirken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  updateStudent: async (id, data) => {
    try {
      const updatedStudent = await studentService.update(id, data);
      toast.success(`${data.firstName} ${data.lastName} başarıyla güncellendi`);
      // Refresh list
      await get().fetchStudents();
      return updatedStudent;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Öğrenci güncellenirken hata oluştu';
      toast.error(errorMessage);
      return null;
    }
  },

  deleteStudent: async (id) => {
    try {
      await studentService.delete(id);
      toast.success('Öğrenci başarıyla silindi');
      // Refresh list
      await get().fetchStudents();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Öğrenci silinirken hata oluştu';
      toast.error(errorMessage);
      return false;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchStudents({ ...get().queryParams, page: 1, search: query || undefined });
  },

  setClassFilter: (classId) => {
    set({ selectedClassId: classId });
    get().fetchStudents({ ...get().queryParams, page: 1, classId: classId || undefined });
  },

  setPage: (page) => {
    const newParams = { ...get().queryParams, page };
    set({ queryParams: newParams });
    get().fetchStudents(newParams);
  },

  setLimit: (limit) => {
    const newParams = { ...get().queryParams, page: 1, limit };
    set({ queryParams: newParams });
    get().fetchStudents(newParams);
  },

  setSort: (sort, order) => {
    const newParams = { ...get().queryParams, sort, order };
    set({ queryParams: newParams });
    get().fetchStudents(newParams);
  },

  clearError: () => set({ error: null }),
}));
