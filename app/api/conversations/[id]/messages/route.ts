import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversationModel from '@/lib/models/Conversation';
import MessageModel from '@/lib/models/Message';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify user is part of conversation
    const conversation = await ConversationModel.findById(params.id);
    if (
      !conversation ||
      !conversation.participants.includes(session.user.id as any)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await MessageModel.find({
      conversationId: params.id,
    })
      .populate('senderId', 'name image username')
      .sort({ createdAt: 1 });

    // Mark messages as read
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);
    await MessageModel.updateMany(
      {
        conversationId: params.id,
        senderId: { $ne: userObjectId },
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify user is part of conversation
    const conversation = await ConversationModel.findById(params.id);
    if (
      !conversation ||
      !conversation.participants.includes(session.user.id as any)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const message = await MessageModel.create({
      conversationId: params.id,
      senderId: session.user.id,
      content: content.trim(),
    });

    // Update conversation last message
    await ConversationModel.findByIdAndUpdate(params.id, {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
      lastMessageBy: session.user.id,
    });

    const populatedMessage = await MessageModel.findById(message._id).populate(
      'senderId',
      'name image username'
    );

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

