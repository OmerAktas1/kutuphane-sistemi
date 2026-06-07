import { z } from 'zod';

export const createBorrowingSchema = z.object({
  studentId: z.number().int().positive('Ogrenci secimi gerekli'),
  bookId: z.number().int().positive('Kitap secimi gerekli'),
  borrowDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const returnBorrowingSchema = z.object({
  notes: z.string().optional(),
});

export const borrowingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['borrowDate', 'dueDate', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum(['BORROWED', 'RETURNED', 'OVERDUE', 'LOST']).optional(),
  studentId: z.coerce.number().int().positive().optional(),
  bookId: z.coerce.number().int().positive().optional(),
});

export type CreateBorrowingInput = z.infer<typeof createBorrowingSchema>;
export type ReturnBorrowingInput = z.infer<typeof returnBorrowingSchema>;
export type BorrowingQueryInput = z.infer<typeof borrowingQuerySchema>;

export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';

export interface BorrowingResponse {
  id: number;
  studentId: number;
  bookId: number;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: BorrowStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface PaginatedBorrowingResponse {
  data: BorrowingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Borrowing {
  id: number;
  studentId: number;
  bookId: number;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    studentNumber: string;
    class?: { id: number; name: string } | null;
  };
  book?: {
    id: number;
    title: string;
    location: string | null;
    status: string;
  };
}

export function toBorrowingResponse(borrowing: Borrowing): BorrowingResponse {
  return {
    id: borrowing.id,
    studentId: borrowing.studentId,
    bookId: borrowing.bookId,
    borrowDate: borrowing.borrowDate,
    dueDate: borrowing.dueDate,
    returnDate: borrowing.returnDate,
    status: borrowing.status as BorrowStatus,
    notes: borrowing.notes,
    createdAt: borrowing.createdAt,
    updatedAt: borrowing.updatedAt,
    student: borrowing.student ? {
      id: borrowing.student.id,
      firstName: borrowing.student.firstName,
      lastName: borrowing.student.lastName,
      studentNumber: borrowing.student.studentNumber,
      class: borrowing.student.class ? {
        id: borrowing.student.class.id,
        name: borrowing.student.class.name,
      } : undefined,
    } : undefined,
    book: borrowing.book ? {
      id: borrowing.book.id,
      title: borrowing.book.title,
      location: borrowing.book.location,
      status: borrowing.book.status,
    } : undefined,
  };
}
