import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/recent-transactions', dashboardController.getRecentTransactions.bind(dashboardController));
router.get('/monthly-stats', dashboardController.getMonthlyStats.bind(dashboardController));
router.get('/class-stats', dashboardController.getClassStats.bind(dashboardController));

export default router;
