import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import {
  createCompetencyController,
  listCompetenciesController,
  getCompetencyByIdController,
  updateCompetencyController,
  deleteCompetencyController,
  bulkUploadCompetenciesController,
} from './competency.controller.js';
import { multerUpload } from '../../core/middlewares/multer.js';

const router = express.Router();

router.post('/', verifyToken, adminMiddleware, createCompetencyController);
router.get('/', verifyToken, adminMiddleware, listCompetenciesController);
router.get('/:id', verifyToken, adminMiddleware, getCompetencyByIdController);
router.patch('/:id', verifyToken, adminMiddleware, updateCompetencyController);
router.delete('/:id', verifyToken, adminMiddleware, deleteCompetencyController);

// Bulk upload competencies for CSV and JSON files
// Accepts multipart field 'file' for file uploads
router.post('/bulk', verifyToken, adminMiddleware, multerUpload([{ name: 'file', maxCount: 1 }]), bulkUploadCompetenciesController);

export default router;


