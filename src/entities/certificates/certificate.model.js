import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSession', required: true },
    level: { type: String, required: true, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    issuedAt: { type: Date, default: Date.now },
    certificateUID: { type: String, required: true, unique: true },
    pdfUrl: { type: String },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CertificateSchema.index({ certificateUID: 1 }, { unique: true });
CertificateSchema.index({ userId: 1, createdAt: -1 });

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
export default Certificate;


