import { generateResponse } from '../../../lib/responseFormate.js';
import { getOverviewAnalytics, getUsersTimeseries, getQuestionStats, listSessions } from './dashboard.service.js';

export const overviewController = async (req, res) => {
  try {
    const data = await getOverviewAnalytics();
    return generateResponse(res, 200, true, 'Overview analytics', data);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch overview');
  }
};

export const usersTimeseriesController = async (req, res) => {
  try {
    const { from, to, granularity } = req.query;
    const data = await getUsersTimeseries({ from, to, granularity });
    return generateResponse(res, 200, true, 'Users timeseries', data);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch timeseries');
  }
};

export const questionStatsController = async (req, res) => {
  try {
    const { level, competencyCode, isActive } = req.query;
    const data = await getQuestionStats({ level, competencyCode, isActive });
    return generateResponse(res, 200, true, 'Question stats', data);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch question stats');
  }
};

export const listSessionsController = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const data = await listSessions({ status, page, limit });
    return generateResponse(res, 200, true, 'Sessions', data);
  } catch (e) {
    return generateResponse(res, 500, false, e.message || 'Failed to fetch sessions');
  }
};


