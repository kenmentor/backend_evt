import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  NIN?: number;
  lastLogin: Date;
  verifiedEmail: boolean;
  verifiedNIN: boolean;
  adminVerified: boolean;
  role: string;
  rank: number;
  verificationCompleted: boolean;
  socialMedai?: string[];
  profileImage?: string;
  pioneer?: boolean;
  forgottonPasswordToken?: string;
  forgottonPasswordTokenExpireAt?: Date;
  verifyToken?: string;
  verificationTokenExpireAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      require: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    NIN: {
      type: Number,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    verifiedNIN: {
      type: Boolean,
      default: false,
    },
    adminVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      default: "USER",
    },
    rank: {
      type: Number,
      default: 1,
    },
    verificationCompleted: {
      type: Boolean,
      default: false,
    },
    socialMedai: {
      type: [String],
    },
    profileImage: {
      type: String,
    },
    pioneer: Boolean,

    forgottonPasswordToken: String,
    forgottonPasswordTokenExpireAt: Date,
    verifyToken: String,
    verificationTokenExpireAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("user", userSchema);
export default User;
