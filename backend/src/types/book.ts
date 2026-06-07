import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string()
    .min(1, 'Kitap adi gerekli')
    .max(200, 'Kitap adi en fazla 200 karakter olabilir'),
  location: z.string()
    .max(50, 'Raf numarasi en fazla 50 karakter olabilir')
    .optional(),
});

export const updateBookSchema = z.object({
  title: z.string()
    .min(1, 'Kitap adi gerekli')
    .max(200, 'Kitap adi en fazla 200 karakter olabilir'),
  location: z.string()
    .max(50, 'Raf numarasi en fazla 50 karakter olabilir')
    .optional()
    .nullable(),
  status: z.enum(['AVAILABLE', 'BORROWED']),
});

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['title', 'location', 'status', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum(['AVAILABLE', 'BORROWED']).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;

export type BookStatus = 'AVAILABLE' | 'BORROWED';

export interface BookResponse {
  id: number;
  title: string;
  location: string | null;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedBookResponse {
  data: BookResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Book {
  id: number;
  title: string;
  location: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toBookResponse(book: Book): BookResponse {
  return {
    id: book.id,
    title: book.title,
    location: book.location,
    status: book.status as BookStatus,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}
