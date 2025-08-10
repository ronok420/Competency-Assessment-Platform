import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import Certificate from './certificate.model.js';
import User from '../auth/auth.model.js';
import { certificateHtml, certificateEmailTemplate } from './certificate.templates.js';
import sendEmail from '../../lib/sendEmail.js';
import { fileURLToPath } from 'url';

const generateCertificateUID = () => crypto.randomUUID();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../../../uploads/certificates');
if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir, { recursive: true });

export const issueCertificate = async (userId, testSessionId, level) => {
  const certificateUID = generateCertificateUID();
  // Create HTML and write a simple PDF-like file (for demo use an .html saved as .pdf or integrate puppeteer later)
  const user = await User.findById(userId).select('name email');
  const html = certificateHtml({ holderName: user?.name || 'Student', level, dateISO: new Date().toISOString(), certificateUID });
  const filename = `${certificateUID}.pdf`;
  const filePath = path.join(certificatesDir, filename);
  await fs.promises.writeFile(filePath, html, 'utf-8');

  const cert = await Certificate.create({ userId, testSessionId, level, certificateUID, pdfUrl: filePath });
  await User.findByIdAndUpdate(userId, { 'assessmentStatus.certificateId': cert._id }, { new: true });

  const verifyUrl = `${process.env.PUBLIC_BASE_URL || ''}/api/v1/certificates/verify/${certificateUID}`;
  await sendEmail({
    to: user?.email,
    subject: 'Your Certificate is Ready',
    html: certificateEmailTemplate({ holderName: user?.name || 'Student', level, verifyUrl }),
  });

  return cert;
};

export const getLatestCertificateForUser = async (userId) => {
  const cert = await Certificate.findOne({ userId }).sort({ createdAt: -1 });
  return cert;
};

export const findCertificateByUid = async (uid) => {
  const cert = await Certificate.findOne({ certificateUID: uid }).populate('userId', 'name');
  return cert;
};


