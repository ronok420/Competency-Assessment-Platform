import Question from './question.model.js';
import { createPaginationInfo } from '../../lib/pagination.js';
import { validateOptions, buildQuestionFilter, whitelistQuestionUpdates, resolveCompetencyPair } from '../../utils/questionUtils.js';

export const createQuestion = async ({ competencyId, competencyCode, level, text, options, correctOptionKey, timeLimitSec }) => {
  validateOptions(options, correctOptionKey);
  const pair = await resolveCompetencyPair({ competencyId, competencyCode });
  const payload = { ...pair, level, text, options, correctOptionKey };
  if (timeLimitSec !== undefined) payload.timeLimitSec = Number(timeLimitSec);
  const question = await Question.create(payload);
  return question;
};

export const listQuestions = async ({ page = 1, limit = 10, search, competencyId, competencyCode, level, isActive, date }) => {
  const numericPage = Number(page) || 1;
  const numericLimit = Math.min(Number(limit) || 10, 100);

  const filter = buildQuestionFilter({ search, competencyId, competencyCode, level, isActive, date });

  const total = await Question.countDocuments(filter);
  const items = await Question.find(filter)
    .populate('competencyId', 'name code')
    .sort({ createdAt: -1 })
    .skip((numericPage - 1) * numericLimit)
    .limit(numericLimit);

  const paginationInfo = createPaginationInfo(numericPage, numericLimit, total);
  return { items, paginationInfo };
};

export const getQuestionById = async (id) => {
  const question = await Question.findById(id).populate('competencyId', 'name code');
  if (!question) throw new Error('Question not found');
  return question;
};

export const updateQuestion = async (id, updates) => {
  const payload = whitelistQuestionUpdates(updates);
  if (payload.competencyCode || payload.competencyId) {
    const pair = await resolveCompetencyPair({ competencyId: payload.competencyId, competencyCode: payload.competencyCode });
    payload.competencyId = pair.competencyId;
    payload.competencyCode = pair.competencyCode;
  }
  if (payload.options) validateOptions(payload.options, payload.correctOptionKey);
  const updated = await Question.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!updated) throw new Error('Question not found');
  return updated;
};

export const softDeleteQuestion = async (id) => {
  const updated = await Question.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!updated) throw new Error('Question not found');
  return updated;
};



