import { Router } from 'express';
import * as ctrl from '../controllers/settings.js';

const router = Router();

router.get('/',  ctrl.getAll);
router.put('/',  ctrl.updateAll);

export default router;
