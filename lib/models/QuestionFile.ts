import mongoose, { Schema, Model } from 'mongoose';
import { QuestionFile } from '@/types';

const QuestionFileSchema = new Schema<QuestionFile>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    content: {
      type: String,
      default: '',
    },
    showOnProfile: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const QuestionFileModel: Model<QuestionFile> = mongoose.models.QuestionFile || mongoose.model<QuestionFile>('QuestionFile', QuestionFileSchema);

export default QuestionFileModel;

