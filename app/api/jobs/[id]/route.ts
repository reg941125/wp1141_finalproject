import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import JobPostingModel from '@/lib/models/JobPosting';
import LikeModel from '@/lib/models/Like';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const posting = await JobPostingModel.findById(params.id).populate('authorId', 'name image _id').lean();

    if (!posting) {
      return NextResponse.json({ error: 'Posting not found' }, { status: 404 });
    }

    // 統計按讚數量
    const likeCount = await LikeModel.countDocuments({
      targetId: params.id,
      targetType: 'JobPosting',
    });

    return NextResponse.json({
      ...posting,
      likes: likeCount,
    });
  } catch (error) {
    console.error('Error fetching posting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const posting = await JobPostingModel.findById(params.id);

    if (!posting) {
      return NextResponse.json({ error: 'Posting not found' }, { status: 404 });
    }

    if (posting.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    Object.assign(posting, updates);
    await posting.save();

    return NextResponse.json(posting);
  } catch (error) {
    console.error('Error updating posting:', error);
    return NextResponse.json(
      { error: 'Failed to update posting' },
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
    const posting = await JobPostingModel.findById(params.id);

    if (!posting) {
      return NextResponse.json({ error: 'Posting not found' }, { status: 404 });
    }

    if (posting.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    posting.isActive = false;
    await posting.save();

    return NextResponse.json({ message: 'Posting deleted' });
  } catch (error) {
    console.error('Error deleting posting:', error);
    return NextResponse.json(
      { error: 'Failed to delete posting' },
      { status: 500 }
    );
  }
}

