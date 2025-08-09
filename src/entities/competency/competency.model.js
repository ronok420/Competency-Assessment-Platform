import mongoose from 'mongoose';

const CompetencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    code: { type: String, unique: true, uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const generateUniqueCode = async () => {
  let uniqueCode;
  let isUnique = false;
  while (!isUnique) {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    uniqueCode = `CMP-${randomPart}`;
    const existing = await mongoose.models.Competency?.findOne({ code: uniqueCode });
    if (!existing) isUnique = true;
  }
  return uniqueCode;
};


CompetencySchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.code) {
      this.code = await generateUniqueCode();
    } else if (this.isNew && this.code) {
      const existing = await mongoose.models.Competency?.findOne({ code: this.code });
      if (existing) return next(new Error('Competency code already exists'));
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Indexes
CompetencySchema.index({ name: 1 }, { unique: true });
CompetencySchema.index({ code: 1 }, { unique: true });

const Competency = mongoose.models.Competency || mongoose.model('Competency', CompetencySchema);
export default Competency;


