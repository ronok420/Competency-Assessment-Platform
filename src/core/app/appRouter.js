import express from 'express';
import authRoutes from '../../entities/auth/auth.routes.js';
import userRoutes from '../../entities/user/user.routes.js';
import categoryRoutes from '../../entities/category/category.routes.js';
//import dashboardRoutes from '../../entities/dashboard/dashboard.routes.js';

const router = express.Router();

router.use('/v1/auth', authRoutes);
router.use('/v1/user', userRoutes);
router.use('/v1/admin/categories', categoryRoutes);
//router.use('/v1/admin/dashboard', dashboardRoutes);

export default router;
