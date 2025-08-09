import Competency from './competency.model.js';
import { createPaginationInfo } from '../../lib/pagination.js';
import { readJsonFile, extractItemsArray } from '../../utils/json.js';
import { buildBulkResult, pushBulkError, applyBulkWriteErrors } from '../../utils/bulk.js';
import { normalizeString, normalizeUpper } from '../../utils/normalize.js';

export const createCompetency = async ({ name, description, code }) => {
  if (!code) throw new Error('code is required');
  const competency = await Competency.create({ name, description, code });
  return competency;
};

export const listCompetencies = async ({ page = 1, limit = 10, search, isActive, date }) => {
  const numericPage = Number(page) || 1;
  const numericLimit = Math.min(Number(limit) || 10, 100);

  const filter = {};
  if (typeof isActive !== 'undefined') {
    filter.isActive = isActive === 'true' || isActive === true;
  }
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (date) {
    const _date = new Date(date);
    const startOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
    const endOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() + 1);
    filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
  }

  const total = await Competency.countDocuments(filter);
  const items = await Competency.find(filter)
    .sort({ createdAt: -1 })
    .skip((numericPage - 1) * numericLimit)
    .limit(numericLimit);

  const paginationInfo = createPaginationInfo(numericPage, numericLimit, total);
  return { items, paginationInfo };
};

export const getCompetencyById = async (id) => {
  const competency = await Competency.findById(id);
  if (!competency) throw new Error('Competency not found');
  return competency;
};

export const updateCompetency = async (id, updates) => {
  const allowed = ['name', 'description', 'code', 'isActive'];
  const payload = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  const updated = await Competency.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!updated) throw new Error('Competency not found');
  return updated;
};

export const softDeleteCompetency = async (id) => {
  const updated = await Competency.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!updated) throw new Error('Competency not found');
  return updated;
};

// Bulk create competencies; supports auto-generated code via model pre-save
export const bulkCreateCompetencies = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  const results = buildBulkResult();
  const docs = [];

  // Pre-validate and normalize
  for (let idx = 0; idx < items.length; idx += 1) {
    const r = items[idx];
    try {
      const name = normalizeString(r.name);
      const description = normalizeString(r.description);
      const code = normalizeUpper(r.code);
      const isActive = r.isActive !== undefined ? !!r.isActive : true;

      if (!name || !description || !code) {
        throw new Error('name, description and code are required');
      }

      docs.push({ name, description, code, isActive });
    } catch (e) {
      pushBulkError(results, idx, e.message);
    }
  }

  if (docs.length === 0) {
    return results;
  }

  try {
    const inserted = await Competency.insertMany(docs, { ordered: false });
    results.inserted += inserted.length;
  } catch (e) {
    applyBulkWriteErrors(results, e);
  }

  return results;
};

export const parseBulkCompetenciesJsonFile = async (filePath) => {
  const parsed = await readJsonFile(filePath);
  return extractItemsArray(parsed);
};


