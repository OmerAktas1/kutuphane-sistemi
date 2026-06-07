import { z } from 'zod';
import type { Student, Class } from '@prisma/client';

export const createStudentSchema = z.object({
  firstName: z.string()
    .min(1, 'Ad gerekli')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/, 'Ad sadece harf içerebilir'),
  lastName: z.string()
    .min(1, 'Soyad gerekli')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/, 'Soyad sadece harf içerebilir'),
  studentNumber: z.string()
    .min(1, 'Okul numarası gerekli')
    .max(20, 'Okul numarası en fazla 20 karakter olabilir'),
  classId: z.number().int().positive('Sınıf seçimi gerekli'),
});

export const updateStudentSchema = z.object({
  firstName: z.string()
    .min(1, 'Ad gerekli')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/, 'Ad sadece harf içerebilir'),
  lastName: z.string()
    .min(1, 'Soyad gerekli')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/, 'Soyad sadece harf içerebilir'),
  studentNumber: z.string()
    .min(1, 'Okul numarası gerekli')
    .max(20, 'Okul numarası en fazla 20 karakter olabilir'),
  classId: z.number().int().positive('Sınıf seçimi gerekli'),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['firstName', 'lastName', 'studentNumber', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  classId: z.coerce.number().int().positive().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;

export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  classId: number;
  createdAt: Date;
  updatedAt: Date;
  class?: {
    id: number;
    name: string;
  };
}

export interface PaginatedStudentResponse {
  data: StudentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function toStudentResponse(student: Student & { class?: Class | null }): StudentResponse {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    studentNumber: student.studentNumber,
    classId: student.classId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    class: student.class ? {
      id: student.class.id,
      name: student.class.name,
    } : undefined,
  };
}
