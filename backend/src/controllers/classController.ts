import { Request, Response, NextFunction } from 'express';
import { classService } from '../services/classService';
import { createClassSchema, updateClassSchema, classQuerySchema } from '../types/class';

export class ClassController {
  /**
   * @swagger
   * /api/v1/classes:
   *   get:
   *     summary: Tüm sınıfları listele
   *     tags: [Classes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Sayfa numarası
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Sayfa başına kayıt sayısı
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Arama terimi
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [name, createdAt]
   *           default: name
   *         description: Sıralama alanı
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Sıralama yönü
   *     responses:
   *       200:
   *         description: Sınıf listesi
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = classQuerySchema.parse(req.query);

      const result = await classService.findAll({
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        search: params.search,
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
   * /api/v1/classes:
   *   post:
   *     summary: Yeni sınıf oluştur
   *     tags: [Classes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: "9A"
   *     responses:
   *       201:
   *         description: Sınıf oluşturuldu
   *       400:
   *         description: Geçersiz veri
   *       409:
   *         description: Sınıf zaten mevcut
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createClassSchema.parse(req.body);
      const classItem = await classService.create(data);

      res.status(201).json({
        success: true,
        data: classItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/classes/{id}:
   *   get:
   *     summary: Sınıf detayı
   *     tags: [Classes]
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
   *         description: Sınıf detayı
   *       404:
   *         description: Sınıf bulunamadı
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const classItem = await classService.findById(id);

      res.json({
        success: true,
        data: classItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/classes/{id}:
   *   put:
   *     summary: Sınıf güncelle
   *     tags: [Classes]
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
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: "9B"
   *     responses:
   *       200:
   *         description: Sınıf güncellendi
   *       404:
   *         description: Sınıf bulunamadı
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = updateClassSchema.parse(req.body);
      const classItem = await classService.update(id, data);

      res.json({
        success: true,
        data: classItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/classes/{id}:
   *   delete:
   *     summary: Sınıf sil
   *     tags: [Classes]
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
   *         description: Sınıf silindi
   *       404:
   *         description: Sınıf bulunamadı
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await classService.delete(id);

      res.json({
        success: true,
        message: 'Sınıf başarıyla silindi',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const classController = new ClassController();
