import mongoose from 'mongoose';

const QuestionOptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    competencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competency', required: true },
    level: {
      type: String,
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    text: { type: String, required: true, trim: true },
    options: { type: [QuestionOptionSchema], validate: v => Array.isArray(v) && v.length >= 2 },
    correctOptionKey: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Helpful indexes
QuestionSchema.index({ level: 1, isActive: 1 });
QuestionSchema.index({ competencyId: 1, level: 1, isActive: 1 });

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export default Question;


