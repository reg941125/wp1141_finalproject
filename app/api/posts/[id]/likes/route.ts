import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

// 获取某个贴文的所有点赞用户列表
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const likes = await LikeModel.find({
      targetId: params.id,
      targetType: 'Post'
    })
      .populate('userId', 'name image customImage username _id')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users: likes.map(like => like.userId).filter(u => u != null)
    });
  } catch (error) {
    console.error('Error fetching post likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

