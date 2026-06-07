import prisma from '../config/database';
import { ApiError } from '../types/ApiError';
import type {
  CreateBorrowingInput,
  BorrowingResponse,
  PaginatedBorrowingResponse,
} from '../types/borrowing';
import { toBorrowingResponse } from '../types/borrowing';

const BORROW_DAYS = 15; // 15 gün sonra teslim

export class BorrowingService {
  async create(data: CreateBorrowingInput): Promise<BorrowingResponse> {
    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: data.bookId },
    });

    if (!book) {
      throw ApiError.notFound('Kitap bulunamadı', 'BOOK_NOT_FOUND');
    }

    if (book.status !== 'AVAILABLE') {
      throw ApiError.badRequest('Bu kitap şu anda müsait değil', 'BOOK_NOT_AVAILABLE');
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw ApiError.notFound('Öğrenci bulunamadı', 'STUDENT_NOT_FOUND');
    }

    // Calculate dates
    const borrowDate = data.borrowDate ? new Date(data.borrowDate) : new Date();
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(borrowDate.getTime() + BORROW_DAYS * 24 * 60 * 60 * 1000);

    // Create borrowing record and update book status in a transaction
    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          studentId: data.studentId,
          bookId: data.bookId,
          borrowDate,
          dueDate,
          notes: data.notes || null,
          status: 'BORROWED',
        },
        include: {
          student: {
            include: {
              class: true,
            },
          },
          book: true,
        },
      }),
      prisma.book.update({
        where: { id: data.bookId },
        data: { status: 'BORROWED' },
      }),
    ]);

    return toBorrowingResponse(borrowing);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    studentId?: number;
    bookId?: number;
  }): Promise<PaginatedBorrowingResponse> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      status,
      studentId,
      bookId,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (bookId) {
      where.bookId = bookId;
    }

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (['borrowDate', 'dueDate', 'createdAt'].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy.createdAt = order;
    }

    // Get total count
    const total = await prisma.borrowing.count({ where });

    // Get data
    const data = await prisma.borrowing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        student: {
          include: {
            class: true,
          },
        },
        book: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toBorrowingResponse),
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

  async findById(id: number): Promise<BorrowingResponse> {
    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        book: true,
      },
    });

    if (!borrowing) {
      throw ApiError.notFound('Kayıt bulunamadı', 'BORROWING_NOT_FOUND');
    }

    return toBorrowingResponse(borrowing);
  }

  async returnBook(id: number, notes?: string): Promise<BorrowingResponse> {
    // Find borrowing
    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
    });

    if (!borrowing) {
      throw ApiError.notFound('Kayıt bulunamadı', 'BORROWING_NOT_FOUND');
    }

    if (borrowing.status !== 'BORROWED' && borrowing.status !== 'OVERDUE') {
      throw ApiError.badRequest('Bu kitap zaten iade edilmiş', 'BOOK_ALREADY_RETURNED');
    }

    // Update borrowing and book status in a transaction
    const [updated] = await prisma.$transaction([
      prisma.borrowing.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          notes: notes || borrowing.notes,
        },
        include: {
          student: {
            include: {
              class: true,
            },
          },
          book: true,
        },
      }),
      prisma.book.update({
        where: { id: borrowing.bookId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    return toBorrowingResponse(updated);
  }

  async getAvailableBooks(): Promise<{ id: number; title: string; location: string | null }[]> {
    const books = await prisma.book.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        title: true,
        location: true,
      },
      orderBy: { title: 'asc' },
    });

    return books;
  }

  async getStudents(): Promise<{ id: number; firstName: string; lastName: string; studentNumber: string; class?: { id: number; name: string } }[]> {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return students;
  }

  async getStats(): Promise<{
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
  }> {
    const [total, borrowed, returned, overdue] = await Promise.all([
      prisma.borrowing.count(),
      prisma.borrowing.count({ where: { status: 'BORROWED' } }),
      prisma.borrowing.count({ where: { status: 'RETURNED' } }),
      prisma.borrowing.count({ where: { status: 'OVERDUE' } }),
    ]);

    return { total, borrowed, returned, overdue };
  }
}

export const borrowingService = new BorrowingService();
