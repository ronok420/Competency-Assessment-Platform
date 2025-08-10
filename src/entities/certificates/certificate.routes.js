import express from 'express';
import { verifyToken, userMiddleware, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { myCertificateController, downloadCertificateController, verifyCertificateController } from './certificate.controller.js';

const router = express.Router();

router.get('/my-certificate', verifyToken, userMiddleware, myCertificateController);
router.get('/:id/download', verifyToken, downloadCertificateController); // authz inside controller (owner or admin)
router.get('/verify/:uid', verifyCertificateController); // public

export default router;


