import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// GET: 驗證 token 是否有效
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '無效的重設連結' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // token 尚未過期
    });

    if (!user) {
      return NextResponse.json(
        { error: '無效或已過期的重設連結' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// POST: 重設密碼
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: '請提供 token 和新密碼' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少需要 6 個字元' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 查找用戶並驗證 token
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // token 尚未過期
    });

    if (!user) {
      return NextResponse.json(
        { error: '無效或已過期的重設連結' },
        { status: 400 }
      );
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新密碼並清除 reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: '密碼已成功重設',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

