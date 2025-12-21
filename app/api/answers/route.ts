import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AnswerModel from '@/lib/models/Answer';
import PostModel from '@/lib/models/Post';
import NotificationModel from '@/lib/models/Notification';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const answers = await AnswerModel.find({ postId })
      .populate('authorId', 'name image _id')
      .sort({ createdAt: -1 })
      .lean();

    // 統計每個答案的按讚數量
    const answerIds = answers.map(answer => answer._id);
    const likeCounts = await LikeModel.aggregate([
      { 
        $match: { 
          targetId: { $in: answerIds },
          targetType: 'Answer'
        } 
      },
      { $group: { _id: '$targetId', count: { $sum: 1 } } },
    ]);
    const likeCountMap = likeCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const answersWithLikes = answers.map(answer => ({
      ...answer,
      likes: likeCountMap[answer._id.toString()] || 0,
    }));

    return NextResponse.json(answersWithLikes);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
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
    const { postId, content, images } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postId and content are required' },
        { status: 400 }
      );
    }

    const answer = await AnswerModel.create({
      postId,
      authorId: session.user.id,
      content,
      images: images || [],
    });

    // 創建通知給貼文作者
    try {
      const post = await PostModel.findById(postId).select('authorId title');
      if (post && post.authorId.toString() !== session.user.id) {
        // 只在回覆他人的貼文時創建通知
        await NotificationModel.create({
          recipientId: post.authorId,
          senderId: session.user.id,
          type: 'reply',
          postId: post._id,
        });
      }
    } catch (notifError) {
      // 通知創建失敗不應該影響回覆的創建
      console.error('Error creating notification:', notifError);
    }

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
}

