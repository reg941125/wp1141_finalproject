import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuestionFileModel from '@/lib/models/QuestionFile';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query = userId ? { authorId: userId } : {};
    const files = await QuestionFileModel.find(query)
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching question files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question files' },
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

    await dbConnect();
    const { name, description, fileUrl, showOnProfile } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const file = await QuestionFileModel.create({
      authorId: session.user.id,
      name,
      description,
      fileUrl,
      showOnProfile: showOnProfile || false,
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Error creating question file:', error);
    return NextResponse.json(
      { error: 'Failed to create question file' },
      { status: 500 }
    );
  }
}

