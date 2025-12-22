import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FollowModel from '@/lib/models/Follow';
import NotificationModel from '@/lib/models/Notification';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// 追蹤用戶
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 不能追蹤自己
    if (session.user.id === params.id) {
      return NextResponse.json({ error: '無法追蹤自己' }, { status: 400 });
    }

    await dbConnect();

    // 檢查是否已經追蹤
    const existingFollow = await FollowModel.findOne({
      followerId: session.user.id,
      followingId: params.id,
    });

    if (existingFollow) {
      return NextResponse.json({ error: '已經追蹤此用戶' }, { status: 400 });
    }

    // 創建追蹤關係
    await FollowModel.create({
      followerId: session.user.id,
      followingId: params.id,
    });

    // 獲取追蹤者的名字
    const follower = await UserModel.findById(session.user.id).select('name');
    const followerName = follower?.name || '某人';

    // 創建追蹤通知
    await NotificationModel.create({
      userId: params.id, // 被追蹤的人收到通知
      type: 'follow',
      triggeredBy: session.user.id, // 追蹤者
      content: '開始追蹤你',
      read: false,
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: '追蹤失敗' }, { status: 500 });
  }
}

// 取消追蹤
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    await dbConnect();

    // 刪除追蹤關係
    await FollowModel.deleteOne({
      followerId: session.user.id,
      followingId: params.id,
    });

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: '取消追蹤失敗' }, { status: 500 });
  }
}

// 檢查是否追蹤某用戶
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ following: false });
    }

    await dbConnect();

    const follow = await FollowModel.findOne({
      followerId: session.user.id,
      followingId: params.id,
    });

    return NextResponse.json({ following: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ following: false });
  }
}

