import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // Try to find by _id first, then by username
    let user = await UserModel.findById(params.id).select('-password');
    
    if (!user) {
      user = await UserModel.findOne({ username: params.id }).select('-password');
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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

    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { bio, teachingExperience, username, image, customImage, bannerImage, educationLevel } = await request.json();

    // Check username uniqueness if provided
    if (username) {
      const existingUser = await UserModel.findOne({
        username: username.toLowerCase(),
        _id: { $ne: params.id },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
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
    }

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (teachingExperience !== undefined) updateData.teachingExperience = teachingExperience;
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (image !== undefined) updateData.image = image;
    if (customImage !== undefined) updateData.customImage = customImage;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    if (educationLevel !== undefined) updateData.educationLevel = educationLevel || null;

    const user = await UserModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

