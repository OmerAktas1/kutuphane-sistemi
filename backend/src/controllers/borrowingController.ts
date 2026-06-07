import { Request, Response, NextFunction } from 'express';
import { borrowingService } from '../services/borrowingService';
import { createBorrowingSchema, returnBorrowingSchema, borrowingQuerySchema } from '../types/borrowing';

export class BorrowingController {
  /**
   * @swagger
   * /api/v1/borrowings:
   *   get:
   *     summary: Tüm ödünç kayıtlarını listele
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [BORROWED, RETURNED, OVERDUE, LOST]
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: bookId
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Ödünç kayıtları listesi
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = borrowingQuerySchema.parse(req.query);

      const result = await borrowingService.findAll({
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        status: params.status,
        studentId: params.studentId,
        bookId: params.bookId,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings:
   *   post:
   *     summary: Yeni ödünç kaydı oluştur
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - studentId
   *               - bookId
   *             properties:
   *               studentId:
   *                 type: integer
   *                 example: 1
   *               bookId:
   *                 type: integer
   *                 example: 1
   *               borrowDate:
   *                 type: string
   *                 format: date
   *               dueDate:
   *                 type: string
   *                 format: date
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Ödünç kaydı oluşturuldu
   *       400:
   *         description: Geçersiz veri veya kitap müsait değil
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createBorrowingSchema.parse(req.body);
      const borrowing = await borrowingService.create(data);

      res.status(201).json({
        success: true,
        data: borrowing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings/{id}:
   *   get:
   *     summary: Ödünç kaydı detayı
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Ödünç kaydı detayı
   *       404:
   *         description: Kayıt bulunamadı
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const borrowing = await borrowingService.findById(id);

      res.json({
        success: true,
        data: borrowing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings/{id}/return:
   *   post:
   *     summary: Kitabı iade et
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Kitap iade edildi
   *       400:
   *         description: Kitap zaten iade edilmiş
   *       404:
   *         description: Kayıt bulunamadı
   */
  async returnBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { notes } = returnBorrowingSchema.parse(req.body);
      const borrowing = await borrowingService.returnBook(id, notes);

      res.json({
        success: true,
        data: borrowing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings/available-books:
   *   get:
   *     summary: Müsait kitapları listele
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Müsait kitaplar listesi
   */
  async getAvailableBooks(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const books = await borrowingService.getAvailableBooks();

      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings/students:
   *   get:
   *     summary: Tüm öğrencileri listele
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Öğrenciler listesi
   */
  async getStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await borrowingService.getStudents();

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/borrowings/stats:
   *   get:
   *     summary: Ödünç istatistikleri
   *     tags: [Borrowings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: İstatistikler
   */
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await borrowingService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const borrowingController = new BorrowingController();
