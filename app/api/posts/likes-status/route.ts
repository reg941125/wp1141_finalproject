import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

// GET: 獲取用戶對多個貼文的按讚狀態
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postIds } = await request.json();
    
    if (!postIds || !Array.isArray(postIds)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await dbConnect();

    // 查詢用戶對這些貼文的按讚記錄
    const likes = await LikeModel.find({
      userId: session.user.id,
      targetId: { $in: postIds },
      targetType: 'Post',
    }).select('targetId');

    // 轉換為 Map 結構，方便前端使用
    const likedPostIds = likes.map(like => like.targetId.toString());
    
    return NextResponse.json({ likedPostIds });
  } catch (error) {
    console.error('Error fetching likes status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes status' },
      { status: 500 }
    );
  }
}

