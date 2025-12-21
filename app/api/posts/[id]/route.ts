import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PostModel from '@/lib/models/Post';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const post = await PostModel.findById(params.id).populate('authorId', 'name image _id').lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 統計按讚數量
    const likeCount = await LikeModel.countDocuments({
      targetId: params.id,
      targetType: 'Post',
    });

    return NextResponse.json({
      ...post,
      likes: likeCount,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const post = await PostModel.findById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updates = await request.json();
    // Views can be updated by anyone (for view counting)
    if (updates.views !== undefined) {
      post.views = updates.views;
    }
    
    // Other fields require authentication and ownership
    if (updates.title !== undefined || updates.content !== undefined || updates.tags !== undefined || updates.level !== undefined) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (post.authorId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (updates.title !== undefined) post.title = updates.title;
      if (updates.content !== undefined) post.content = updates.content;
      if (updates.tags !== undefined) post.tags = updates.tags;
      if (updates.level !== undefined) post.level = updates.level;
    }
    
    await post.save();
    
    // 重新查询确保获取最新数据，並統計按讚數量
    const updatedPost = await PostModel.findById(params.id).populate('authorId', 'name image _id').lean();
    
    const likeCount = await LikeModel.countDocuments({
      targetId: params.id,
      targetType: 'Post',
    });
    
    return NextResponse.json({
      ...updatedPost,
      likes: likeCount,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await PostModel.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

