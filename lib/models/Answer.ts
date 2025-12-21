import mongoose, { Schema, Model } from 'mongoose';
import { Answer } from '@/types';

const AnswerSchema = new Schema<Answer>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AnswerModel: Model<Answer> = mongoose.models.Answer || mongoose.model<Answer>('Answer', AnswerSchema);

export default AnswerModel;




