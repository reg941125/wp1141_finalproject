import mongoose, { Schema, Model } from 'mongoose';
import { JobPosting } from '@/types';

const JobPostingSchema = new Schema<JobPosting>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['seeking_tutor', 'seeking_student'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    educationLevel: {
      type: String,
      enum: ['elementary', 'middle', 'high', 'university'],
      required: true,
    },
    hourlyRate: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
      },
    },
    requirements: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobPostingModel: Model<JobPosting> = mongoose.models.JobPosting || mongoose.model<JobPosting>('JobPosting', JobPostingSchema);

export default JobPostingModel;


