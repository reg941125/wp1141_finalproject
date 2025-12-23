import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { username, userId } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if username exists (excluding current user)
    const query: any = { username: username.toLowerCase() };
    if (userId) {
      query._id = { $ne: userId };
    }

    const existingUser = await UserModel.findOne(query);

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    );
  }
}





