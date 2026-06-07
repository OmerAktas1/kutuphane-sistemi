import prisma from '../config/database';
import { ApiError } from '../types/ApiError';
import type {
  CreateStudentInput,
  UpdateStudentInput,
  StudentResponse,
  PaginatedStudentResponse,
} from '../types/student';
import { toStudentResponse } from '../types/student';

export class StudentService {
  async create(data: CreateStudentInput): Promise<StudentResponse> {
    // Check if student number already exists
    const existing = await prisma.student.findUnique({
      where: { studentNumber: data.studentNumber },
    });

    if (existing) {
      throw ApiError.conflict('Bu okul numarası zaten mevcut', 'STUDENT_NUMBER_EXISTS');
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: data.classId },
    });

    if (!classExists) {
      throw ApiError.badRequest('Seçilen sınıf mevcut değil', 'CLASS_NOT_FOUND');
    }

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        studentNumber: data.studentNumber.trim(),
        classId: data.classId,
      },
      include: {
        class: true,
      },
    });

    return toStudentResponse(student);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    classId?: number;
  }): Promise<PaginatedStudentResponse> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      classId,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (classId) {
      where.classId = classId;
    }

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (['firstName', 'lastName', 'studentNumber', 'createdAt'].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy.createdAt = order;
    }

    // Get total count
    const total = await prisma.student.count({ where });

    // Get data
    const data = await prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        class: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toStudentResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: number): Promise<StudentResponse> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

    if (!student) {
      throw ApiError.notFound('Öğrenci bulunamadı', 'STUDENT_NOT_FOUND');
    }

    return toStudentResponse(student);
  }

  async update(id: number, data: UpdateStudentInput): Promise<StudentResponse> {
    // Check if student exists
    const existing = await prisma.student.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Öğrenci bulunamadı', 'STUDENT_NOT_FOUND');
    }

    // Check if new student number already exists (if student number is being changed)
    if (data.studentNumber !== existing.studentNumber) {
      const studentNumberExists = await prisma.student.findUnique({
        where: { studentNumber: data.studentNumber },
      });

      if (studentNumberExists) {
        throw ApiError.conflict('Bu okul numarası zaten mevcut', 'STUDENT_NUMBER_EXISTS');
      }
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: data.classId },
    });

    if (!classExists) {
      throw ApiError.badRequest('Seçilen sınıf mevcut değil', 'CLASS_NOT_FOUND');
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        studentNumber: data.studentNumber.trim(),
        classId: data.classId,
      },
      include: {
        class: true,
      },
    });

    return toStudentResponse(updated);
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.student.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Öğrenci bulunamadı', 'STUDENT_NOT_FOUND');
    }

    await prisma.student.delete({
      where: { id },
    });
  }

  async getAll(): Promise<StudentResponse[]> {
    const students = await prisma.student.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        class: true,
      },
    });

    return students.map(toStudentResponse);
  }
}

export const studentService = new StudentService();
