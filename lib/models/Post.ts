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
    level: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
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
    toJSON: {
      transform: function(doc, ret) {
        // 确保 level 和 subject 字段总是被包含
        if (ret.level === undefined) ret.level = '';
        if (ret.subject === undefined) ret.subject = '';
        return ret;
      }
    }
  }
);

const PostModel: Model<Post> = mongoose.models.Post || mongoose.model<Post>('Post', PostSchema);

export default PostModel;





