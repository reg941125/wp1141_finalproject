import mongoose, { Schema, Model } from 'mongoose';

export interface Notification {
  _id: string;
  userId: mongoose.Types.ObjectId; // 接收通知的用戶
  type: 'reply' | 'like' | 'follow'; // 通知類型
  postId?: mongoose.Types.ObjectId; // 相關的貼文（follow 類型時為可選）
  triggeredBy: mongoose.Types.ObjectId; // 觸發通知的用戶
  content: string; // 通知內容
  read: boolean; // 是否已讀
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<Notification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['reply', 'like', 'follow'],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: false,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// 複合索引：用於快速查詢用戶的未讀通知
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const NotificationModel: Model<Notification> =
  mongoose.models.Notification || mongoose.model<Notification>('Notification', NotificationSchema);

export default NotificationModel;

