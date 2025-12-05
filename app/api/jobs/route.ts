import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import JobPostingModel from '@/lib/models/JobPosting';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const educationLevel = searchParams.get('educationLevel');
    const hourlyRateMin = searchParams.get('hourlyRateMin');
    const hourlyRateMax = searchParams.get('hourlyRateMax');
    const userId = searchParams.get('userId');

    const query: any = { isActive: true };

    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (educationLevel) query.targetEducationLevels = { $in: [educationLevel] }; // Use $in for array matching
    if (userId) query.authorId = userId;
    if (hourlyRateMin) {
      query['hourlyRate.min'] = { $gte: parseInt(hourlyRateMin) };
    }
    if (hourlyRateMax) {
      query.$or = [
        { 'hourlyRate.max': { $lte: parseInt(hourlyRateMax) } },
        { 'hourlyRate.max': { $exists: false }, 'hourlyRate.min': { $lte: parseInt(hourlyRateMax) } },
      ];
    }

    const postings = await JobPostingModel.find(query)
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(postings);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
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
    const data = await request.json();

    // Remove description from data if present, since we no longer use it
    const { description, ...postingData } = data;

    const posting = await JobPostingModel.create({
      authorId: session.user.id,
      description: '', // Set to empty string for backward compatibility
      ...postingData,
    });

    return NextResponse.json(posting, { status: 201 });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}

