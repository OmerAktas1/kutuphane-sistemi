import { Router } from 'express';
import { bookController } from '../controllers/bookController';

const router = Router();

router.get('/', bookController.getAll.bind(bookController));
router.get('/:id', bookController.getById.bind(bookController));
router.post('/', bookController.create.bind(bookController));
router.put('/:id', bookController.update.bind(bookController));
router.delete('/:id', bookController.delete.bind(bookController));

export default router;
