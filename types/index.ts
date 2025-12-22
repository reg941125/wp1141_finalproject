import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  username?: string;
  image?: string;
  customImage?: string;
  bannerImage?: string;
  password?: string;
  bio?: string;
  teachingExperience?: string;
  educationLevel?: 'elementary' | 'middle' | 'high' | 'university' | 'graduate' | 'other';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  level?: string;
  subject?: string;
  answersCount?: number;
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
  targetEducationLevels: ('elementary' | 'middle' | 'high' | 'university')[];
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
  subject: '數學' | '物理' | '化學' | '生物' | '國文' | '英文' | '歷史' | '地理' | '公民' | '其他';
  difficulty: '簡單' | '中等' | '困難';
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

