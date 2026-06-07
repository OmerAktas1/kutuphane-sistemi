import { z } from 'zod';
import type { Class } from '@prisma/client';

export const createClassSchema = z.object({
  name: z.string()
    .min(1, 'Sınıf adı gerekli')
    .max(20, 'Sınıf adı en fazla 20 karakter olabilir')
    .regex(/^[a-zA-Z0-9ÇçĞğİıÖöŞşÜü\s]+$/, 'Sınıf adı sadece harf, rakam ve boşluk içerebilir'),
});

export const updateClassSchema = z.object({
  name: z.string()
    .min(1, 'Sınıf adı gerekli')
    .max(20, 'Sınıf adı en fazla 20 karakter olabilir')
    .regex(/^[a-zA-Z0-9ÇçĞğİıÖöŞşÜü\s]+$/, 'Sınıf adı sadece harf, rakam ve boşluk içerebilir'),
});

export const classQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['name', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ClassQueryInput = z.infer<typeof classQuerySchema>;

export interface ClassResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedClassResponse {
  data: ClassResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function toClassResponse(classItem: Class): ClassResponse {
  return {
    id: classItem.id,
    name: classItem.name,
    createdAt: classItem.createdAt,
    updatedAt: classItem.updatedAt,
  };
}
