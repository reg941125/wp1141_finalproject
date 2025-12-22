import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import NotificationModel from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

// 獲取用戶的通知
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: any = { userId: session.user.id };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await NotificationModel.find(query)
      .populate('triggeredBy', 'name image customImage')
      .populate('postId', 'title')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: '獲取通知失敗' },
      { status: 500 }
    );
  }
}

// 標記通知為已讀
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { notificationIds } = await request.json();

    await dbConnect();

    if (notificationIds && Array.isArray(notificationIds)) {
      // 標記特定通知為已讀
      await NotificationModel.updateMany(
        {
          _id: { $in: notificationIds },
          userId: session.user.id,
        },
        { $set: { read: true } }
      );
    } else {
      // 標記所有通知為已讀
      await NotificationModel.updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: '更新通知狀態失敗' },
      { status: 500 }
    );
  }
}

// 刪除通知
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    await dbConnect();

    if (notificationId) {
      // 刪除特定通知
      await NotificationModel.deleteOne({
        _id: notificationId,
        userId: session.user.id,
      });
    } else {
      // 刪除所有已讀通知
      await NotificationModel.deleteMany({
        userId: session.user.id,
        read: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: '刪除通知失敗' },
      { status: 500 }
    );
  }
}

