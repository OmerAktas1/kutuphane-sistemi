import prisma from '../config/database';

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
  date: Date;
  status: string;
}

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const [
      totalStudents,
      totalClasses,
      totalBooks,
      borrowedBooks,
      availableBooks,
      totalBorrowings,
      returnedBooks,
      overdueBooks,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.book.count(),
      prisma.book.count({ where: { status: 'BORROWED' } }),
      prisma.book.count({ where: { status: 'AVAILABLE' } }),
      prisma.borrowing.count(),
      prisma.borrowing.count({ where: { status: 'RETURNED' } }),
      prisma.borrowing.count({ where: { status: 'OVERDUE' } }),
    ]);

    return {
      totalStudents,
      totalClasses,
      totalBooks,
      borrowedBooks,
      availableBooks,
      overdueBooks,
      totalBorrowings,
      returnedBooks,
    };
  }

  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const recentBorrowings = await prisma.borrowing.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentNumber: true,
          },
        },
        book: {
          select: {
            title: true,
          },
        },
      },
    });

    return recentBorrowings.map((b) => ({
      id: b.id,
      type: b.status === 'RETURNED' ? 'RETURN' : 'BORROW',
      studentName: `${b.student.firstName} ${b.student.lastName}`,
      studentNumber: b.student.studentNumber,
      bookTitle: b.book.title,
      date: b.status === 'RETURNED' && b.returnDate ? b.returnDate : b.borrowDate,
      status: b.status,
    }));
  }

  async getMonthlyStats(year: number): Promise<{ month: string; borrowed: number; returned: number }[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const borrowings = await prisma.borrowing.findMany({
      where: {
        borrowDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        borrowDate: true,
        returnDate: true,
        status: true,
      },
    });

    const monthlyData: Record<string, { borrowed: number; returned: number }> = {};

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(year, i).toLocaleString('tr-TR', { month: 'short' });
      monthlyData[monthName] = { borrowed: 0, returned: 0 };
    }

    // Count borrowings per month
    borrowings.forEach((b) => {
      const monthName = new Date(b.borrowDate).toLocaleString('tr-TR', { month: 'short' });
      if (monthlyData[monthName]) {
        monthlyData[monthName].borrowed++;
      }
      if (b.returnDate && b.status === 'RETURNED') {
        const returnMonthName = new Date(b.returnDate).toLocaleString('tr-TR', { month: 'short' });
        if (monthlyData[returnMonthName]) {
          monthlyData[returnMonthName].returned++;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  async getClassStats(): Promise<{ className: string; studentCount: number; borrowCount: number }[]> {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            borrowings: true,
          },
        },
      },
    });

    return classes.map((c) => ({
      className: c.name,
      studentCount: c.students.length,
      borrowCount: c.students.reduce((acc, s) => acc + s.borrowings.length, 0),
    }));
  }
}

export const dashboardService = new DashboardService();
