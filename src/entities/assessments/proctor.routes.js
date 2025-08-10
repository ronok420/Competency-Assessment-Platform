import express from 'express';
import { verifyToken, userMiddleware } from '../../core/middlewares/authMiddleware.js';
import { recordingMulter, uploadRecordingToCloudinary } from '../../core/middlewares/proctorUpload.js';

const router = express.Router();

// Minimal endpoint to accept video chunks during exam (uploaded to Cloudinary)
router.post('/recordings/:sessionId/chunk', verifyToken, userMiddleware, recordingMulter.single('chunk'), uploadRecordingToCloudinary, (req, res) => {
  const { url, publicId } = req.recording || {};
  return res.status(201).json({ status: true, message: 'Chunk received', data: { url, publicId } });
});

export default router;


