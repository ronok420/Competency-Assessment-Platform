import { generateResponse } from '../../lib/responseFormate.js';
import {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  softDeleteQuestion,
} from './question.service.js';

export const createQuestionController = async (req, res) => {
  try {
    const { competencyId, level, text, options, correctOptionKey } = req.body;
    if (!competencyId || !level || !text || !options || !correctOptionKey) {
      return generateResponse(res, 400, false, 'competencyId, level, text, options, and correctOptionKey are required');
    }
    const item = await createQuestion({ competencyId, level, text, options, correctOptionKey });
    return generateResponse(res, 201, true, 'Question created successfully', item);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to create question');
  }
};

export const listQuestionsController = async (req, res) => {
  try {
    const { page, limit, search, competencyId, level, isActive, date } = req.query;
    const { items, paginationInfo } = await listQuestions({ page, limit, search, competencyId, level, isActive, date });
    return generateResponse(res, 200, true, 'Questions fetched successfully', { items, paginationInfo });
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to fetch questions');
  }
};

export const getQuestionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getQuestionById(id);
    return generateResponse(res, 200, true, 'Question fetched successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to fetch question');
  }
};

export const updateQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await updateQuestion(id, req.body);
    return generateResponse(res, 200, true, 'Question updated successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to update question');
  }
};

export const deleteQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await softDeleteQuestion(id);
    return generateResponse(res, 200, true, 'Question deactivated successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to deactivate question');
  }
};


