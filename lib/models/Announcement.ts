import mongoose, { Schema, Model } from 'mongoose';
import { Announcement } from '@/types';

const AnnouncementSchema = new Schema<Announcement>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AnnouncementModel: Model<Announcement> =
  mongoose.models.Announcement || mongoose.model<Announcement>('Announcement', AnnouncementSchema);

export default AnnouncementModel;

