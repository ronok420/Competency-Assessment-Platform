import mongoose from 'mongoose';
import TestSession from './testSession.model.js';
import Question from '../question/question.model.js';
import User from '../auth/auth.model.js';
import { computeStepOutcome, levelPairForNextStep } from './computeStepOutcome.js';

const QUESTIONS_PER_LEVEL = 22;
const QUESTIONS_PER_STEP = 44;
const SECONDS_PER_QUESTION = 60; // default: 1 minute per question

const pickRandomActiveQuestions = async (level, count) => {
  const docs = await Question.aggregate([
    { $match: { level, isActive: true } },
    { $sample: { size: count } }
  ]);
  return docs;
};

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getCurrentStep = (session) => {
  if (!session.steps || session.steps.length === 0) return null;
  return session.steps[session.steps.length - 1];
};

export const startAssessmentService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const status = user.assessmentStatus?.status || 'NotStarted';
  if (status === 'Failed') {
    const err = new Error('Your account is not eligible for a retake.');
    err.statusCode = 403;
    throw err;
  }
  if (status === 'InProgress' || status === 'Completed') {
    const err = new Error('Assessment has already been started or completed. Please check your dashboard.');
    err.statusCode = 400;
    throw err;
  }

  // Guard: existing in-progress session
  const existing = await TestSession.findOne({ userId, status: 'InProgress' });
  if (existing) {
    const err = new Error('Assessment already in progress.');
    err.statusCode = 400;
    throw err;
  }

  const a1 = await pickRandomActiveQuestions('A1', QUESTIONS_PER_LEVEL);
  const a2 = await pickRandomActiveQuestions('A2', QUESTIONS_PER_LEVEL);
  if (a1.length < QUESTIONS_PER_LEVEL || a2.length < QUESTIONS_PER_LEVEL) {
    const err = new Error('Insufficient active questions for A1/A2');
    err.statusCode = 500;
    throw err;
  }

  const combined = shuffleArray([...a1, ...a2]);
  const questionIds = combined.map(q => q._id);

  const stepDurationSec = SECONDS_PER_QUESTION * QUESTIONS_PER_STEP;
  const endsAt = new Date(Date.now() + stepDurationSec * 1000);

  const session = await TestSession.create({
    userId,
    status: 'InProgress',
    currentStepEndsAt: endsAt,
    steps: [
      {
        stepNumber: 1,
        levelPair: ['A1', 'A2'],
        questions: questionIds,
        startedAt: new Date(),
        stepDurationSec,
        totalQuestionsInStep: QUESTIONS_PER_STEP,
      },
    ],
  });

  user.assessmentStatus = { ...(user.assessmentStatus || {}), status: 'InProgress' };
  await user.save({ validateBeforeSave: false });

  // Prepare public question payload
  const questionsPublic = combined.map(q => ({ _id: q._id, text: q.text, options: q.options }));

  return { sessionId: session._id, endsAt, questions: questionsPublic };
};

export const getActiveSessionService = async (userId) => {
  const session = await TestSession.findOne({ userId, status: 'InProgress' });
  if (!session) {
    const err = new Error('No active session found');
    err.statusCode = 404;
    throw err;
  }

  const current = getCurrentStep(session);
  const questions = await Question.find({ _id: { $in: current.questions } })
    .select('_id text options')
    .lean();
  // Keep original order based on session.questions
  const orderMap = new Map(current.questions.map((id, idx) => [id.toString(), idx]));
  questions.sort((a, b) => orderMap.get(a._id.toString()) - orderMap.get(b._id.toString()));

  return { sessionId: session._id, endsAt: session.currentStepEndsAt, questions };
};

export const submitStepService = async (userId, sessionId, answers) => {
  if (!Array.isArray(answers)) {
    const err = new Error('answers must be an array');
    err.statusCode = 400;
    throw err;
  }

  const session = await TestSession.findOne({ _id: sessionId, userId });
  if (!session) {
    const err = new Error('Session not found');
    err.statusCode = 404;
    throw err;
  }

  const current = getCurrentStep(session);
  if (!current) {
    const err = new Error('No active step');
    err.statusCode = 400;
    throw err;
  }

  // Build map of answers by questionId
  const answerMap = new Map();
  for (const a of answers) {
    if (a && a.questionId && typeof a.chosenKey === 'string') {
      answerMap.set(a.questionId.toString(), a.chosenKey);
    }
  }

  // Fetch full questions including correctOptionKey
  const fullQuestions = await Question.find({ _id: { $in: current.questions } })
    .select('_id correctOptionKey')
    .lean();
  const correctSet = new Map(fullQuestions.map(q => [q._id.toString(), q.correctOptionKey]));

  let correctCount = 0;
  for (const qId of current.questions) {
    const qKey = qId.toString();
    if (answerMap.get(qKey) === correctSet.get(qKey)) {
      correctCount += 1;
    }
  }
  const scorePercent = (correctCount / current.totalQuestionsInStep || QUESTIONS_PER_STEP) * 100;

  const outcome = computeStepOutcome(current.stepNumber, scorePercent);

  // Update current step results
  current.answers = Array.from(answerMap.entries()).map(([questionId, chosenKey]) => ({ questionId, chosenKey }));
  current.scorePercent = Number(scorePercent.toFixed(2));
  current.awardedLevel = outcome.awardedLevel || null;
  current.canProceed = !!outcome.canProceed;
  current.submittedAt = new Date();

  // Update session status and possibly final level
  if (outcome.userStatus === 'Failed') {
    session.status = 'Failed';
  } else if (!current.canProceed) {
    session.status = 'Completed';
    session.finalCertificationLevel = current.awardedLevel || session.finalCertificationLevel;
  }

  await session.save();

  // Update user permanent record
  const user = await User.findById(userId);
  if (outcome.userStatus === 'Failed') {
    user.assessmentStatus = { ...(user.assessmentStatus || {}), status: 'Failed' };
  } else if (!current.canProceed) {
    user.assessmentStatus = {
      ...(user.assessmentStatus || {}),
      status: 'Completed',
      finalLevel: current.awardedLevel || user.assessmentStatus?.finalLevel || null,
    };
  }
  await user.save({ validateBeforeSave: false });

  return {
    scorePercent: current.scorePercent,
    awardedLevel: current.awardedLevel,
    canProceed: current.canProceed,
  };
};

export const startNextStepService = async (userId, sessionId) => {
  const session = await TestSession.findOne({ _id: sessionId, userId });
  if (!session) {
    const err = new Error('Session not found');
    err.statusCode = 404;
    throw err;
  }
  if (session.status !== 'InProgress') {
    const err = new Error('Session is not in progress');
    err.statusCode = 400;
    throw err;
  }

  const last = getCurrentStep(session);
  if (!last || !last.submittedAt) {
    const err = new Error('Previous step not submitted');
    err.statusCode = 400;
    throw err;
  }
  if (!last.canProceed) {
    const err = new Error('Not eligible to proceed to the next step');
    err.statusCode = 403;
    throw err;
  }

  const nextPair = levelPairForNextStep(last.stepNumber);
  if (!nextPair) {
    const err = new Error('No further steps available');
    err.statusCode = 400;
    throw err;
  }

  const [level1, level2] = nextPair;
  const l1 = await pickRandomActiveQuestions(level1, QUESTIONS_PER_LEVEL);
  const l2 = await pickRandomActiveQuestions(level2, QUESTIONS_PER_LEVEL);
  if (l1.length < QUESTIONS_PER_LEVEL || l2.length < QUESTIONS_PER_LEVEL) {
    const err = new Error(`Insufficient active questions for ${level1}/${level2}`);
    err.statusCode = 500;
    throw err;
  }

  const combined = shuffleArray([...l1, ...l2]);
  const questionIds = combined.map(q => q._id);

  const stepDurationSec = SECONDS_PER_QUESTION * QUESTIONS_PER_STEP;
  const endsAt = new Date(Date.now() + stepDurationSec * 1000);

  session.steps.push({
    stepNumber: last.stepNumber + 1,
    levelPair: nextPair,
    questions: questionIds,
    startedAt: new Date(),
    stepDurationSec,
    totalQuestionsInStep: QUESTIONS_PER_STEP,
  });
  session.currentStepEndsAt = endsAt;

  await session.save();

  const questionsPublic = combined.map(q => ({ _id: q._id, text: q.text, options: q.options }));
  return { sessionId: session._id, endsAt, questions: questionsPublic };
};


