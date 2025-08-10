import express from 'express';
import authRoutes from '../../entities/auth/auth.routes.js';
import userRoutes from '../../entities/user/user.routes.js';
import competencyRoutes from '../../entities/competency/competency.routes.js';
import questionRoutes from '../../entities/question/question.routes.js';
import assessmentsRoutes from '../../entities/assessments/assessments.routes.js';
import certificateRoutes from '../../entities/certificates/certificate.routes.js';
import proctorRoutes from '../../entities/assessments/proctor.routes.js';
//import dashboardRoutes from '../../entities/dashboard/dashboard.routes.js';

const router = express.Router();

router.use('/v1/auth', authRoutes);
router.use('/v1/user', userRoutes);
router.use('/v1/competencies', competencyRoutes);
router.use('/v1/questions', questionRoutes);
router.use('/v1/assessments', assessmentsRoutes);
router.use('/v1/certificates', certificateRoutes);
router.use('/v1/proctor', proctorRoutes);
//router.use('/v1/admin/dashboard', dashboardRoutes);

export default router;
