import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { attendanceSchema, bulkAttendanceSchema } from '../schemas/index.js';
import * as ctrl from '../controllers/attendance.js';

const router = Router();

router.get('/',        ctrl.list);
router.get('/summary', ctrl.summary);
router.post('/',       validate(attendanceSchema), ctrl.create);
router.post('/bulk',   validate(bulkAttendanceSchema), ctrl.bulkUpsert);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
