import { Router } from 'express';
import { classController } from '../controllers/classController';

const router = Router();

router.get('/', classController.getAll.bind(classController));

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
 */
router.get('/:id', classController.getById.bind(classController));

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
 *     responses:
 *       201:
 *         description: Sınıf oluşturuldu
 */
router.post('/', classController.create.bind(classController));

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
 *     responses:
 *       200:
 *         description: Sınıf güncellendi
 */
router.put('/:id', classController.update.bind(classController));

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
 */
router.delete('/:id', classController.delete.bind(classController));

export default router;