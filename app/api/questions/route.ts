import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuestionFileModel from '@/lib/models/QuestionFile';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const publicOnly = searchParams.get('publicOnly') === 'true';
    const session = await auth();

    const query: any = {};

    // 排除草稿（除非查詢自己的且沒有指定 publicOnly）
    if (!userId || publicOnly) {
      query.isDraft = { $ne: true };
    } else if (userId && session?.user?.id !== userId) {
      // 查詢其他用戶的，排除草稿
      query.isDraft = { $ne: true };
    }

    // 如果指定了 userId
    if (userId) {
      query.authorId = userId;
      // 如果要求只顯示公開的
      if (publicOnly) {
        query.isPublic = true;
      }
    } else {
      // 如果沒有指定用戶，只顯示公開的
      query.isPublic = true;
    }

    // 篩選條件
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = { $in: [tag] };

    // 搜尋（名稱或描述）
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const files = await QuestionFileModel.find(query)
      .populate('authorId', 'name image customImage')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching question files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question files' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const {
      name,
      description,
      fileUrl,
      content,
      showOnProfile,
      subject,
      difficulty,
      tags,
      isPublic,
    } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const file = await QuestionFileModel.create({
      authorId: session.user.id,
      name,
      description,
      fileUrl: fileUrl || '',
      content: content || '',
      showOnProfile: showOnProfile || false,
      subject: subject || '其他',
      difficulty: difficulty || '中等',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Error creating question file:', error);
    return NextResponse.json(
      { error: 'Failed to create question file' },
      { status: 500 }
    );
  }
}

