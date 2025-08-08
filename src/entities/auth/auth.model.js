import RoleType from '../../lib/types.js';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { accessTokenExpires, accessTokenSecrete, refreshTokenExpires, refreshTokenSecrete } from '../../core/config/config.js';
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
  
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;