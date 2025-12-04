import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversationModel from '@/lib/models/Conversation';
import MessageModel from '@/lib/models/Message';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const conversations = await ConversationModel.find({
      participants: session.user.id,
    })
      .populate('participants', 'name image username')
      .populate('lastMessageBy', 'name image username')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otherUserId } = await request.json();
    if (!otherUserId || otherUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Invalid other user ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Sort participants to ensure consistent ordering
    const participants = [session.user.id, otherUserId].sort();

    // Check if conversation already exists
    const existingConversation = await ConversationModel.findOne({
      participants: { $all: participants, $size: 2 },
    })
      .populate('participants', 'name image username');

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await ConversationModel.create({
      participants,
    });

    const populatedConversation = await ConversationModel.findById(
      conversation._id
    ).populate('participants', 'name image username');

    return NextResponse.json(populatedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

