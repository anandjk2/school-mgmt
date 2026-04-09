import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { feeSchema, feeUpdateSchema } from '../schemas/index.js';
import * as ctrl from '../controllers/fees.js';

const router = Router();

router.get('/',        ctrl.list);
router.get('/summary', ctrl.summary);
router.post('/',       validate(feeSchema), ctrl.create);
router.put('/:id',     validate(feeUpdateSchema), ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
