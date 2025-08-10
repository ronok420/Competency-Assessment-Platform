import { generateResponse } from '../../lib/responseFormate.js';

// Minimal SEB guard: if SEB_ENFORCED=true, require a matching exam key or SafeExamBrowser UA
export const sebGuard = (req, res, next) => {
  const enforced = String(process.env.SEB_ENFORCED || '').toLowerCase() === 'true';
  if (!enforced) return next();

  const expectedKey = process.env.SEB_EXAM_KEY || '';
  const providedKey = req.header('x-seb-exam-key') || '';
  const ua = (req.header('user-agent') || '').toLowerCase();
  const looksLikeSEB = ua.includes('safeexambrowser');

  if ((expectedKey && providedKey === expectedKey) || looksLikeSEB) {
    return next();
  }

  return generateResponse(res, 403, false, 'Safe Exam Browser required');
};


