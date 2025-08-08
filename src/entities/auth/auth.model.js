import RoleType from '../../lib/types.js';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { accessTokenExpires, accessTokenSecrete, refreshTokenExpires, refreshTokenSecrete } from '../../core/config/config.js';
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
  
    dob: { type: Date, default: null },
    role: {
      type: String,
      default: RoleType.USER,
      enum: [RoleType.USER, RoleType.ADMIN, RoleType.SUPERVISOR],
    },
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    multiProfileImage: { type: [String], default: [] },
    pdfFile: { type: String, default: '' },
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: ''
    },
    // --- NEW FIELD ADDED ---
    // This object tracks the user's overall assessment state permanently.
    assessmentStatus: {
      // 'NotStarted', 'InProgress', 'Failed', 'Completed'
      status: { type: String, default: 'NotStarted', required: true },
      // Stores the highest level achieved, e.g., 'A1', 'B2', 'C2'
      finalLevel: { type: String, default: null },
      // Reference to the certificate if one was issued
      certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null },
    }
     
  },
  { timestamps: true }
);


// Hashing password
UserSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(this.password, 10);

  this.password = hashedPassword;
  next();
});

// Password comparison method (bcrypt)
UserSchema.methods.comparePassword = async function (id, plainPassword) {
  const { password: hashedPassword } = await User.findById(id).select('password')

  const isMatched = await bcrypt.compare(plainPassword, hashedPassword)

  return isMatched
}

// Generate ACCESS_TOKEN
UserSchema.methods.generateAccessToken = function (payload) {
  return jwt.sign(payload, accessTokenSecrete, { expiresIn: accessTokenExpires });
};

// Generate REFRESH_TOKEN
UserSchema.methods.generateRefreshToken = function (payload) {
  return jwt.sign(payload, refreshTokenSecrete, { expiresIn: refreshTokenExpires });
};

// Index for faster gating/filtering by assessment status
UserSchema.index({ 'assessmentStatus.status': 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;