import { generateResponse } from '../../lib/responseFormate.js';
import { getLatestCertificateForUser, findCertificateByUid } from './certificate.service.js';
import Certificate from './certificate.model.js';

export const myCertificateController = async (req, res) => {
  try {
    const user = req.user;
    const finalLevel = user?.assessmentStatus?.finalLevel || null;
    if (!finalLevel) {
      return generateResponse(res, 404, false, 'No certificate has been awarded to this user.');
    }
    const cert = await getLatestCertificateForUser(user._id);
    if (!cert) return generateResponse(res, 404, false, 'Certificate not found');
    return generateResponse(res, 200, true, 'Certificate details retrieved successfully.', {
      _id: cert._id,
      level: cert.level,
      issuedAt: cert.issuedAt,
      certificateUID: cert.certificateUID,
      pdfUrl: `/api/v1/certificates/${cert._id}/download`,
    });
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch certificate');
  }
};

export const downloadCertificateController = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) return generateResponse(res, 404, false, 'Certificate not found');

    // Authorization: owner or admin
    const isOwner = cert.userId.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return generateResponse(res, 403, false, 'Forbidden');
    }

    if (!cert.pdfUrl) {
      return generateResponse(res, 404, false, 'PDF not generated yet');
    }
    return res.download(cert.pdfUrl);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to download certificate');
  }
};

export const verifyCertificateController = async (req, res) => {
  try {
    const { uid } = req.params;
    const cert = await findCertificateByUid(uid);
    if (!cert) return generateResponse(res, 404, false, 'This certificate is not valid or could not be found.');
    return generateResponse(res, 200, true, 'Certificate Verified.', {
      isVerified: true,
      certificateHolder: cert.userId?.name,
      awardedLevel: cert.level,
      issueDate: cert.issuedAt,
    });
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to verify certificate');
  }
};


