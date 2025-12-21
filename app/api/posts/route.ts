import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PostModel from '@/lib/models/Post';
import AnswerModel from '@/lib/models/Answer';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const level = searchParams.get('level');
    const subject = searchParams.get('subject');

    const query: Record<string, any> = {};
    if (tag) query.tags = tag;
    if (level) query.level = { $regex: level, $options: 'i' };
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    const posts = await PostModel.find(query)
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const postIds = posts.map((post) => post._id);
    const answerCounts = await AnswerModel.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const countMap = answerCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const postsWithCounts = posts.map((post) => ({
      ...post,
      answersCount: countMap[post._id.toString()] || 0,
    }));

    return NextResponse.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
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
    const { title, content, tags, level, subject } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const post = await PostModel.create({
      authorId: session.user.id,
      title,
      content,
      tags: tags || [],
      level: level || '',
      subject: subject || '',
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

