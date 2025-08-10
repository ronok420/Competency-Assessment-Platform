import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recordingsDir = path.resolve(__dirname, '../../../uploads/recordings');
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, recordingsDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const base = `${req.user?._id || 'anon'}-${req.params.sessionId || 'session'}-${ts}`;
    cb(null, `${base}.webm`);
  },
});

export const recordingMulter = multer({ storage });

export const uploadRecordingToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'No chunk uploaded' });
    const publicId = `${req.user?._id}-${req.params.sessionId}-${Date.now()}`;
    const uploadRes = await cloudinaryUpload(req.file.path, publicId, 'exam-recordings');
    if (uploadRes === 'file upload failed') {
      return res.status(500).json({ status: false, message: 'Cloud upload failed' });
    }
    req.recording = { url: uploadRes.secure_url, publicId: uploadRes.public_id };
    return next();
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message || 'Upload error' });
  }
};


