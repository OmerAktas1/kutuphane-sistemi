import prisma from '../config/database';
import { ApiError } from '../types/ApiError';
import type {
  CreateClassInput,
  UpdateClassInput,
  ClassResponse,
  PaginatedClassResponse,
} from '../types/class';
import { toClassResponse } from '../types/class';

export class ClassService {
  async create(data: CreateClassInput): Promise<ClassResponse> {
    // Check if class already exists
    const existing = await prisma.class.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw ApiError.conflict('Bu sınıf adı zaten mevcut', 'CLASS_ALREADY_EXISTS');
    }

    const classItem = await prisma.class.create({
      data: {
        name: data.name.trim(),
      },
    });

    return toClassResponse(classItem);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }): Promise<PaginatedClassResponse> {
    const {
      page = 1,
      limit = 10,
      sort = 'name',
      order = 'asc',
      search,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sort === 'name' || sort === 'createdAt') {
      orderBy[sort] = order;
    } else {
      orderBy.name = order;
    }

    // Get total count
    const total = await prisma.class.count({ where });

    // Get data
    const data = await prisma.class.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toClassResponse),
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

  async findById(id: number): Promise<ClassResponse> {
    const classItem = await prisma.class.findUnique({
      where: { id },
    });

    if (!classItem) {
      throw ApiError.notFound('Sınıf bulunamadı', 'CLASS_NOT_FOUND');
    }

    return toClassResponse(classItem);
  }

  async update(id: number, data: UpdateClassInput): Promise<ClassResponse> {
    // Check if class exists
    const existing = await prisma.class.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Sınıf bulunamadı', 'CLASS_NOT_FOUND');
    }

    // Check if new name already exists (if name is being changed)
    if (data.name !== existing.name) {
      const nameExists = await prisma.class.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        throw ApiError.conflict('Bu sınıf adı zaten mevcut', 'CLASS_ALREADY_EXISTS');
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: data.name.trim(),
      },
    });

    return toClassResponse(updated);
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.class.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Sınıf bulunamadı', 'CLASS_NOT_FOUND');
    }

    await prisma.class.delete({
      where: { id },
    });
  }

  async getAll(): Promise<ClassResponse[]> {
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' },
    });

    return classes.map(toClassResponse);
  }
}

export const classService = new ClassService();
