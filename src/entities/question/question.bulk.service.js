import Question from './question.model.js';
import Competency from '../competency/competency.model.js';
import { buildBulkResult, pushBulkError, applyBulkWriteErrors } from '../../utils/bulk.js';
import { readJsonFile, extractItemsArray } from '../../utils/json.js';

export const parseBulkQuestionsJsonFile = async (filePath) => {
  const parsed = await readJsonFile(filePath);
  return extractItemsArray(parsed);
};

export const bulkCreateQuestions = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  const results = buildBulkResult();
  const codeToId = new Map();
  const docs = [];

  for (let idx = 0; idx < items.length; idx += 1) {
    const r = items[idx];
    try {
      const code = r.competencyCode && String(r.competencyCode).toUpperCase();
      let competencyId = r.competencyId || null;
      if (!competencyId) {
        if (!code) throw new Error('competencyId or competencyCode is required');
        if (codeToId.has(code)) competencyId = codeToId.get(code);
        else {
          const comp = await Competency.findOne({ code }).select('_id');
          if (!comp) throw new Error(`Competency code not found: ${code}`);
          competencyId = comp._id;
          codeToId.set(code, comp._id);
        }
      }

      const { level, text, options, correctOptionKey } = r;
      if (!competencyId || !level || !text || !Array.isArray(options) || !correctOptionKey) {
        throw new Error('Missing required fields (competencyId/competencyCode, level, text, options, correctOptionKey)');
      }
      if (options.length < 2) throw new Error('At least two options are required');
      const keys = new Set(options.map((o) => o.key));
      if (!keys.has(correctOptionKey)) throw new Error('correctOptionKey must match one of the option keys');

      docs.push({ competencyId, competencyCode: code || undefined, level, text, options, correctOptionKey, isActive: r.isActive !== undefined ? !!r.isActive : true });
    } catch (e) {
      pushBulkError(results, idx, e.message);
    }
  }

  if (docs.length > 0) {
    try {
      const inserted = await Question.insertMany(docs, { ordered: false });
      results.inserted = inserted.length;
    } catch (e) {
      applyBulkWriteErrors(results, e);
      if (results.inserted === 0 && results.errors.length === items.length) {
        results.message = 'All items failed to insert. Check codes, levels, options, and duplicate keys.';
      }
    }
  }

  return results;
};

export const getQuestionCountsByLevel = async ({ isActive }) => {
  const match = {};
  if (typeof isActive !== 'undefined') match.isActive = isActive === 'true' || isActive === true;
  const grouped = await Question.aggregate([
    { $match: match },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $project: { level: '$_id', count: 1, _id: 0 } },
    { $sort: { level: 1 } },
  ]);
  return grouped;
};


