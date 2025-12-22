import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';
import JobPostingModel from '@/lib/models/JobPosting';
import NotificationModel from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // 檢查貼文是否存在
    const posting = await JobPostingModel.findById(params.id);
    if (!posting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    // 檢查是否已經按過讚
    const existingLike = await LikeModel.findOne({
      userId: session.user.id,
      targetId: params.id,
      targetType: 'JobPosting',
    });

    let liked: boolean;

    if (existingLike) {
      // 取消按讚
      await LikeModel.deleteOne({ _id: existingLike._id });
      liked = false;
    } else {
      // 按讚
      await LikeModel.create({
        userId: session.user.id,
        targetId: params.id,
        targetType: 'JobPosting',
      });
      liked = true;

      // 如果不是自己的貼文，創建通知
      if (posting.authorId.toString() !== session.user.id) {
        await NotificationModel.create({
          userId: posting.authorId,
          type: 'like',
          postId: params.id,
          triggeredBy: session.user.id,
          content: '按讚了你的徵人訊息',
        });
      }
    }

    // 重新計算按讚數量
    const likeCount = await LikeModel.countDocuments({
      targetId: params.id,
      targetType: 'JobPosting',
    });

    return NextResponse.json({ liked, likes: likeCount });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false });
    }

    await dbConnect();

    const like = await LikeModel.findOne({
      userId: session.user.id,
      targetId: params.id,
      targetType: 'JobPosting',
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}


