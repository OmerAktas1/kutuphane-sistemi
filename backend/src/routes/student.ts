import { Router } from 'express';
import { studentController } from '../controllers/studentController';

const router = Router();

router.get('/', studentController.getAll.bind(studentController));
router.get('/:id', studentController.getById.bind(studentController));
router.post('/', studentController.create.bind(studentController));
router.put('/:id', studentController.update.bind(studentController));
router.delete('/:id', studentController.delete.bind(studentController));

export default router;
