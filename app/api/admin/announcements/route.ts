import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import AnnouncementModel from '@/lib/models/Announcement';

export const dynamic = 'force-dynamic';

// 檢查 admin 權限的中間件
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession?.value === 'authenticated';
}

// 獲取所有公告
export async function GET() {
  try {
    await dbConnect();
    const announcements = await AnnouncementModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 創建公告（需要 admin 權限）
export async function POST(request: Request) {
  try {
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '請填寫標題和內容' },
        { status: 400 }
      );
    }

    await dbConnect();
    const announcement = await AnnouncementModel.create({
      title,
      content,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 刪除公告（需要 admin 權限）
export async function DELETE(request: Request) {
  try {
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const { announcementId } = await request.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: '請提供公告 ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    await AnnouncementModel.findByIdAndDelete(announcementId);

    return NextResponse.json({ message: '公告已刪除' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

