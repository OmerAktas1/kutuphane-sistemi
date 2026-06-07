import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { ApiError } from '../types/ApiError';
import { loginSchema } from '../types/auth';
import type { AuthRequest } from '../middleware/auth';

export class AuthController {
  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Kullanıcı girişi
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: Kullanıcı adı veya e-posta
   *               password:
   *                 type: string
   *                 description: Şifre
   *     responses:
   *       200:
   *         description: Giriş başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *                     user:
   *                       type: object
   *       401:
   *         description: Geçersiz kimlik bilgileri
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { username, password } = validatedData;

      const result = await authService.login(username, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Token yenile
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token yenilendi
   *       401:
   *         description: Geçersiz refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ApiError.badRequest('Refresh token gerekli', 'REFRESH_TOKEN_REQUIRED');
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     summary: Mevcut kullanıcı bilgisi
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Kullanıcı bilgileri
   *       401:
   *         description: Yetkilendirme gerekli
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.userId) {
        throw ApiError.unauthorized('Yetkilendirme gerekli', 'AUTH_REQUIRED');
      }

      const user = await authService.getCurrentUser(authReq.userId);

      if (!user) {
        throw ApiError.notFound('Kullanici bulunamadi', 'USER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
