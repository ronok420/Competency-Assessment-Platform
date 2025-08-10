import express from 'express';
import { verifyToken ,userMiddleware } from '../../core/middlewares/authMiddleware.js';
import { sebGuard } from '../../core/middlewares/sebMiddleware.js';
import RoleType from '../../lib/types.js';
import {
  startAssessmentController,
  activeSessionController,
  submitStepController,
  nextStepController,
} from './assessments.controller.js';

const router = express.Router();

// Local student guard to ensure req.user.role === USER
// const studentOnly = (req, res, next) => {
//   if (req.user && req.user.role === RoleType.STUDENT) return next();
//   return res.status(403).json({ status: false, message: 'Forbidden: Students only' });
// };

router.post('/start', verifyToken, userMiddleware, sebGuard, startAssessmentController);
router.get('/active-session', verifyToken, userMiddleware, sebGuard, activeSessionController);
router.post('/:sessionId/submit', verifyToken, userMiddleware, sebGuard, submitStepController);
router.post('/:sessionId/next', verifyToken, userMiddleware, sebGuard, nextStepController);

export default router;


