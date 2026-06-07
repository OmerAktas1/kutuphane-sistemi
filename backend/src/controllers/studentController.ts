import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import { createStudentSchema, updateStudentSchema, studentQuerySchema } from '../types/student';

export class StudentController {
  /**
   * @swagger
   * /api/v1/students:
   *   get:
   *     summary: Tüm öğrencileri listele
   *     tags: [Students]
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
   *         name: classId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [firstName, lastName, studentNumber, createdAt]
   *           default: createdAt
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Öğrenci listesi
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = studentQuerySchema.parse(req.query);

      const result = await studentService.findAll({
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        search: params.search,
        classId: params.classId,
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
   * /api/v1/students:
   *   post:
   *     summary: Yeni öğrenci oluştur
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *               - studentNumber
   *               - classId
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: "Ahmet"
   *               lastName:
   *                 type: string
   *                 example: "Yılmaz"
   *               studentNumber:
   *                 type: string
   *                 example: "1234"
   *               classId:
   *                 type: integer
   *                 example: 1
   *     responses:
   *       201:
   *         description: Öğrenci oluşturuldu
   *       400:
   *         description: Geçersiz veri
   *       409:
   *         description: Öğrenci zaten mevcut
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createStudentSchema.parse(req.body);
      const student = await studentService.create(data);

      res.status(201).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/students/{id}:
   *   get:
   *     summary: Öğrenci detayı
   *     tags: [Students]
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
   *         description: Öğrenci detayı
   *       404:
   *         description: Öğrenci bulunamadı
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await studentService.findById(id);

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/students/{id}:
   *   put:
   *     summary: Öğrenci güncelle
   *     tags: [Students]
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
   *               - firstName
   *               - lastName
   *               - studentNumber
   *               - classId
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               studentNumber:
   *                 type: string
   *               classId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Öğrenci güncellendi
   *       404:
   *         description: Öğrenci bulunamadı
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = updateStudentSchema.parse(req.body);
      const student = await studentService.update(id, data);

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/students/{id}:
   *   delete:
   *     summary: Öğrenci sil
   *     tags: [Students]
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
   *         description: Öğrenci silindi
   *       404:
   *         description: Öğrenci bulunamadı
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await studentService.delete(id);

      res.json({
        success: true,
        message: 'Öğrenci başarıyla silindi',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
