import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { assignmentSchema, bulkAssignmentSchema } from '../schemas/index.js';
import * as ctrl from '../controllers/assignments.js';

const router = Router();

router.post('/',              validate(assignmentSchema), ctrl.assign);
router.post('/bulk',          validate(bulkAssignmentSchema), ctrl.bulkAssign);
router.put('/:id/disenroll',  ctrl.disenroll);
router.put('/:id/reenroll',   ctrl.reenroll);
router.delete('/:id',         ctrl.removeById);

export default router;
