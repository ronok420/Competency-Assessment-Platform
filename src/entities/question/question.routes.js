import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import {
  createQuestionController,
  listQuestionsController,
  getQuestionByIdController,
  updateQuestionController,
  deleteQuestionController,
} from './question.controller.js';

const router = express.Router();

router.post('/', verifyToken, adminMiddleware, createQuestionController);
router.get('/', verifyToken, adminMiddleware, listQuestionsController);
router.get('/:id', verifyToken, adminMiddleware, getQuestionByIdController);
router.patch('/:id', verifyToken, adminMiddleware, updateQuestionController);
router.delete('/:id', verifyToken, adminMiddleware, deleteQuestionController);

export default router;


