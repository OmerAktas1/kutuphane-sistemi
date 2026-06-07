import { Router } from 'express';
import { borrowingController } from '../controllers/borrowingController';

const router = Router();

router.get('/', borrowingController.getAll.bind(borrowingController));
router.get('/available-books', borrowingController.getAvailableBooks.bind(borrowingController));
router.get('/students', borrowingController.getStudents.bind(borrowingController));
router.get('/stats', borrowingController.getStats.bind(borrowingController));
router.get('/:id', borrowingController.getById.bind(borrowingController));
router.post('/', borrowingController.create.bind(borrowingController));
router.post('/:id/return', borrowingController.returnBook.bind(borrowingController));

export default router;
