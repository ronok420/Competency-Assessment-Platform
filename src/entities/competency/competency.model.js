import mongoose from 'mongoose';

const CompetencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
CompetencySchema.index({ name: 1 }, { unique: true });
CompetencySchema.index({ code: 1 }, { unique: true });

const Competency = mongoose.models.Competency || mongoose.model('Competency', CompetencySchema);
export default Competency;


