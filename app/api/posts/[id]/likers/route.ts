import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

// GET: 獲取按讚此貼文的所有用戶
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // 查詢所有按讚此貼文的用戶
    const likes = await LikeModel.find({
      targetId: params.id,
      targetType: 'Post',
    })
      .populate('userId', 'name image username')
      .sort({ createdAt: -1 })
      .lean();

    const likers = likes.map(like => ({
      userId: like.userId,
      likedAt: like.createdAt,
    }));

    return NextResponse.json({
      postId: params.id,
      totalLikes: likers.length,
      likers,
    });
  } catch (error) {
    console.error('Error fetching likers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likers' },
      { status: 500 }
    );
  }
}

