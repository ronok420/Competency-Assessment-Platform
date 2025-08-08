import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  getAllCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
} from './category.controller.js';

const router = express.Router();


router.use(verifyToken, adminMiddleware);

router.route('/')
  .get(getAllCategoriesController)
  .post(multerUpload([{ name: 'image', maxCount: 1 }]), createCategoryController);


router.route('/:id')
  .get(getCategoryByIdController)
  .put(multerUpload([{ name: 'image', maxCount: 1 }]), updateCategoryController)
  .delete(deleteCategoryController);

export default router; 