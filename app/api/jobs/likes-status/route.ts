import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ likedPostingIds: [] });
    }

    await dbConnect();
    const { postingIds } = await request.json();

    if (!postingIds || !Array.isArray(postingIds) || postingIds.length === 0) {
      return NextResponse.json({ likedPostingIds: [] });
    }

    const likes = await LikeModel.find({
      userId: session.user.id,
      targetId: { $in: postingIds },
      targetType: 'JobPosting',
    }).select('targetId');

    const likedPostingIds = likes.map((like) => like.targetId.toString());

    return NextResponse.json({ likedPostingIds });
  } catch (error) {
    console.error('Error fetching like statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like statuses' },
      { status: 500 }
    );
  }
}

