// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query params
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: unknown;
}

// Book types
export type BookStatus = 'AVAILABLE' | 'BORROWED';

export interface Book {
  id: number;
  title: string;
  location: string | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  location?: string;
}

export interface UpdateBookRequest {
  title: string;
  location?: string | null;
  status: BookStatus;
}

export interface BookQueryParams {
  page?: number;
  limit?: number;
  sort?: 'title' | 'location' | 'status' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
  status?: BookStatus;
}

// Borrowing types
export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';

export interface Borrowing {
  id: number;
  studentId: number;
  bookId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    studentNumber: string;
    class?: {
      id: number;
      name: string;
    };
  };
  book?: {
    id: number;
    title: string;
    location: string | null;
    status: string;
  };
}

export interface CreateBorrowingRequest {
  studentId: number;
  bookId: number;
  borrowDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface BorrowingQueryParams {
  page?: number;
  limit?: number;
  sort?: 'borrowDate' | 'dueDate' | 'createdAt';
  order?: 'asc' | 'desc';
  status?: BorrowStatus;
  studentId?: number;
  bookId?: number;
}

// Auth types
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

// Class types
export interface Class {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  name: string;
}

export interface UpdateClassRequest {
  name: string;
}

export interface ClassQueryParams {
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
}

// Student types
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
  };
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  studentNumber: string;
  classId: number;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  studentNumber: string;
  classId: number;
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  sort?: 'firstName' | 'lastName' | 'studentNumber' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
  classId?: number;
}

// Dashboard types
export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalBooks: number;
  borrowedBooks: number;
  availableBooks: number;
  overdueBooks: number;
  totalBorrowings: number;
  returnedBooks: number;
}

export interface RecentTransaction {
  id: number;
  type: 'BORROW' | 'RETURN';
  studentName: string;
  studentNumber: string;
  bookTitle: string;
  date: string;
  status: string;
}

export interface MonthlyStats {
  month: string;
  borrowed: number;
  returned: number;
}

export interface ClassStats {
  className: string;
  studentCount: number;
  borrowCount: number;
}

// ============================================================================
// Kitap Alma (Ödünç Verme) Sistemi için Tür Tanımlamaları
// ============================================================================

/**
 * Öğrenci seçim listesi için basitleştirilmiş öğrenci tipi
 */
export interface StudentOption {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  class?: {
    id: number;
    name: string;
  };
}

/**
 * Kitap seçim listesi için basitleştirilmiş kitap tipi
 */
export interface BookOption {
  id: number;
  title: string;
  location: string | null;
}

/**
 * Ödünç alma işlemi için kullanılan form verisi
 */
export interface BorrowFormData {
  studentId: number;
  bookId: number;
  borrowDate: Date;
  dueDate: Date;
  notes?: string;
}

/**
 * Ödünç verme sonucu döndürülen işlem kaydı
 * Backend'den dönen Borrowing tipi ile uyumlu
 */
export interface BorrowTransaction extends Omit<Borrowing, 'borrowDate' | 'dueDate' | 'returnDate'> {
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
}

/**
 * Ödünç verme formu validasyon hataları
 */
export interface BorrowFormErrors {
  studentId?: string;
  bookId?: string;
  borrowDate?: string;
  dueDate?: string;
  notes?: string;
}

/**
 * Tarih bilgisi için yardımcı tip
 */
export interface DateInfo {
  date: Date;
  formatted: string; // ISO format: YYYY-MM-DD
  display: string;   // Türkçe görüntü formatı: DD.MM.YYYY
}
