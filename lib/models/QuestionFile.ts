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
    subject: {
      type: String,
      enum: ['數學', '物理', '化學', '生物', '國文', '英文', '歷史', '地理', '公民', '其他'],
      default: '其他',
    },
    difficulty: {
      type: String,
      enum: ['簡單', '中等', '困難'],
      default: '中等',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true, // 預設公開，其他用戶可以瀏覽和下載
    },
  },
  {
    timestamps: true,
  }
);

const QuestionFileModel: Model<QuestionFile> = mongoose.models.QuestionFile || mongoose.model<QuestionFile>('QuestionFile', QuestionFileSchema);

export default QuestionFileModel;




