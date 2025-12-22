import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AnswerModel from '@/lib/models/Answer';
import NotificationModel from '@/lib/models/Notification';
import LikeModel from '@/lib/models/Like';

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
    
    const answer = await AnswerModel.findById(params.id);
    
    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // 檢查是否已經按過讚
    const existingLike = await LikeModel.findOne({
      userId: session.user.id,
      targetId: params.id,
      targetType: 'Answer',
    });

    let isLiked: boolean;

    if (existingLike) {
      // 已按讚，執行取消按讚
      await LikeModel.deleteOne({ _id: existingLike._id });
      isLiked = false;
    } else {
      // 未按讚，執行按讚
      await LikeModel.create({
        userId: session.user.id,
        targetId: params.id,
        targetType: 'Answer',
      });
      isLiked = true;

      // 創建通知給回答作者（如果不是自己按讚）
      if (answer.authorId.toString() !== session.user.id) {
        try {
          // 檢查是否已經有相同的通知存在（避免重複通知）
          const existingNotification = await NotificationModel.findOne({
            userId: answer.authorId,
            triggeredBy: session.user.id,
            type: 'like',
            postId: answer.postId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小時內
          });

          if (!existingNotification) {
            await NotificationModel.create({
              userId: answer.authorId,
              triggeredBy: session.user.id,
              type: 'like',
              postId: answer.postId,
              content: '有人按讚了你的回答',
            });
          }
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }
    }

    // 統計實際的按讚數量
    const likeCount = await LikeModel.countDocuments({
      targetId: params.id,
      targetType: 'Answer',
    });

    return NextResponse.json({ 
      likes: likeCount,
      isLiked: isLiked,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

