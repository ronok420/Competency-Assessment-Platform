import { generateResponse } from '../../lib/responseFormate.js';
import fs from 'fs';
import { findMissingCompetencyCodes } from '../../utils/questionUtils.js';
import { createQuestion, listQuestions, getQuestionById, updateQuestion, softDeleteQuestion } from './question.service.js';
import { bulkCreateQuestions, parseBulkQuestionsJsonFile, getQuestionCountsByLevel } from './question.bulk.service.js';

export const createQuestionController = async (req, res) => {
  try {
    const { competencyId, competencyCode, level, text, options, correctOptionKey } = req.body;
    if ((!competencyId && !competencyCode) || !level || !text || !options || !correctOptionKey) {
      return generateResponse(res, 400, false, 'competencyId or competencyCode, level, text, options, and correctOptionKey are required');
    }
    const item = await createQuestion({ competencyId, competencyCode, level, text, options, correctOptionKey });
    return generateResponse(res, 201, true, 'Question created successfully', item);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to create question');
  }
};

export const listQuestionsController = async (req, res) => {
  try {
    const { page, limit, search, competencyId, competencyCode, level, isActive, date } = req.query;
    const { items, paginationInfo } = await listQuestions({ page, limit, search, competencyId, competencyCode, level, isActive, date });
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

export const bulkUploadQuestionsController = async (req, res) => {
  try {
    // Accept either JSON payload in body or JSON file via multipart field 'file'
    let items;
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      items = await parseBulkQuestionsJsonFile(file.path);
      // best-effort cleanup
      fs.unlink(file.path, () => {});
    } else if (Array.isArray(req.body)) {
      items = req.body;
    } else if (req.body && req.body.items) {
      items = req.body.items;
    } else {
      return generateResponse(res, 400, false, 'Provide items array in body or upload a JSON file in field "file"');
    }

    // Early diagnostics: validate competency codes existence if provided
    const codes = Array.from(new Set(items.map((it) => it.competencyCode).filter(Boolean)));
    const missingCodes = await findMissingCompetencyCodes(codes);
    if (missingCodes.length > 0) {
      return generateResponse(res, 422, false, 'Some competency codes do not exist. Create competencies first or correct the codes.', { missingCodes });
    }

    const result = await bulkCreateQuestions(items);
    const status = result.errors.length ? 207 : 201; // 207 Multi-Status if partial errors
    return generateResponse(res, status, true, 'Bulk upload processed', result);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to process bulk upload');
  }
};

export const getQuestionCountsByLevelController = async (req, res) => {
  try {
    const { isActive } = req.query;
    const data = await getQuestionCountsByLevel({ isActive });
    return generateResponse(res, 200, true, 'Question counts by level', data);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to fetch counts');
  }
};


