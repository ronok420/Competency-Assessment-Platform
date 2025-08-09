import Competency from '../entities/competency/competency.model.js';

export const validateOptions = (options, correctOptionKey) => {
  if (!Array.isArray(options) || options.length < 2) {
    throw new Error('At least two options are required');
  }
  const keys = new Set(options.map((o) => o.key));
  if (correctOptionKey !== undefined && !keys.has(correctOptionKey)) {
    throw new Error('correctOptionKey must match one of the option keys');
  }
};

export const normalizeCode = (code) => (code ? String(code).toUpperCase().trim() : undefined);

export const buildQuestionFilter = ({ search, competencyId, competencyCode, level, isActive, date }) => {
  const filter = {};
  if (competencyId) filter.competencyId = competencyId;
  if (competencyCode) filter.competencyCode = normalizeCode(competencyCode);
  if (level) filter.level = level;
  if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;
  if (search) filter.text = { $regex: search, $options: 'i' };
  if (date) {
    const _date = new Date(date);
    const startOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
    const endOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() + 1);
    filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
  }
  return filter;
};

export const whitelistQuestionUpdates = (updates) => {
  const allowed = ['competencyId', 'competencyCode', 'level', 'text', 'options', 'correctOptionKey', 'isActive'];
  return Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
};

export const resolveCompetencyPair = async ({ competencyId, competencyCode }) => {
  let resolvedId = competencyId || null;
  let resolvedCode = normalizeCode(competencyCode) || null;

  if (!resolvedId && resolvedCode) {
    const comp = await Competency.findOne({ code: resolvedCode }).select('_id code');
    if (!comp) throw new Error(`Competency code not found: ${resolvedCode}`);
    resolvedId = comp._id;
    resolvedCode = comp.code;
  } else if (resolvedId && !resolvedCode) {
    const comp = await Competency.findById(resolvedId).select('code');
    if (!comp) throw new Error(`Competency not found for id: ${resolvedId}`);
    resolvedCode = comp.code;
  }

  if (!resolvedId) {
    throw new Error('competencyId or competencyCode is required');
  }
  return { competencyId: resolvedId, competencyCode: resolvedCode };
};

export const findMissingCompetencyCodes = async (codes = []) => {
  const clean = Array.from(new Set((codes || []).map(normalizeCode).filter(Boolean)));
  if (clean.length === 0) return [];
  const found = await Competency.find({ code: { $in: clean } }).select('code').lean();
  const set = new Set(found.map((c) => c.code));
  return clean.filter((c) => !set.has(c));
};


