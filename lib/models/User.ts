import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types';

const UserSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    image: {
      type: String,
    },
    customImage: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    password: {
      type: String,
    },
    bio: {
      type: String,
    },
    teachingExperience: {
      type: String,
    },
    educationLevel: {
      type: String,
      enum: ['elementary', 'middle', 'high', 'university', 'graduate', 'other'],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;

