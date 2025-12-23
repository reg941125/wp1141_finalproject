import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// 檢查 admin 權限的中間件
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession?.value === 'authenticated';
}

// 獲取所有用戶
export async function GET() {
  try {
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    await dbConnect();
    const users = await UserModel.find({})
      .select('-password -resetPasswordToken -emailVerificationToken')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 刪除用戶
export async function DELETE(request: Request) {
  try {
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '請提供用戶 ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    await UserModel.findByIdAndDelete(userId);

    return NextResponse.json({ message: '用戶已刪除' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

