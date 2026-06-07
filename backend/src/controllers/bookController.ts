import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/bookService';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../types/book';

export class BookController {
  /**
   * @swagger
   * /api/v1/books:
   *   get:
   *     summary: Tüm kitapları listele
   *     tags: [Books]
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
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [AVAILABLE, BORROWED]
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [title, location, status, createdAt]
   *           default: createdAt
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Kitap listesi
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = bookQuerySchema.parse(req.query);

      const result = await bookService.findAll({
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        search: params.search,
        status: params.status,
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
   * /api/v1/books:
   *   post:
   *     summary: Yeni kitap oluştur
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *                 example: "Savaş ve Barış"
   *               location:
   *                 type: string
   *                 example: "A-101"
   *     responses:
   *       201:
   *         description: Kitap oluşturuldu
   *       400:
   *         description: Geçersiz veri
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createBookSchema.parse(req.body);
      const book = await bookService.create(data);

      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/books/{id}:
   *   get:
   *     summary: Kitap detayı
   *     tags: [Books]
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
   *         description: Kitap detayı
   *       404:
   *         description: Kitap bulunamadı
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const book = await bookService.findById(id);

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/books/{id}:
   *   put:
   *     summary: Kitap güncelle
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - status
   *             properties:
   *               title:
   *                 type: string
   *               location:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [AVAILABLE, BORROWED]
   *     responses:
   *       200:
   *         description: Kitap güncellendi
   *       404:
   *         description: Kitap bulunamadı
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = updateBookSchema.parse(req.body);
      const book = await bookService.update(id, data);

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/books/{id}:
   *   delete:
   *     summary: Kitap sil
   *     tags: [Books]
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
   *         description: Kitap silindi
   *       404:
   *         description: Kitap bulunamadı
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await bookService.delete(id);

      res.json({
        success: true,
        message: 'Kitap başarıyla silindi',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
