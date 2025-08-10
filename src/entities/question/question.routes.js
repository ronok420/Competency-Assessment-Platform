import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import {
  createQuestionController,
  listQuestionsController,
  getQuestionByIdController,
  updateQuestionController,
  deleteQuestionController,
  bulkUploadQuestionsController,
  getQuestionCountsByLevelController,
} from './question.controller.js';
import { multerUpload } from '../../core/middlewares/multer.js';

const router = express.Router();

router.post('/', verifyToken, adminMiddleware, createQuestionController);
router.get('/', verifyToken, adminMiddleware, listQuestionsController);
router.get('/:id', verifyToken, adminMiddleware, getQuestionByIdController);
router.patch('/:id', verifyToken, adminMiddleware, updateQuestionController);
router.delete('/:id', verifyToken, adminMiddleware, deleteQuestionController);

// Bulk upload: accept JSON file via multipart field 'file' or CSV or JSON array in body
router.post('/bulk', verifyToken, adminMiddleware, multerUpload([{ name: 'file', maxCount: 1 }]), bulkUploadQuestionsController);

// Diagnostics: counts by level (optionally filter by isActive)
router.get('/stats/count-by-level', verifyToken, adminMiddleware, getQuestionCountsByLevelController);

export default router;


