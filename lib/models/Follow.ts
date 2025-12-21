import mongoose, { Schema, Model } from 'mongoose';

export interface Follow {
  _id: string;
  followerId: mongoose.Types.ObjectId; // 追蹤者
  followingId: mongoose.Types.ObjectId; // 被追蹤者
  createdAt: Date;
}

const FollowSchema = new Schema<Follow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// 複合索引：確保同一對用戶只能有一個追蹤關係
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// 索引：快速查詢某用戶的追蹤者和追蹤中的人
FollowSchema.index({ followerId: 1, createdAt: -1 });
FollowSchema.index({ followingId: 1, createdAt: -1 });

const FollowModel: Model<Follow> =
  mongoose.models.Follow || mongoose.model<Follow>('Follow', FollowSchema);

export default FollowModel;

