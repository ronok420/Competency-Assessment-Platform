import mongoose from 'mongoose';

const StepResultSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true, enum: [1, 2, 3] },
    levelPair: { type: [String], required: true }, // e.g., ['A1','A2']
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [
      {
        _id: false,
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        chosenKey: { type: String },
      },
    ],
    scorePercent: { type: Number, default: 0 },
    awardedLevel: { type: String },
    canProceed: { type: Boolean, default: false },
    stepDurationSec: { type: Number, default: 0 },
    totalQuestionsInStep: { type: Number, default: 0 },
    startedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const TestSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['InProgress', 'Completed', 'Failed', 'Expired'] },
    currentStepEndsAt: { type: Date },
    steps: [StepResultSchema],
    finalCertificationLevel: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
TestSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 });
// Prevent multiple simultaneous sessions for a user
// Note: partialFilterExpression requires creating via Mongo directly or ensureIndex
TestSessionSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'InProgress' } }
);

const TestSession = mongoose.models.TestSession || mongoose.model('TestSession', TestSessionSchema);
export default TestSession;


