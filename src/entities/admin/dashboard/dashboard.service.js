import User from '../../auth/auth.model.js';
import TestSession from '../../assessments/testSession.model.js';
import Question from '../../question/question.model.js';
import Certificate from '../../certificates/certificate.model.js';

export const getOverviewAnalytics = async () => {
  const [totalUsers, students, supervisors, admins, verifiedUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'STUDENT' }),
    User.countDocuments({ role: 'SUPERVISOR' }),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ isVerified: true }),
  ]);

  const [sessionsInProgress, sessionsCompleted, sessionsFailed] = await Promise.all([
    TestSession.countDocuments({ status: 'InProgress' }),
    TestSession.countDocuments({ status: 'Completed' }),
    TestSession.countDocuments({ status: 'Failed' }),
  ]);

  const [totalQuestions, activeQuestions] = await Promise.all([
    Question.countDocuments({}),
    Question.countDocuments({ isActive: true }),
  ]);

  const questionsByLevel = await Question.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $project: { level: '$_id', count: 1, _id: 0 } },
    { $sort: { level: 1 } },
  ]);

  const certificatesByLevel = await Certificate.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $project: { level: '$_id', count: 1, _id: 0 } },
    { $sort: { level: 1 } },
  ]);

  return {
    users: { total: totalUsers, students, supervisors, admins, verified: verifiedUsers },
    assessments: { inProgress: sessionsInProgress, completed: sessionsCompleted, failed: sessionsFailed },
    questions: { total: totalQuestions, active: activeQuestions, byLevel: questionsByLevel },
    certificates: { byLevel: certificatesByLevel },
  };
};

export const getUsersTimeseries = async ({ from, to, granularity = 'day' }) => {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const groupFormat = granularity === 'month' ? { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } } : { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } };
  const series = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $project: { _id: 0, key: '$_id', count: 1 } },
    { $sort: { 'key.y': 1, 'key.m': 1, ...(granularity === 'day' ? { 'key.d': 1 } : {}) } },
  ]);
  return { from: start, to: end, granularity, series };
};

export const getQuestionStats = async ({ level, competencyCode, isActive }) => {
  const filter = {};
  if (level) filter.level = level;
  if (competencyCode) filter.competencyCode = competencyCode.toUpperCase();
  if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;

  const [total, byLevel, byCompetency] = await Promise.all([
    Question.countDocuments(filter),
    Question.aggregate([
      { $match: filter },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $project: { level: '$_id', count: 1, _id: 0 } },
      { $sort: { level: 1 } },
    ]),
    Question.aggregate([
      { $match: filter },
      { $group: { _id: '$competencyCode', count: { $sum: 1 } } },
      { $project: { competencyCode: '$_id', count: 1, _id: 0 } },
      { $sort: { competencyCode: 1 } },
    ]),
  ]);

  return { total, byLevel, byCompetency };
};

export const listSessions = async ({ status, page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;
  const total = await TestSession.countDocuments(filter);
  const items = await TestSession.find(filter)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return { items, pagination: { page: Number(page), limit: Number(limit), total } };
};


