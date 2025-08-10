import express from 'express';
import { verifyToken, supervisorOrAdminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { listActiveSessionsController, getSessionDetailController, forceSubmitSessionController } from './supervisor.controller.js';

const router = express.Router();

router.get('/sessions/active', verifyToken, supervisorOrAdminMiddleware, listActiveSessionsController);
router.get('/sessions/:id', verifyToken, supervisorOrAdminMiddleware, getSessionDetailController);
router.post('/sessions/:id/force-submit', verifyToken, supervisorOrAdminMiddleware, forceSubmitSessionController);

export default router;


