import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FollowModel from '@/lib/models/Follow';

export const dynamic = 'force-dynamic';

// 獲取追蹤者數量和追蹤中數量
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const [followersCount, followingCount] = await Promise.all([
      // 追蹤者數量（有多少人追蹤這個用戶）
      FollowModel.countDocuments({ followingId: params.id }),
      // 追蹤中數量（這個用戶追蹤了多少人）
      FollowModel.countDocuments({ followerId: params.id }),
    ]);

    return NextResponse.json({
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error('Error fetching follow counts:', error);
    return NextResponse.json(
      { followersCount: 0, followingCount: 0 },
      { status: 500 }
    );
  }
}

