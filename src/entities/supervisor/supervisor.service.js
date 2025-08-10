import TestSession from '../assessments/testSession.model.js';
import Question from '../question/question.model.js';

export const listActiveSessions = async ({ page = 1, limit = 10 }) => {
  const filter = { status: 'InProgress' };
  const total = await TestSession.countDocuments(filter);
  const items = await TestSession.find(filter)
    .populate('userId', 'name email')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { items, pagination: { page: Number(page), limit: Number(limit), total } };
};

export const getSessionDetail = async (sessionId) => {
  const session = await TestSession.findById(sessionId)
    .populate('userId', 'name email')
    .lean();
  if (!session) throw new Error('Session not found');
  const currentStep = session.steps?.[session.steps.length - 1];
  let questions = [];
  if (currentStep?.questions?.length) {
    questions = await Question.find({ _id: { $in: currentStep.questions } })
      .select('_id text options')
      .lean();
  }
  return { session, currentStep, questions };
};

export const forceSubmitSession = async (sessionId) => {
  const session = await TestSession.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.status !== 'InProgress') throw new Error('Session is not in progress');
  const step = session.steps[session.steps.length - 1];
  step.submittedAt = new Date();
  session.status = 'Completed';
  await session.save();
  return true;
};


