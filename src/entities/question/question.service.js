import Question from './question.model.js';
import { createPaginationInfo } from '../../lib/pagination.js';
import Competency from '../competency/competency.model.js';
import fs from 'fs';

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

// Bulk create from items array
export const bulkCreateQuestions = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  const results = { inserted: 0, errors: [] };

  // Resolve competency codes to IDs if provided
  const codeToIdCache = new Map();
  const resolveCompetencyId = async (record) => {
    if (record.competencyId) return record.competencyId;
    if (record.competencyCode) {
      const code = String(record.competencyCode).toUpperCase();
      if (codeToIdCache.has(code)) return codeToIdCache.get(code);
      const comp = await Competency.findOne({ code });
      if (!comp) throw new Error(`Competency code not found: ${code}`);
      codeToIdCache.set(code, comp._id);
      return comp._id;
    }
    throw new Error('competencyId or competencyCode is required');
  };

  const docs = [];
  for (let idx = 0; idx < items.length; idx += 1) {
    const r = items[idx];
    try {
      const competencyId = await resolveCompetencyId(r);
      const level = r.level;
      const text = r.text;
      const options = r.options;
      const correctOptionKey = r.correctOptionKey;
      const isActive = r.isActive !== undefined ? !!r.isActive : true;

      if (!competencyId || !level || !text || !Array.isArray(options) || !correctOptionKey) {
        throw new Error('Missing required fields (competencyId/competencyCode, level, text, options, correctOptionKey)');
      }
      if (options.length < 2) throw new Error('At least two options are required');
      const keys = new Set(options.map(o => o.key));
      if (!keys.has(correctOptionKey)) throw new Error('correctOptionKey must match one of the option keys');

      docs.push({ competencyId, level, text, options, correctOptionKey, isActive });
    } catch (e) {
      results.errors.push({ index: idx, message: e.message });
    }
  }

  if (docs.length > 0) {
    const inserted = await Question.insertMany(docs, { ordered: false });
    results.inserted = inserted.length;
  }

  return results;
};

// Helper: parse JSON file uploaded (expects { items: [...] })
export const parseBulkQuestionsJsonFile = async (filePath) => {
  const raw = await fs.promises.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.items)) return parsed.items;
  throw new Error('Invalid JSON format. Expected an array or { items: [...] }');
};

export const getQuestionCountsByLevel = async ({ isActive }) => {
  const match = {};
  if (typeof isActive !== 'undefined') match.isActive = isActive === 'true' || isActive === true;
  const grouped = await Question.aggregate([
    { $match: match },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $project: { level: '$_id', count: 1, _id: 0 } },
    { $sort: { level: 1 } }
  ]);
  return grouped;
};


