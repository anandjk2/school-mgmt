import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { classSchema } from '../schemas/index.js';
import * as ctrl from '../controllers/classes.js';

const router = Router();

router.get('/',              ctrl.list);
router.post('/',             validate(classSchema), ctrl.create);
router.get('/:id',           ctrl.getOne);
router.put('/:id',           validate(classSchema), ctrl.update);
router.delete('/:id',        ctrl.remove);
router.get('/:id/students',  ctrl.getStudents);
router.get('/:id/attendance',ctrl.getAttendance);

export default router;
