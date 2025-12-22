import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

// GET: 獲取用戶對特定貼文和其答案的按讚狀態
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isPostLiked: false, likedAnswerIds: [] });
    }

    const { searchParams } = new URL(request.url);
    const answerIdsParam = searchParams.get('answerIds');
    const answerIds = answerIdsParam ? answerIdsParam.split(',') : [];

    await dbConnect();

    // 查詢貼文的按讚狀態
    const postLike = await LikeModel.findOne({
      userId: session.user.id,
      targetId: params.id,
      targetType: 'Post',
    });

    // 查詢答案的按讚狀態
    let likedAnswerIds: string[] = [];
    if (answerIds.length > 0) {
      const answerLikes = await LikeModel.find({
        userId: session.user.id,
        targetId: { $in: answerIds },
        targetType: 'Answer',
      }).select('targetId');
      likedAnswerIds = answerLikes.map(like => like.targetId.toString());
    }

    return NextResponse.json({
      isPostLiked: !!postLike,
      likedAnswerIds,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}


