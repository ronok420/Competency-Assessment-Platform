import Question from './question.model.js';
import { createPaginationInfo } from '../../lib/pagination.js';

export const createQuestion = async ({ competencyId, level, text, options, correctOptionKey }) => {
  // Basic integrity check: correctOptionKey must exist in options
  if (!Array.isArray(options) || options.length < 2) {
    throw new Error('At least two options are required');
  }
  const optionKeys = new Set(options.map(o => o.key));
  if (!optionKeys.has(correctOptionKey)) {
    throw new Error('correctOptionKey must match one of the option keys');
  }
  const question = await Question.create({ competencyId, level, text, options, correctOptionKey });
  return question;
};

export const listQuestions = async ({ page = 1, limit = 10, search, competencyId, level, isActive, date }) => {
  const numericPage = Number(page) || 1;
  const numericLimit = Math.min(Number(limit) || 10, 100);

  const filter = {};
  if (competencyId) filter.competencyId = competencyId;
  if (level) filter.level = level;
  if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;
  if (search) filter.text = { $regex: search, $options: 'i' };
  if (date) {
    const _date = new Date(date);
    const startOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
    const endOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() + 1);
    filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
  }

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
  const allowed = ['competencyId', 'level', 'text', 'options', 'correctOptionKey', 'isActive'];
  const payload = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  if (payload.options) {
    if (!Array.isArray(payload.options) || payload.options.length < 2) {
      throw new Error('At least two options are required');
    }
  }
  if (payload.correctOptionKey && payload.options) {
    const keys = new Set(payload.options.map(o => o.key));
    if (!keys.has(payload.correctOptionKey)) {
      throw new Error('correctOptionKey must match one of the option keys');
    }
  }
  const updated = await Question.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!updated) throw new Error('Question not found');
  return updated;
};

export const softDeleteQuestion = async (id) => {
  const updated = await Question.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!updated) throw new Error('Question not found');
  return updated;
};


