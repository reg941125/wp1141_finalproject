import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PostModel from '@/lib/models/Post';
import NotificationModel from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const post = await PostModel.findById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 增加讚數
    post.likes = (post.likes || 0) + 1;
    await post.save();

    // 創建通知給貼文作者（如果不是自己按讚）
    if (post.authorId.toString() !== session.user.id) {
      try {
        // 檢查是否已經有相同的通知存在（避免重複通知）
        const existingNotification = await NotificationModel.findOne({
          userId: post.authorId,
          type: 'like',
          postId: post._id,
          triggeredBy: session.user.id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小時內
        });

        if (!existingNotification) {
          await NotificationModel.create({
            userId: post.authorId,
            type: 'like',
            postId: post._id,
            triggeredBy: session.user.id,
            content: `讚賞了你的貼文「${post.title?.substring(0, 20) || '無標題'}${post.title && post.title.length > 20 ? '...' : ''}」`,
            read: false,
          });
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

