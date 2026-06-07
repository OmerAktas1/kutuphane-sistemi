import prisma from '../config/database';
import { ApiError } from '../types/ApiError';
import type {
  CreateBookInput,
  UpdateBookInput,
  BookResponse,
  PaginatedBookResponse,
} from '../types/book';
import { toBookResponse } from '../types/book';

export class BookService {
  async create(data: CreateBookInput): Promise<BookResponse> {
    const book = await prisma.book.create({
      data: {
        title: data.title.trim(),
        location: data.location?.trim() || null,
      },
    });

    return toBookResponse(book);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: 'AVAILABLE' | 'BORROWED';
  }): Promise<PaginatedBookResponse> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      status,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (['title', 'location', 'status', 'createdAt'].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy.createdAt = order;
    }

    // Get total count
    const total = await prisma.book.count({ where });

    // Get data
    const data = await prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toBookResponse),
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

  async findById(id: number): Promise<BookResponse> {
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw ApiError.notFound('Kitap bulunamadı', 'BOOK_NOT_FOUND');
    }

    return toBookResponse(book);
  }

  async update(id: number, data: UpdateBookInput): Promise<BookResponse> {
    // Check if book exists
    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Kitap bulunamadı', 'BOOK_NOT_FOUND');
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: data.title.trim(),
        location: data.location?.trim() || null,
        status: data.status,
      },
    });

    return toBookResponse(updated);
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Kitap bulunamadı', 'BOOK_NOT_FOUND');
    }

    await prisma.book.delete({
      where: { id },
    });
  }

  async getAll(): Promise<BookResponse[]> {
    const books = await prisma.book.findMany({
      orderBy: { title: 'asc' },
    });

    return books.map(toBookResponse);
  }
}

export const bookService = new BookService();