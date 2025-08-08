import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import {
  createCompetencyController,
  listCompetenciesController,
  getCompetencyByIdController,
  updateCompetencyController,
  deleteCompetencyController,
} from './competency.controller.js';

const router = express.Router();

router.post('/', verifyToken, adminMiddleware, createCompetencyController);
router.get('/', verifyToken, adminMiddleware, listCompetenciesController);
router.get('/:id', verifyToken, adminMiddleware, getCompetencyByIdController);
router.patch('/:id', verifyToken, adminMiddleware, updateCompetencyController);
router.delete('/:id', verifyToken, adminMiddleware, deleteCompetencyController);

export default router;


