import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import classRoutes from './class';
import studentRoutes from './student';
import bookRoutes from './book';
import borrowingRoutes from './borrowing';
import dashboardRoutes from './dashboard';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Class routes
router.use('/classes', classRoutes);

// Student routes
router.use('/students', studentRoutes);

// Book routes
router.use('/books', bookRoutes);

// Borrowing routes
router.use('/borrowings', borrowingRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API ana endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kütüphane Takip Sistemi API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Kütüphane Takip Sistemi API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

export default router;
