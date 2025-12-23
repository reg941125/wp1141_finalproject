import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import PostModel from '@/lib/models/Post';

export const dynamic = 'force-dynamic';

// 獲取當前用戶的所有草稿
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    // 如果指定了 id，返回單個草稿
    if (draftId) {
      const draft = await PostModel.findOne({
        _id: draftId,
        authorId: session.user.id,
        isDraft: true,
      });

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      return NextResponse.json({ draft });
    }

    // 否則返回所有草稿
    const drafts = await PostModel.find({
      authorId: session.user.id,
      isDraft: true,
    })
      .sort({ updatedAt: -1 })
      .limit(50); // 限制最多 50 個草稿

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// 保存或更新草稿
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      draftId, // 可選：如果提供，則更新該草稿
      title,
      content,
      tags,
      level,
      subject,
    } = body;

    const draftData = {
      authorId: session.user.id,
      title: title || '未命名草稿',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      level: level || '',
      subject: subject || '',
      isDraft: true,
    };

    let draft;
    if (draftId) {
      // 更新指定草稿
      const existingDraft = await PostModel.findOne({
        _id: draftId,
        authorId: session.user.id,
        isDraft: true,
      });

      if (!existingDraft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      draft = await PostModel.findByIdAndUpdate(
        draftId,
        draftData,
        { new: true }
      );
    } else {
      // 創建新草稿
      draft = await PostModel.create(draftData);
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// 刪除草稿
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (draftId) {
      // 刪除指定草稿
      const draft = await PostModel.findOne({
        _id: draftId,
        authorId: session.user.id,
        isDraft: true,
      });

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      await PostModel.findByIdAndDelete(draftId);
    } else {
      // 刪除所有草稿
      await PostModel.deleteMany({
        authorId: session.user.id,
        isDraft: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}

