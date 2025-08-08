import Competency from './competency.model.js';
import { createPaginationInfo } from '../../lib/pagination.js';

export const createCompetency = async ({ name, description, code }) => {
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


