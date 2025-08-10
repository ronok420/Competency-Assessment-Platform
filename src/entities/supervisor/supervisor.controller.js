import { generateResponse } from '../../lib/responseFormate.js';
import { listActiveSessions, getSessionDetail, forceSubmitSession } from './supervisor.service.js';

export const listActiveSessionsController = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await listActiveSessions({ page, limit });
    return generateResponse(res, 200, true, 'Active sessions', data);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch sessions');
  }
};

export const getSessionDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getSessionDetail(id);
    return generateResponse(res, 200, true, 'Session detail', data);
  } catch (e) {
    const status = /not found/i.test(e.message) ? 404 : 500;
    return generateResponse(res, status, false, e.message || 'Failed to fetch session');
  }
};

export const forceSubmitSessionController = async (req, res) => {
  try {
    const { id } = req.params;
    await forceSubmitSession(id);
    return generateResponse(res, 200, true, 'Session force-submitted');
  } catch (e) {
    const status = /not found|not in progress/i.test(e.message) ? 400 : 500;
    return generateResponse(res, status, false, e.message || 'Failed to force submit');
  }
};


