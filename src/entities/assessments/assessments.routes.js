import express from 'express';
import { verifyToken ,userMiddleware } from '../../core/middlewares/authMiddleware.js';
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

router.post('/start', verifyToken, userMiddleware, startAssessmentController);
router.get('/active-session', verifyToken, userMiddleware, activeSessionController);
router.post('/:sessionId/submit', verifyToken, userMiddleware, submitStepController);
router.post('/:sessionId/next', verifyToken, userMiddleware, nextStepController);

export default router;


