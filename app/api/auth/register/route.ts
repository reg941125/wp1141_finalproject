import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '請填寫所有欄位' },
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

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件已被使用' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: '註冊成功', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    );
  }
}




