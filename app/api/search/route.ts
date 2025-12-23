import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PostModel from '@/lib/models/Post';
import JobPostingModel from '@/lib/models/JobPosting';
import QuestionFileModel from '@/lib/models/QuestionFile';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: [],
        jobs: [],
        files: [],
        users: [],
      });
    }

    await dbConnect();

    const searchRegex = new RegExp(query.trim(), 'i');

    // 搜索題目討論區 (排除草稿)
    const posts = await PostModel.find({
      isDraft: { $ne: true },
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
      ],
    })
      .populate('authorId', 'name image customImage username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 搜索家教專區 (排除草稿)
    const jobs = await JobPostingModel.find({
      isDraft: { $ne: true },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { subjects: searchRegex },
      ],
    })
      .populate('authorId', 'name image customImage username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 搜索題目與筆記 (只搜索公開的，排除草稿)
    const files = await QuestionFileModel.find({
      isDraft: { $ne: true },
      isPublic: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ],
    })
      .populate('authorId', 'name image customImage username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 搜索用戶
    const users = await UserModel.find({
      $or: [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ],
    })
      .select('name image customImage username bio')
      .limit(10)
      .lean();

    return NextResponse.json({
      posts,
      jobs,
      files,
      users,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}

