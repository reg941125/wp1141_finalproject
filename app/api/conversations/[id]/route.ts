import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversationModel from '@/lib/models/Conversation';

export const dynamic = 'force-dynamic';

// GET: 獲取單個對話（不管是否有消息）
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

    // 獲取對話，但不過濾 lastMessageAt
    const conversation = await ConversationModel.findById(params.id)
      .populate('participants', 'name image username')
      .populate('lastMessageBy', 'name image username');

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 驗證用戶是否是對話參與者
    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}


