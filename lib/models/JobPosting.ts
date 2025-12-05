import mongoose, { Schema, Model } from 'mongoose';
import { JobPosting } from '@/types';

const JobPostingSchema = new Schema(
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
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    targetEducationLevels: {
      type: [String],
      enum: ['elementary', 'middle', 'high', 'university'],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: '至少需要選擇一個目標教育程度',
      },
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


