import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

// GET: 獲取某個用戶按過讚的所有貼文
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // 查詢此用戶按過讚的所有貼文
    const likes = await LikeModel.find({
      userId: params.id,
      targetType: 'Post',
    })
      .populate({
        path: 'targetId',
        select: 'title content tags level subject authorId createdAt views',
        populate: {
          path: 'authorId',
          select: 'name image',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const likedPosts = likes
      .filter(like => like.targetId) // 過濾掉已刪除的貼文
      .map(like => ({
        post: like.targetId,
        likedAt: like.createdAt,
      }));

    return NextResponse.json({
      userId: params.id,
      totalLikedPosts: likedPosts.length,
      likedPosts,
    });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liked posts' },
      { status: 500 }
    );
  }
}

