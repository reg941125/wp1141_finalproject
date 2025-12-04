import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversationModel from '@/lib/models/Conversation';
import MessageModel from '@/lib/models/Message';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all conversations for the user
    const conversations = await ConversationModel.find({
      participants: session.user.id,
    }).select('_id');

    const conversationIds = conversations.map((c) => c._id);
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Count unread messages (messages not sent by current user and not read)
    const unreadCount = await MessageModel.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userObjectId },
      read: false,
    });

    // Get unread count per conversation
    const unreadByConversation = await MessageModel.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          senderId: { $ne: userObjectId },
          read: false,
        },
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap: Record<string, number> = {};
    unreadByConversation.forEach((item) => {
      unreadMap[item._id.toString()] = item.count;
    });

    return NextResponse.json({
      total: unreadCount,
      byConversation: unreadMap,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

