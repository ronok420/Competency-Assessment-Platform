import { generateResponse } from '../../lib/responseFormate.js';
import {
  startAssessmentService,
  getActiveSessionService,
  submitStepService,
  startNextStepService,
} from './assessments.service.js';

export const startAssessmentController = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const data = await startAssessmentService(userId);
    return generateResponse(res, 201, true, 'Assessment started successfully. You have 44 minutes.', data);
  } catch (error) {
    const status = error.statusCode || 500;
    return generateResponse(res, status, false, error.message || 'Failed to start assessment');
  }
};

export const activeSessionController = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const data = await getActiveSessionService(userId);
    return generateResponse(res, 200, true, 'Active session fetched', data);
  } catch (error) {
    const status = error.statusCode || 500;
    return generateResponse(res, status, false, error.message || 'Failed to fetch active session');
  }
};

export const submitStepController = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { sessionId } = req.params;
    const { answers } = req.body;
    const data = await submitStepService(userId, sessionId, answers);
    return generateResponse(res, 200, true, 'Step submitted successfully', data);
  } catch (error) {
    const status = error.statusCode || 500;
    return generateResponse(res, status, false, error.message || 'Failed to submit step');
  }
};

export const nextStepController = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { sessionId } = req.params;
    const data = await startNextStepService(userId, sessionId);
    return generateResponse(res, 201, true, 'Next step started', data);
  } catch (error) {
    const status = error.statusCode || 500;
    return generateResponse(res, status, false, error.message || 'Failed to start next step');
  }
};


