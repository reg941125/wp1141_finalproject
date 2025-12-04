import mongoose, { Schema, Model } from 'mongoose';
import { Post } from '@/types';

const PostSchema = new Schema<Post>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
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

const PostModel: Model<Post> = mongoose.models.Post || mongoose.model<Post>('Post', PostSchema);

export default PostModel;


