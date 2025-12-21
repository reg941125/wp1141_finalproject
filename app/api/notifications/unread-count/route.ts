import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import NotificationModel from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    await dbConnect();

    const count = await NotificationModel.countDocuments({
      userId: session.user.id,
      read: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return NextResponse.json({ count: 0 });
  }
}

