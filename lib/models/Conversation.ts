import mongoose, { Schema, Model } from 'mongoose';
import { Conversation } from '@/types';

const ConversationSchema = new Schema<Conversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    lastMessageBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Ensure unique conversation between two users (sorted to avoid duplicates)
ConversationSchema.pre('save', function (next) {
  if (this.isNew && this.participants.length === 2) {
    // Sort participants to ensure consistent ordering
    this.participants.sort();
  }
  next();
});

const ConversationModel: Model<Conversation> =
  mongoose.models.Conversation || mongoose.model<Conversation>('Conversation', ConversationSchema);

export default ConversationModel;

