import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  username?: string;
  image?: string;
  bannerImage?: string;
  password?: string;
  bio?: string;
  teachingExperience?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
}

export interface Answer {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
}

export interface JobPosting {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  type: 'seeking_tutor' | 'seeking_student';
  title: string;
  description: string;
  tags: string[];
  educationLevel: 'elementary' | 'middle' | 'high' | 'university';
  hourlyRate: {
    min: number;
    max?: number;
  };
  requirements: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuestionFile {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  name: string;
  description: string;
  fileUrl?: string;
  content: string;
  showOnProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

