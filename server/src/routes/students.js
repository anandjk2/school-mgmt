import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { studentSchema } from '../schemas/index.js';
import * as ctrl from '../controllers/students.js';

const router = Router();

router.get('/',           ctrl.list);
router.post('/',          validate(studentSchema), ctrl.create);
router.get('/:id',        ctrl.getOne);
router.put('/:id',        validate(studentSchema), ctrl.update);
router.delete('/:id',     ctrl.remove);
router.get('/:id/classes',    ctrl.getClasses);
router.get('/:id/attendance', ctrl.getAttendance);
router.get('/:id/fees',       ctrl.getFees);

export default router;
