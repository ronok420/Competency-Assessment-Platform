import express from 'express';
import { verifyToken, adminMiddleware } from '../../../core/middlewares/authMiddleware.js';
import { overviewController, usersTimeseriesController, questionStatsController, listSessionsController } from './dashboard.controller.js';

const router = express.Router();

router.get('/overview', verifyToken, adminMiddleware, overviewController);
router.get('/users/timeseries', verifyToken, adminMiddleware, usersTimeseriesController);
router.get('/questions/stats', verifyToken, adminMiddleware, questionStatsController);
router.get('/sessions', verifyToken, adminMiddleware, listSessionsController);

export default router;


