import mongoose, { Schema, Model } from 'mongoose';
import { Message } from '@/types';

const MessageSchema = new Schema<Message>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
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
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const MessageModel: Model<Message> =
  mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;



