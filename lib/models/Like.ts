import mongoose, { Schema, Model } from 'mongoose';

export interface Like {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId; // 可以是 Post 或 Answer 的 ID
  targetType: 'Post' | 'Answer';
  createdAt: Date;
}

const LikeSchema = new Schema<Like>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    targetType: {
      type: String,
      enum: ['Post', 'Answer'],
      required: true,
    },
  },
  { timestamps: true }
);

// 確保每個用戶對每個目標只能按一次讚
LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
// 優化查詢
LikeSchema.index({ targetId: 1, targetType: 1 });
LikeSchema.index({ userId: 1 });

const LikeModel: Model<Like> =
  mongoose.models.Like || mongoose.model<Like>('Like', LikeSchema);

export default LikeModel;

