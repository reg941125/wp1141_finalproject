import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FollowModel from '@/lib/models/Follow';

export const dynamic = 'force-dynamic';

// 獲取追蹤者數量和追蹤中數量，或者詳細列表
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const list = searchParams.get('list'); // 'followers' 或 'following'

    if (list === 'followers') {
      // 返回追蹤者列表
      const followers = await FollowModel.find({ followingId: params.id })
        .populate('followerId', 'name image customImage username _id')
        .sort({ createdAt: -1 })
        .lean();
      
      return NextResponse.json({
        users: followers.map(f => f.followerId).filter(u => u != null)
      });
    } else if (list === 'following') {
      // 返回正在追蹤的用戶列表
      const following = await FollowModel.find({ followerId: params.id })
        .populate('followingId', 'name image customImage username _id')
        .sort({ createdAt: -1 })
        .lean();
      
      return NextResponse.json({
        users: following.map(f => f.followingId).filter(u => u != null)
      });
    } else {
      // 返回數量
      const [followersCount, followingCount] = await Promise.all([
        FollowModel.countDocuments({ followingId: params.id }),
        FollowModel.countDocuments({ followerId: params.id }),
      ]);

      return NextResponse.json({
        followersCount,
        followingCount,
      });
    }
  } catch (error) {
    console.error('Error fetching follow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow data' },
      { status: 500 }
    );
  }
}

